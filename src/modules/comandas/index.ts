import { FastifyPluginAsync } from 'fastify';
import { ClienteBanco, obterPrisma } from '../../shared/prisma';
import { ServicoUsuarios, ServicoUsuariosPrisma } from '../usuarios/servico';
import { ServicoProdutos, ServicoProdutosPrisma } from '../produtos/servico';
import { rotasComandas } from './rotas';
import { ServicoComandas, ServicoComandasPrisma } from './servico';

export interface OpcoesModuloComandas {
  prisma?: ClienteBanco;
  servico?: ServicoComandas;
  servicoUsuarios?: ServicoUsuarios;
  servicoProdutos?: ServicoProdutos;
}

/**
 * Orquestra o ciclo de vida da comanda comunicando-se com Usuários e Produtos
 * apenas por contratos/gateways de serviço.
 */
export const moduloComandas: FastifyPluginAsync<OpcoesModuloComandas> = async (
  fastify,
  opcoes = {},
) => {
  const prisma = opcoes.prisma ?? obterPrisma();
  const servicoUsuarios =
    opcoes.servicoUsuarios ?? new ServicoUsuariosPrisma(prisma);
  const servicoProdutos =
    opcoes.servicoProdutos ?? new ServicoProdutosPrisma(prisma);
  const servico =
    opcoes.servico ??
    new ServicoComandasPrisma(prisma, servicoUsuarios, servicoProdutos);

  await fastify.register(rotasComandas, { servico });
};

export * from './schemas';
export * from './servico';
export * from './rotas';
