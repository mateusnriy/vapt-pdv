import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app';
import { ClienteBanco } from '../src/shared/prisma';

function criarPrismaMock(): ClienteBanco {
  return {
    $queryRaw: vi.fn(async () => [{ '?column?': 1 }]),
    $disconnect: vi.fn(async () => undefined),
  };
}

describe('Interface Web/PWA do PDV Core (Story 10 - CAP-13)', () => {
  it('GET / retorna 200 com o HTML da aplicação Web/PWA', async () => {
    const app = await buildApp({ prisma: criarPrismaMock(), logger: false });

    const resposta = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.headers['content-type']).toMatch(/text\/html/);
    expect(resposta.body).toContain('VaptPDV');
    expect(
      resposta.body.includes('<div id="root"></div>') ||
        resposta.body.includes('Modo Garçom')
    ).toBe(true);

    await app.close();
  });

  it('GET /garcom retorna 200 com o HTML da aplicação', async () => {
    const app = await buildApp({ prisma: criarPrismaMock(), logger: false });

    const resposta = await app.inject({
      method: 'GET',
      url: '/garcom',
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.headers['content-type']).toMatch(/text\/html/);
    expect(
      resposta.body.includes('<div id="root"></div>') ||
        resposta.body.includes('Salão Operacional')
    ).toBe(true);

    await app.close();
  });

  it('GET /caixa retorna 200 com o HTML da aplicação', async () => {
    const app = await buildApp({ prisma: criarPrismaMock(), logger: false });

    const resposta = await app.inject({
      method: 'GET',
      url: '/caixa',
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.headers['content-type']).toMatch(/text\/html/);
    expect(
      resposta.body.includes('<div id="root"></div>') ||
        resposta.body.includes('caixa-workspace')
    ).toBe(true);

    await app.close();
  });

  it('Entrega de assets estáticos ou manifesto PWA', async () => {
    const app = await buildApp({ prisma: criarPrismaMock(), logger: false });

    const resPwa = await app.inject({ method: 'GET', url: '/manifest.webmanifest' });
    const resCss = await app.inject({ method: 'GET', url: '/css/style.css' });

    expect([resPwa.statusCode, resCss.statusCode]).toContain(200);

    await app.close();
  });

  it('Entrega de scripts ou ícones da aplicação client-side', async () => {
    const app = await buildApp({ prisma: criarPrismaMock(), logger: false });

    const resIcon = await app.inject({ method: 'GET', url: '/icon-192.png' });
    const resJs = await app.inject({ method: 'GET', url: '/js/app.js' });

    expect([resIcon.statusCode, resJs.statusCode]).toContain(200);

    await app.close();
  });

  it('Rota estática ou API inexistente continua retornando 404 padronizado', async () => {
    const app = await buildApp({ prisma: criarPrismaMock(), logger: false });

    const resposta = await app.inject({
      method: 'GET',
      url: '/arquivo-inexistente.xyz',
    });

    expect(resposta.statusCode).toBe(404);
    const corpo = resposta.json();
    expect(corpo.erro.codigo).toBe('NAO_ENCONTRADO');

    await app.close();
  });
});
