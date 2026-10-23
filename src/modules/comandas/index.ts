import { FastifyPluginAsync } from 'fastify';
import { ClienteBanco, obterPrisma } from '../../shared/prisma';
import { ServicoUsuarios, ServicoUsuariosPrisma } from '../usuarios/servico';
import { ServicoProdutos, ServicoProdutosPrisma } from '../produtos/servico';
import { rotasComandas } from './rotas';
import { IComandasRepository, ComandasRepositoryPrisma } from './comandas.repository';
import { ComandasService, ServicoComandas } from './comandas.service';
import { ComandasController } from './comandas.controller';

export interface OpcoesModuloComandas {
  prisma?: ClienteBanco;
  repositorio?: IComandasRepository;
  servico?: ServicoComandas;
  controller?: ComandasController;
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
  const repositorio =
    opcoes.repositorio ?? new ComandasRepositoryPrisma(prisma);
  const servico =
    opcoes.servico ??
    new ComandasService(repositorio, servicoUsuarios, servicoProdutos);
  const controller =
    opcoes.controller ?? new ComandasController(servico);

  await fastify.register(rotasComandas, { servico, controller });
};

export * from './comanda.entity';
export * from './comandas.repository';
export * from './comandas.service';
export * from './comandas.controller';
export * from './schemas';
export * from './servico';
export * from './rotas';
