import { Prisma } from '@prisma/client';
import { ClienteBanco } from '../../shared/prisma';
import { ErroDominio } from '../../shared/erros';
import type { ServicoUsuarios } from '../usuarios/servico';
import type { ServicoProdutos } from '../produtos/servico';
import { FormaPagamentoTipo, StatusComandaTipo } from './schemas';

export interface ItemComandaEntidade {
  id: number;
  produto_id: number;
  nome_copiado: string;
  preco_copiado: string;
  quantidade: number;
}

export interface ComandaEntidade {
  id: number;
  mesa: string;
  nome_cliente: string | null;
  garcom_id: number;
  status: StatusComandaTipo;
  subtotal: string | null;
  taxa_servico: string | null;
  total: string | null;
  forma_pagamento: FormaPagamentoTipo | null;
  aberta_em: Date;
  fechada_em: Date | null;
  paga_em: Date | null;
  itens: ItemComandaEntidade[];
}

export interface CriarComandaDados {
  mesa: string | number;
  garcom_id: number;
  nome_cliente?: string | null;
}

export interface LancarItemDados {
  produto_id: number;
  quantidade: number;
}

export interface AjustarItemDados {
  quantidade: number;
}

export interface FecharComandaDados {
  aplicar_taxa_servico: boolean;
}

export interface PagarComandaDados {
  forma_pagamento: FormaPagamentoTipo;
  documento_cliente?: string | null;
}

export interface FiltrosListagemComandas {
  status?: StatusComandaTipo;
  mesa?: string;
  de?: string;
  ate?: string;
  limit?: number;
  offset?: number;
}

export interface ServicoComandas {
  abrir(dados: CriarComandaDados): Promise<ComandaEntidade>;
  criar(dados: CriarComandaDados): Promise<ComandaEntidade>;
  listar(filtros?: FiltrosListagemComandas): Promise<ComandaEntidade[]>;
  buscarPorId(id: number): Promise<ComandaEntidade>;
  lancarItem(comandaId: number, dados: LancarItemDados): Promise<ItemComandaEntidade>;
  ajustarItem(
    comandaId: number,
    itemId: number,
    dados: AjustarItemDados,
  ): Promise<ItemComandaEntidade>;
  removerItem(comandaId: number, itemId: number): Promise<void>;
  fechar(id: number, dados: FecharComandaDados): Promise<ComandaEntidade>;
  cancelar(id: number): Promise<ComandaEntidade>;
  pagar(id: number, dados: PagarComandaDados): Promise<ComandaEntidade>;
}

export function formatarValorMonetario(valor: unknown): string {
  if (
    valor !== null &&
    typeof valor === 'object' &&
    'toFixed' in (valor as Record<string, unknown>) &&
    typeof (valor as { toFixed?: unknown }).toFixed === 'function'
  ) {
    return (valor as { toFixed: (casas: number) => string }).toFixed(2);
  }
  if (typeof valor === 'string') {
    const texto = valor.trim();
    if (/^-?\d+(\.\d{1,2})?$/.test(texto)) {
      const [inteiro, decimal = ''] = texto.split('.');
      return `${inteiro}.${decimal.padEnd(2, '0')}`;
    }
    return new Prisma.Decimal(texto).toFixed(2);
  }
  throw ErroDominio.interno('Valor monetário em formato inválido ao serializar comanda.');
}

export function formatarValorMonetarioOpcional(valor: unknown): string | null {
  if (valor === null || valor === undefined) {
    return null;
  }
  return formatarValorMonetario(valor);
}

export function normalizarMesa(mesa: string | number): string {
  if (typeof mesa === 'number') {
    if (!Number.isFinite(mesa) || !Number.isInteger(mesa) || mesa < 1 || mesa > 2147483647) {
      throw ErroDominio.validacao(
        'O número da mesa deve ser um inteiro maior ou igual a 1.',
        {
          mesa: 'O número da mesa deve ser um inteiro maior ou igual a 1.',
        },
      );
    }
    return String(mesa);
  }

  if (typeof mesa === 'string') {
    const mesaLimpa = mesa.trim();
    if (!mesaLimpa) {
      throw ErroDominio.validacao('A identificação da mesa não pode ser vazia.', {
        mesa: 'O campo não pode ser vazio.',
      });
    }
    if (mesaLimpa.length > 50) {
      throw ErroDominio.validacao(
        'A identificação da mesa não pode exceder 50 caracteres.',
        {
          mesa: 'O campo deve ter no máximo 50 caracteres.',
        },
      );
    }
    if (/^(?:[+-]?(?:0+(?:\.\d+)?|\d+\.\d+)|-\d+)$/.test(mesaLimpa)) {
      throw ErroDominio.validacao(
        'O número da mesa deve ser um inteiro maior ou igual a 1.',
        {
          mesa: 'O número da mesa deve ser um inteiro maior ou igual a 1.',
        },
      );
    }
    return mesaLimpa;
  }

  throw ErroDominio.validacao('A identificação da mesa é inválida.', {
    mesa: 'Informe uma string não vazia ou um número inteiro positivo.',
  });
}

export function normalizarNomeCliente(nomeCliente?: string | null): string | null {
  if (nomeCliente === undefined || nomeCliente === null) {
    return null;
  }

  const nomeLimpo = nomeCliente.trim();
  if (!nomeLimpo) {
    return null;
  }

  if (nomeLimpo.length > 100) {
    throw ErroDominio.validacao(
      'O nome do cliente não pode exceder 100 caracteres.',
      {
        nome_cliente: 'O campo deve ter no máximo 100 caracteres.',
      },
    );
  }

  return nomeLimpo;
}

const REGEX_ISO_8601 =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2})))?$/;

export function parsearDataIso8601(valor: string, campo: 'de' | 'ate'): Date {
  const texto = valor.trim();
  const match = REGEX_ISO_8601.exec(texto);

  if (!match) {
    throw ErroDominio.validacao(
      `O parâmetro "${campo}" deve estar em formato ISO 8601 válido.`,
      {
        [campo]: 'Data em formato ISO 8601 inválido.',
      },
    );
  }

  const ano = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  const possuiHorario = match[4] !== undefined;
  const hora = possuiHorario ? Number(match[4]) : 0;
  const minuto = possuiHorario ? Number(match[5]) : 0;
  const segundo = possuiHorario ? Number(match[6]) : 0;
  const offsetHora = match[10] !== undefined ? Number(match[10]) : 0;
  const offsetMinuto = match[11] !== undefined ? Number(match[11]) : 0;

  if (
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > 31 ||
    hora > 23 ||
    minuto > 59 ||
    segundo > 59 ||
    offsetHora > 23 ||
    offsetMinuto > 59
  ) {
    throw ErroDominio.validacao(
      `O parâmetro "${campo}" contém componentes de data/hora fora dos limites válidos.`,
      {
        [campo]: 'Data em formato ISO 8601 inválido.',
      },
    );
  }

  const verificacaoCalendario = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    verificacaoCalendario.getUTCFullYear() !== ano ||
    verificacaoCalendario.getUTCMonth() !== mes - 1 ||
    verificacaoCalendario.getUTCDate() !== dia
  ) {
    throw ErroDominio.validacao(
      `O parâmetro "${campo}" representa uma data de calendário inexistente.`,
      {
        [campo]: 'Data de calendário inválida.',
      },
    );
  }

  if (!possuiHorario) {
    if (campo === 'ate') {
      return new Date(Date.UTC(ano, mes - 1, dia, 23, 59, 59, 999));
    }
    return new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));
  }

  const milissegundos =
    match[7] !== undefined ? match[7].slice(0, 3).padEnd(3, '0') : '000';
  const isoNormalizado = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}.${milissegundos}${match[8]}`;

  const data = new Date(isoNormalizado);
  if (Number.isNaN(data.getTime())) {
    throw ErroDominio.validacao(
      `O parâmetro "${campo}" deve estar em formato ISO 8601 válido.`,
      {
        [campo]: 'Data em formato ISO 8601 inválido.',
      },
    );
  }

  return data;
}

export function ehErroUnicidadePrisma(erro: unknown): boolean {
  if (
    !erro ||
    typeof erro !== 'object' ||
    !('code' in erro) ||
    (erro as { code?: unknown }).code !== 'P2002'
  ) {
    return false;
  }

  const meta = (erro as { meta?: { target?: unknown } }).meta;
  const target = meta?.target;

  if (typeof target === 'string') {
    return (
      target.includes('mesa') ||
      target.includes('comandas_mesa_aberta_unique_idx')
    );
  }

  if (Array.isArray(target)) {
    return target.some(
      (item) =>
        typeof item === 'string' &&
        (item.includes('mesa') ||
          item.includes('comandas_mesa_aberta_unique_idx')),
    );
  }

  return true;
}

interface RegistroItemComandaBanco {
  id: number;
  comanda_id?: number;
  produto_id: number;
  nome_copiado: string;
  preco_copiado: unknown;
  quantidade: number;
}

interface RegistroComandaBanco {
  id: number;
  mesa: string;
  nome_cliente: string | null;
  garcom_id: number;
  status: StatusComandaTipo;
  subtotal: unknown;
  taxa_servico: unknown;
  total: unknown;
  forma_pagamento: FormaPagamentoTipo | null;
  aberta_em: Date;
  fechada_em: Date | null;
  paga_em: Date | null;
  itens?: RegistroItemComandaBanco[];
}

export class ServicoComandasPrisma implements ServicoComandas {
  constructor(
    private readonly prisma: ClienteBanco,
    private readonly servicoUsuarios: ServicoUsuarios,
    private readonly servicoProdutos?: ServicoProdutos,
  ) {}

  private obterRepositorio(cliente: ClienteBanco = this.prisma) {
    if (!cliente.comanda) {
      throw ErroDominio.interno(
        'Repositório de comandas não configurado no cliente do banco.',
      );
    }
    return cliente.comanda;
  }

  private obterRepositorioItens(cliente: ClienteBanco = this.prisma) {
    if (!cliente.itemComanda) {
      throw ErroDominio.interno(
        'Repositório de itens de comanda não configurado no cliente do banco.',
      );
    }
    return cliente.itemComanda;
  }

  private formatarItemComanda(registro: RegistroItemComandaBanco): ItemComandaEntidade {
    return {
      id: registro.id,
      produto_id: registro.produto_id,
      nome_copiado: registro.nome_copiado,
      preco_copiado: formatarValorMonetario(registro.preco_copiado),
      quantidade: registro.quantidade,
    };
  }

  private async executarEmTransacao<T>(
    operacao: (tx: ClienteBanco) => Promise<T>,
  ): Promise<T> {
    if (typeof this.prisma.$transaction === 'function') {
      return this.prisma.$transaction(operacao);
    }
    return operacao(this.prisma);
  }

  private formatarComanda(registro: RegistroComandaBanco): ComandaEntidade {
    const itens = (registro.itens ?? []).map((item) => ({
      id: item.id,
      produto_id: item.produto_id,
      nome_copiado: item.nome_copiado,
      preco_copiado: formatarValorMonetario(item.preco_copiado),
      quantidade: item.quantidade,
    }));

    return {
      id: registro.id,
      mesa: registro.mesa,
      nome_cliente: registro.nome_cliente ?? null,
      garcom_id: registro.garcom_id,
      status: registro.status,
      subtotal: formatarValorMonetarioOpcional(registro.subtotal),
      taxa_servico: formatarValorMonetarioOpcional(registro.taxa_servico),
      total: formatarValorMonetarioOpcional(registro.total),
      forma_pagamento: registro.forma_pagamento ?? null,
      aberta_em: registro.aberta_em,
      fechada_em: registro.fechada_em ?? null,
      paga_em: registro.paga_em ?? null,
      itens,
    };
  }

  async abrir(dados: CriarComandaDados): Promise<ComandaEntidade> {
    const mesaLimpa = normalizarMesa(dados.mesa);
    const nomeCliente = normalizarNomeCliente(dados.nome_cliente);

    if (
      !Number.isFinite(dados.garcom_id) ||
      !Number.isInteger(dados.garcom_id) ||
      dados.garcom_id < 1 ||
      dados.garcom_id > 2147483647
    ) {
      throw ErroDominio.validacao(
        'O identificador do garçom deve ser um número inteiro positivo.',
        {
          garcom_id: 'O identificador do garçom deve ser um inteiro maior ou igual a 1.',
        },
      );
    }

    // Valida o garçom exclusivamente via contrato de serviço de Usuários
    await this.servicoUsuarios.validarGarcom(dados.garcom_id);

    try {
      const comandaCriada = await this.executarEmTransacao(async (tx) => {
        const repo = this.obterRepositorio(tx);

        const comandaAbertaNaMesa = await repo.findFirst({
          where: {
            mesa: mesaLimpa,
            status: 'aberta',
          },
        });

        if (comandaAbertaNaMesa) {
          throw ErroDominio.conflito(
            'MESA_OCUPADA',
            `A mesa "${mesaLimpa}" já possui uma comanda aberta.`,
            {
              mesa: mesaLimpa,
              comanda_id: comandaAbertaNaMesa.id,
            },
          );
        }

        const novaComanda = await repo.create({
          data: {
            mesa: mesaLimpa,
            nome_cliente: nomeCliente,
            garcom_id: dados.garcom_id,
            status: 'aberta',
          },
          include: {
            itens: {
              orderBy: { id: 'asc' },
            },
          },
        });

        return novaComanda as unknown as RegistroComandaBanco;
      });

      return this.formatarComanda(comandaCriada);
    } catch (erro) {
      if (ehErroUnicidadePrisma(erro)) {
        throw ErroDominio.conflito(
          'MESA_OCUPADA',
          `A mesa "${mesaLimpa}" já possui uma comanda aberta.`,
          {
            mesa: mesaLimpa,
          },
        );
      }
      throw erro;
    }
  }

  async criar(dados: CriarComandaDados): Promise<ComandaEntidade> {
    return this.abrir(dados);
  }

  async listar(filtros: FiltrosListagemComandas = {}): Promise<ComandaEntidade[]> {
    const limit = filtros.limit ?? 50;
    if (
      !Number.isFinite(limit) ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 200
    ) {
      throw ErroDominio.validacao(
        'O parâmetro "limit" deve ser um número inteiro entre 1 e 200.',
        {
          limit: 'O limite deve ser um número inteiro entre 1 e 200.',
        },
      );
    }

    const offset = filtros.offset ?? 0;
    if (
      !Number.isFinite(offset) ||
      !Number.isInteger(offset) ||
      offset < 0 ||
      offset > 2147483647
    ) {
      throw ErroDominio.validacao(
        'O parâmetro "offset" deve ser um número inteiro maior ou igual a 0.',
        {
          offset: 'O deslocamento deve ser um número inteiro maior ou igual a 0.',
        },
      );
    }

    const dataDe =
      filtros.de !== undefined ? parsearDataIso8601(filtros.de, 'de') : undefined;
    const dataAte =
      filtros.ate !== undefined ? parsearDataIso8601(filtros.ate, 'ate') : undefined;

    if (dataDe && dataAte && dataDe.getTime() > dataAte.getTime()) {
      throw ErroDominio.validacao(
        'O período informado é inválido: a data inicial ("de") não pode ser maior que a data final ("ate").',
        {
          de: 'A data inicial não pode ser posterior à data final.',
          ate: 'A data final deve ser igual ou posterior à data inicial.',
        },
      );
    }

    const where: {
      status?: StatusComandaTipo;
      mesa?: string;
      aberta_em?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (filtros.status !== undefined) {
      where.status = filtros.status;
    }

    if (filtros.mesa !== undefined) {
      const mesaLimpa = filtros.mesa.trim();
      if (!mesaLimpa) {
        throw ErroDominio.validacao('O filtro de mesa não pode ser vazio.', {
          mesa: 'O filtro de mesa não pode ser vazio.',
        });
      }
      if (mesaLimpa.length > 50) {
        throw ErroDominio.validacao(
          'O filtro de mesa não pode exceder 50 caracteres.',
          {
            mesa: 'O filtro de mesa deve ter no máximo 50 caracteres.',
          },
        );
      }
      where.mesa = mesaLimpa;
    }

    if (dataDe || dataAte) {
      where.aberta_em = {};
      if (dataDe) {
        where.aberta_em.gte = dataDe;
      }
      if (dataAte) {
        where.aberta_em.lte = dataAte;
      }
    }

    const repo = this.obterRepositorio();
    const registros = await repo.findMany({
      where,
      include: {
        itens: {
          orderBy: { id: 'asc' },
        },
      },
      orderBy: [{ aberta_em: 'desc' }, { id: 'desc' }],
      take: limit,
      skip: offset,
    });

    return (registros as unknown as RegistroComandaBanco[]).map((registro) =>
      this.formatarComanda(registro),
    );
  }

  async buscarPorId(id: number): Promise<ComandaEntidade> {
    if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1 || id > 2147483647) {
      throw ErroDominio.validacao(
        'O identificador da comanda deve ser um número inteiro positivo.',
        {
          id: 'O identificador da comanda deve ser um inteiro maior ou igual a 1.',
        },
      );
    }

    const repo = this.obterRepositorio();
    const registro = await repo.findUnique({
      where: { id },
      include: {
        itens: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!registro) {
      throw ErroDominio.naoEncontrado(`Comanda com ID ${id} não encontrada.`, {
        id: 'Comanda não encontrada.',
      });
    }

    return this.formatarComanda(registro as unknown as RegistroComandaBanco);
  }

  async lancarItem(
    comandaId: number,
    dados: LancarItemDados,
  ): Promise<ItemComandaEntidade> {
    if (!Number.isFinite(comandaId) || !Number.isInteger(comandaId) || comandaId < 1) {
      throw ErroDominio.validacao('Identificador de comanda inválido.', {
        id: 'O ID da comanda deve ser um número inteiro maior ou igual a 1.',
      });
    }

    if (
      !Number.isFinite(dados.produto_id) ||
      !Number.isInteger(dados.produto_id) ||
      dados.produto_id < 1
    ) {
      throw ErroDominio.validacao('Identificador de produto inválido.', {
        produto_id: 'O ID do produto deve ser um número inteiro maior ou igual a 1.',
      });
    }

    if (
      !Number.isFinite(dados.quantidade) ||
      !Number.isInteger(dados.quantidade) ||
      dados.quantidade < 1
    ) {
      throw ErroDominio.validacao('Quantidade inválida para lançamento.', {
        quantidade: 'A quantidade deve ser um número inteiro maior ou igual a 1.',
      });
    }

    if (!this.servicoProdutos) {
      throw ErroDominio.interno(
        'Serviço de produtos não configurado no serviço de comandas.',
      );
    }

    return this.executarEmTransacao(async (tx) => {
      const repoComandas = this.obterRepositorio(tx);
      const comanda = await repoComandas.findUnique({
        where: { id: comandaId },
      });

      if (!comanda) {
        throw ErroDominio.naoEncontrado(
          `Comanda com ID ${comandaId} não encontrada.`,
          { comanda_id: 'Comanda não encontrada.' },
        );
      }

      if (comanda.status !== 'aberta') {
        throw ErroDominio.conflito(
          'COMANDA_NAO_ABERTA',
          'Não é possível lançar itens em comanda que não esteja aberta.',
          { comanda_id: comandaId, status: comanda.status },
        );
      }

      const disponibilidade = await this.servicoProdutos!.consultarDisponibilidade(
        dados.produto_id,
        dados.quantidade,
      );

      if (!disponibilidade.ativo) {
        throw ErroDominio.regraNegocio(
          'PRODUTO_INATIVO',
          'Não é possível lançar um produto inativo na comanda.',
          { produto_id: dados.produto_id },
        );
      }

      if (!disponibilidade.disponivel) {
        throw ErroDominio.conflito(
          'ESTOQUE_INSUFICIENTE',
          'Estoque insuficiente para o produto informado.',
          {
            produto_id: dados.produto_id,
            quantidade_solicitada: dados.quantidade,
            estoque_disponivel: disponibilidade.estoque,
          },
        );
      }

      const repoItens = this.obterRepositorioItens(tx);
      const itemCriado = await repoItens.create({
        data: {
          comanda_id: comandaId,
          produto_id: dados.produto_id,
          nome_copiado: disponibilidade.nome,
          preco_copiado: new Prisma.Decimal(disponibilidade.preco),
          quantidade: dados.quantidade,
        },
      });

      return this.formatarItemComanda(itemCriado);
    });
  }

  async ajustarItem(
    comandaId: number,
    itemId: number,
    dados: AjustarItemDados,
  ): Promise<ItemComandaEntidade> {
    if (!Number.isFinite(comandaId) || !Number.isInteger(comandaId) || comandaId < 1) {
      throw ErroDominio.validacao('Identificador de comanda inválido.', {
        id: 'O ID da comanda deve ser um número inteiro maior ou igual a 1.',
      });
    }

    if (!Number.isFinite(itemId) || !Number.isInteger(itemId) || itemId < 1) {
      throw ErroDominio.validacao('Identificador de item inválido.', {
        itemId: 'O ID do item deve ser um número inteiro maior ou igual a 1.',
      });
    }

    if (
      !Number.isFinite(dados.quantidade) ||
      !Number.isInteger(dados.quantidade) ||
      dados.quantidade < 1
    ) {
      throw ErroDominio.validacao('Quantidade inválida para ajuste.', {
        quantidade: 'A quantidade deve ser um número inteiro maior ou igual a 1.',
      });
    }

    if (!this.servicoProdutos) {
      throw ErroDominio.interno(
        'Serviço de produtos não configurado no serviço de comandas.',
      );
    }

    return this.executarEmTransacao(async (tx) => {
      const repoComandas = this.obterRepositorio(tx);
      const comanda = await repoComandas.findUnique({
        where: { id: comandaId },
      });

      if (!comanda) {
        throw ErroDominio.naoEncontrado(
          `Comanda com ID ${comandaId} não encontrada.`,
          { comanda_id: 'Comanda não encontrada.' },
        );
      }

      if (comanda.status !== 'aberta') {
        throw ErroDominio.conflito(
          'COMANDA_NAO_ABERTA',
          'Não é possível ajustar itens em comanda que não esteja aberta.',
          { comanda_id: comandaId, status: comanda.status },
        );
      }

      const repoItens = this.obterRepositorioItens(tx);
      const itemExistente = await repoItens.findFirst({
        where: {
          id: itemId,
          comanda_id: comandaId,
        },
      });

      if (!itemExistente) {
        throw ErroDominio.naoEncontrado(
          `Item com ID ${itemId} não encontrado na comanda ${comandaId}.`,
          { comanda_id: comandaId, item_id: itemId },
        );
      }

      const delta = dados.quantidade - itemExistente.quantidade;
      if (delta > 0) {
        const disponibilidade = await this.servicoProdutos!.consultarDisponibilidade(
          itemExistente.produto_id,
          delta,
        );

        if (!disponibilidade.ativo) {
          throw ErroDominio.regraNegocio(
            'PRODUTO_INATIVO',
            'Não é possível aumentar a quantidade de um produto inativo.',
            { produto_id: itemExistente.produto_id },
          );
        }

        if (!disponibilidade.disponivel) {
          throw ErroDominio.conflito(
            'ESTOQUE_INSUFICIENTE',
            'Estoque insuficiente para o acréscimo solicitado.',
            {
              produto_id: itemExistente.produto_id,
              acrescimo_solicitado: delta,
              estoque_disponivel: disponibilidade.estoque,
            },
          );
        }
      }

      const itemAtualizado = await repoItens.update({
        where: { id: itemId },
        data: { quantidade: dados.quantidade },
      });

      return this.formatarItemComanda(itemAtualizado);
    });
  }

  async removerItem(comandaId: number, itemId: number): Promise<void> {
    if (!Number.isFinite(comandaId) || !Number.isInteger(comandaId) || comandaId < 1) {
      throw ErroDominio.validacao('Identificador de comanda inválido.', {
        id: 'O ID da comanda deve ser um número inteiro maior ou igual a 1.',
      });
    }

    if (!Number.isFinite(itemId) || !Number.isInteger(itemId) || itemId < 1) {
      throw ErroDominio.validacao('Identificador de item inválido.', {
        itemId: 'O ID do item deve ser um número inteiro maior ou igual a 1.',
      });
    }

    return this.executarEmTransacao(async (tx) => {
      const repoComandas = this.obterRepositorio(tx);
      const comanda = await repoComandas.findUnique({
        where: { id: comandaId },
      });

      if (!comanda) {
        throw ErroDominio.naoEncontrado(
          `Comanda com ID ${comandaId} não encontrada.`,
          { comanda_id: 'Comanda não encontrada.' },
        );
      }

      if (comanda.status !== 'aberta') {
        throw ErroDominio.conflito(
          'COMANDA_NAO_ABERTA',
          'Não é possível remover itens de comanda que não esteja aberta.',
          { comanda_id: comandaId, status: comanda.status },
        );
      }

      const repoItens = this.obterRepositorioItens(tx);
      const itemExistente = await repoItens.findFirst({
        where: {
          id: itemId,
          comanda_id: comandaId,
        },
      });

      if (!itemExistente) {
        throw ErroDominio.naoEncontrado(
          `Item com ID ${itemId} não encontrado na comanda ${comandaId}.`,
          { comanda_id: comandaId, item_id: itemId },
        );
      }

      await repoItens.delete({
        where: { id: itemId },
      });
    });
  }

  async fechar(id: number, dados: FecharComandaDados): Promise<ComandaEntidade> {
    if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
      throw ErroDominio.validacao('Identificador de comanda inválido.', {
        id: 'O ID da comanda deve ser um número inteiro maior ou igual a 1.',
      });
    }

    if (
      !dados ||
      typeof dados !== 'object' ||
      typeof dados.aplicar_taxa_servico !== 'boolean'
    ) {
      throw ErroDominio.validacao('Dados de fechamento inválidos.', {
        aplicar_taxa_servico: 'O campo aplicar_taxa_servico deve ser booleano.',
      });
    }

    return this.executarEmTransacao(async (tx) => {
      const repoComandas = this.obterRepositorio(tx);
      const comanda = await repoComandas.findUnique({
        where: { id },
        include: {
          itens: {
            orderBy: { id: 'asc' },
          },
        },
      });

      if (!comanda) {
        throw ErroDominio.naoEncontrado(`Comanda com ID ${id} não encontrada.`, {
          comanda_id: 'Comanda não encontrada.',
        });
      }

      if (comanda.status !== 'aberta') {
        throw ErroDominio.conflito(
          'COMANDA_NAO_ABERTA',
          'Não é possível fechar uma comanda que não esteja aberta.',
          { comanda_id: id, status: comanda.status },
        );
      }

      const itens = comanda.itens ?? [];
      if (itens.length === 0) {
        throw ErroDominio.conflito(
          'COMANDA_SEM_ITENS',
          'Não é possível fechar comanda sem itens lançados.',
          { comanda_id: id },
        );
      }

      let subtotal = new Prisma.Decimal('0.00');
      for (const item of itens) {
        const precoItem = new Prisma.Decimal(item.preco_copiado);
        const subtotalItem = precoItem.mul(item.quantidade);
        subtotal = subtotal.add(subtotalItem);
      }

      let taxaServico = new Prisma.Decimal('0.00');
      if (dados.aplicar_taxa_servico) {
        taxaServico = subtotal
          .mul(new Prisma.Decimal('0.10'))
          .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      }

      const total = subtotal.add(taxaServico);
      const fechadaEm = new Date();

      const comandaFechada = await repoComandas.update({
        where: { id },
        data: {
          status: 'fechada',
          subtotal,
          taxa_servico: taxaServico,
          total,
          fechada_em: fechadaEm,
        },
        include: {
          itens: {
            orderBy: { id: 'asc' },
          },
        },
      });

      return this.formatarComanda(comandaFechada as unknown as RegistroComandaBanco);
    });
  }

  async cancelar(id: number): Promise<ComandaEntidade> {
    if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
      throw ErroDominio.validacao('Identificador de comanda inválido.', {
        id: 'O ID da comanda deve ser um número inteiro maior ou igual a 1.',
      });
    }

    return this.executarEmTransacao(async (tx) => {
      const repoComandas = this.obterRepositorio(tx);
      const comanda = await repoComandas.findUnique({
        where: { id },
        include: {
          itens: {
            orderBy: { id: 'asc' },
          },
        },
      });

      if (!comanda) {
        throw ErroDominio.naoEncontrado(`Comanda com ID ${id} não encontrada.`, {
          comanda_id: 'Comanda não encontrada.',
        });
      }

      if (comanda.status !== 'aberta') {
        throw ErroDominio.conflito(
          'COMANDA_NAO_ABERTA',
          'Apenas comandas abertas podem ser canceladas.',
          { comanda_id: id, status: comanda.status },
        );
      }

      const comandaCancelada = await repoComandas.update({
        where: { id },
        data: {
          status: 'cancelada',
        },
        include: {
          itens: {
            orderBy: { id: 'asc' },
          },
        },
      });

      return this.formatarComanda(
        comandaCancelada as unknown as RegistroComandaBanco,
      );
    });
  }

  async pagar(id: number, dados: PagarComandaDados): Promise<ComandaEntidade> {
    if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
      throw ErroDominio.validacao('Identificador de comanda inválido.', {
        id: 'O ID da comanda deve ser um número inteiro maior ou igual a 1.',
      });
    }

    const formasValidas: FormaPagamentoTipo[] = ['dinheiro', 'pix', 'cartao'];
    if (!dados || !formasValidas.includes(dados.forma_pagamento)) {
      throw ErroDominio.validacao('Forma de pagamento inválida.', {
        forma_pagamento: 'A forma de pagamento deve ser dinheiro, pix ou cartao.',
      });
    }

    if (!this.servicoProdutos) {
      throw ErroDominio.interno(
        'Serviço de produtos não configurado no serviço de comandas.',
      );
    }

    return this.executarEmTransacao(async (tx) => {
      const repoComandas = this.obterRepositorio(tx);
      const comanda = await repoComandas.findUnique({
        where: { id },
        include: {
          itens: {
            orderBy: { id: 'asc' },
          },
        },
      });

      if (!comanda) {
        throw ErroDominio.naoEncontrado(`Comanda com ID ${id} não encontrada.`, {
          comanda_id: 'Comanda não encontrada.',
        });
      }

      if (comanda.status !== 'fechada') {
        throw ErroDominio.conflito(
          'COMANDA_NAO_FECHADA',
          'Apenas comandas com status "fechada" podem receber pagamento.',
          { comanda_id: id, status: comanda.status },
        );
      }

      const itensBaixa = (comanda.itens ?? []).map((item) => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      }));

      if (itensBaixa.length > 0) {
        await this.servicoProdutos!.baixarEstoque(
          {
            comanda_id: id,
            itens: itensBaixa,
          },
          tx,
        );
      }

      const pagaEm = new Date();
      const comandaPaga = await repoComandas.update({
        where: { id },
        data: {
          status: 'paga',
          forma_pagamento: dados.forma_pagamento,
          paga_em: pagaEm,
        },
        include: {
          itens: {
            orderBy: { id: 'asc' },
          },
        },
      });

      return this.formatarComanda(comandaPaga as unknown as RegistroComandaBanco);
    });
  }
}
