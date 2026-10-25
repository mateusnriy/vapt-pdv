import { FastifyPluginAsync } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { RespostaErroSchema } from '../../shared/erros';
import {
  AtualizarUsuarioBodySchema,
  CriarUsuarioBodySchema,
  ListarUsuariosQuerySchema,
  UsuarioIdParamsSchema,
  UsuarioRespostaSchema,
  ValidarGarcomRespostaSchema,
} from './schemas';
import { ServicoUsuarios } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

export interface OpcoesRotasUsuarios {
  servico: ServicoUsuarios;
  controller?: UsuariosController;
}

export const rotasUsuarios: FastifyPluginAsync<OpcoesRotasUsuarios> = async (
  fastify,
  opcoes,
) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const controller = opcoes.controller ?? new UsuariosController(opcoes.servico);

  app.post(
    '/usuarios',
    {
      schema: {
        tags: ['Usuários'],
        summary: 'Cadastrar novo usuário',
        description: 'Cadastra um novo usuário no sistema com perfil garcom, caixa, gerente ou cozinha.',
        body: CriarUsuarioBodySchema,
        response: {
          201: UsuarioRespostaSchema,
          400: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => controller.criar(request, reply),
  );

  app.get(
    '/usuarios',
    {
      schema: {
        tags: ['Usuários'],
        summary: 'Listar usuários',
        description: 'Lista usuários com suporte a paginação e filtros opcionais por perfil e situação.',
        querystring: ListarUsuariosQuerySchema,
        response: {
          200: Type.Array(UsuarioRespostaSchema),
          400: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => controller.listar(request, reply),
  );

  app.get(
    '/usuarios/:id',
    {
      schema: {
        tags: ['Usuários'],
        summary: 'Buscar usuário por ID',
        description: 'Retorna os detalhes de um usuário pelo seu identificador único.',
        params: UsuarioIdParamsSchema,
        response: {
          200: UsuarioRespostaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => controller.buscarPorId(request, reply),
  );

  app.patch(
    '/usuarios/:id',
    {
      schema: {
        tags: ['Usuários'],
        summary: 'Atualizar usuário parcialmente',
        description: 'Atualiza o nome e/ou o perfil de um usuário existente.',
        params: UsuarioIdParamsSchema,
        body: AtualizarUsuarioBodySchema,
        response: {
          200: UsuarioRespostaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => controller.atualizar(request, reply),
  );

  app.post(
    '/usuarios/:id/inativar',
    {
      schema: {
        tags: ['Usuários'],
        summary: 'Inativar usuário',
        description: 'Inativa um usuário de forma idempotente, mantendo o histórico no banco de dados.',
        params: UsuarioIdParamsSchema,
        response: {
          200: UsuarioRespostaSchema,
          400: RespostaErroSchema,
          404: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => controller.inativar(request, reply),
  );

  app.get(
    '/usuarios/:id/validar-garcom',
    {
      schema: {
        tags: ['Usuários'],
        summary: 'Validar garçom ativo (Interna)',
        description:
          'Rota interna para validação de garçom ativo na abertura de comanda. Retorna 200 se válido ou 422 se inexistente, inativo ou perfil inválido.',
        params: UsuarioIdParamsSchema,
        response: {
          200: ValidarGarcomRespostaSchema,
          400: RespostaErroSchema,
          422: RespostaErroSchema,
          500: RespostaErroSchema,
        },
      },
    },
    async (request, reply) => controller.validarGarcom(request, reply),
  );
};
