import { FastifyPluginAsync } from 'fastify';
import { ClienteBanco, obterPrisma } from '../../shared/prisma';
import { rotasUsuarios } from './rotas';
import { ServicoUsuarios } from './usuarios.service';
import { UsuariosRepositoryPrisma } from './usuarios.repository';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

export interface OpcoesModuloUsuarios {
  prisma?: ClienteBanco;
  servico?: ServicoUsuarios;
  controller?: UsuariosController;
}

export const moduloUsuarios: FastifyPluginAsync<OpcoesModuloUsuarios> = async (
  fastify,
  opcoes,
) => {
  const prisma = opcoes.prisma ?? obterPrisma();
  const repositorio = new UsuariosRepositoryPrisma(prisma);
  const servico = opcoes.servico ?? new UsuariosService(repositorio);
  const controller = opcoes.controller ?? new UsuariosController(servico);

  await fastify.register(rotasUsuarios, { servico, controller });
};

export * from './usuario.entity';
export * from './usuarios.repository';
export * from './usuarios.service';
export * from './usuarios.controller';
export * from './schemas';
export * from './servico';
export * from './rotas';
