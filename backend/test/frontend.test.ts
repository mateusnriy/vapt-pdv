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
    expect(resposta.body).toContain('Modo Garçom');
    expect(resposta.body).toContain('Modo Caixa');

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
    expect(resposta.body).toContain('Salão Operacional');

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
    expect(resposta.body).toContain('caixa-workspace');

    await app.close();
  });

  it('GET /css/style.css retorna 200 com o CSS e tokens do DESIGN.md', async () => {
    const app = await buildApp({ prisma: criarPrismaMock(), logger: false });

    const resposta = await app.inject({
      method: 'GET',
      url: '/css/style.css',
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.headers['content-type']).toMatch(/text\/css/);
    expect(resposta.body).toContain('--brand: #F2A81D');
    expect(resposta.body).toContain('--text: #2B2019');
    expect(resposta.body).toContain('--bg: #FBF7F1');
    expect(resposta.body).toContain('tabular-nums');

    await app.close();
  });

  it('GET /js/app.js retorna 200 com o script da aplicação client-side', async () => {
    const app = await buildApp({ prisma: criarPrismaMock(), logger: false });

    const resposta = await app.inject({
      method: 'GET',
      url: '/js/app.js',
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.body).toContain('VaptPDV — Frontend Web/PWA do PDV Core');

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
