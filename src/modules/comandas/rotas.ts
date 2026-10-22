import { FastifyPluginAsync } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { RespostaErroSchema } from '../../shared/erros';
import {
  AjustarItemBodySchema,
  ComandaSchema,
  CriarComandaBodySchema,
  FecharComandaBodySchema,
  ItemComandaSchema,
  LancarItemBodySchema,
  ListarComandasQuerySchema,
  PagarComandaBodySchema,
  ParametroIdComandaSchema,
  ParametroItemComandaSchema,
} from './schemas';
import { ComandaEntidade, ServicoComandas } from './servico';

export interface OpcoesRotasComandas {
  servico: ServicoComandas;
}

export function serializarComanda(comanda: ComandaEntidade) {
  return {
    id: comanda.id,
    mesa: comanda.mesa,
    nome_cliente: comanda.nome_cliente,
    garcom_id: comanda.garcom_id,
    status: comanda.status,
    subtotal: comanda.subtotal,
    taxa_servico: comanda.taxa_servico,
    total: comanda.total,
    forma_pagamento: comanda.forma_pagamento,
    aberta_em:
      comanda.aberta_em instanceof Date
        ? comanda.aberta_em.toISOString()
        : String(comanda.aberta_em),
    fechada_em:
      comanda.fechada_em === null
        ? null
        : comanda.fechada_em instanceof Date
          ? comanda.fechada_em.toISOString()
          : String(comanda.fechada_em),
    paga_em:
      comanda.paga_em === null
        ? null
        : comanda.paga_em instanceof Date
          ? comanda.paga_em.toISOString()
          : String(comanda.paga_em),
    itens: comanda.itens.map((item) => ({
      id: item.id,
      produto_id: item.produto_id,
      nome_copiado: item.nome_copiado,
      preco_copiado: item.preco_copiado,
      quantidade: item.quantidade,
    })),
  };
}

export const rotasComandas: FastifyPluginAsync<OpcoesRotasComandas> = async (
  fastify,
  opcoes,
) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const servico = opcoes.servico;

  app.post(
    '/comandas',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Abrir nova comanda',
        description:
          'Abre uma nova comanda em uma mesa livre com um garçom responsável ativo.',
        body: CriarComandaBodySchema,
        response: {
          201: ComandaSchema,
          400: RespostaErroSchema,
          409: RespostaErroSchema,
          422: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      const comanda = await servico.abrir(request.body);
      return reply.status(201).send(serializarComanda(comanda));
    },
  );

  app.get(
    '/comandas',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Listar comandas',
        description:
          'Lista comandas ordenadas da mais recente para a mais antiga, com suporte a filtros combinados por status, mesa e período de abertura.',
        querystring: ListarComandasQuerySchema,
        response: {
          200: Type.Array(ComandaSchema),
          400: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      const comandas = await servico.listar(request.query);
      return reply.send(comandas.map(serializarComanda));
    },
  );

  app.get(
    '/comandas/:id',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Consultar detalhes da comanda',
        description:
          'Retorna os detalhes de uma comanda específica e a lista de seus itens.',
        params: ParametroIdComandaSchema,
        response: {
          200: ComandaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      const comanda = await servico.buscarPorId(request.params.id);
      return reply.send(serializarComanda(comanda));
    },
  );

  app.post(
    '/comandas/:id/itens',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Lançar item na comanda',
        description:
          'Lança um novo item em uma comanda aberta, congelando nome e preço unitário no momento do lançamento.',
        params: ParametroIdComandaSchema,
        body: LancarItemBodySchema,
        response: {
          201: ItemComandaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          409: RespostaErroSchema,
          422: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      const item = await servico.lancarItem(request.params.id, request.body);
      return reply.status(201).send(item);
    },
  );

  app.patch(
    '/comandas/:id/itens/:itemId',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Ajustar quantidade de item da comanda',
        description:
          'Ajusta a quantidade de um item já lançado em uma comanda aberta, validando estoque adicional se houver acréscimo.',
        params: ParametroItemComandaSchema,
        body: AjustarItemBodySchema,
        response: {
          200: ItemComandaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          409: RespostaErroSchema,
          422: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      const item = await servico.ajustarItem(
        request.params.id,
        request.params.itemId,
        request.body,
      );
      return reply.status(200).send(item);
    },
  );

  app.delete(
    '/comandas/:id/itens/:itemId',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Remover item da comanda',
        description:
          'Remove um item lançado em uma comanda aberta.',
        params: ParametroItemComandaSchema,
        response: {
          204: Type.Null({ description: 'Item removido com sucesso' }),
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          409: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      await servico.removerItem(request.params.id, request.params.itemId);
      return reply.status(204).send(null);
    },
  );

  app.post(
    '/comandas/:id/fechar',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Fechar comanda',
        description:
          'Fecha uma comanda aberta calculando subtotal, taxa de serviço opcional de 10% com arredondamento HALF_UP e valor total.',
        params: ParametroIdComandaSchema,
        body: FecharComandaBodySchema,
        response: {
          200: ComandaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          409: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      const comanda = await servico.fechar(request.params.id, request.body);
      return reply.status(200).send(serializarComanda(comanda));
    },
  );

  app.post(
    '/comandas/:id/cancelar',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Cancelar comanda',
        description:
          'Cancela uma comanda aberta sem movimentar estoque e liberando a mesa.',
        params: ParametroIdComandaSchema,
        response: {
          200: ComandaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          409: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      const comanda = await servico.cancelar(request.params.id);
      return reply.status(200).send(serializarComanda(comanda));
    },
  );

  app.post(
    '/comandas/:id/pagar',
    {
      schema: {
        tags: ['Comandas'],
        summary: 'Pagar comanda',
        description:
          'Registra o pagamento de uma comanda fechada (dinheiro, pix ou cartao), transicionando para paga e realizando a baixa transacional de estoque dos itens.',
        params: ParametroIdComandaSchema,
        body: PagarComandaBodySchema,
        response: {
          200: ComandaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          409: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => {
      const comanda = await servico.pagar(request.params.id, request.body);
      return reply.status(200).send(serializarComanda(comanda));
    },
  );
};
