import { ClienteBanco } from '../../shared/prisma';
import type { ServicoUsuarios } from '../usuarios/servico';
import type { ServicoProdutos } from '../produtos/servico';
import { ComandasRepositoryPrisma } from './comandas.repository';
import { ComandasService } from './comandas.service';

export * from './comanda.entity';
export * from './comandas.repository';
export * from './comandas.service';
export * from './comandas.controller';

/**
 * Adaptador / Implementação padrão que amarra o ComandasService ao ComandasRepositoryPrisma.
 * Mantém total retrocompatibilidade com o restante do sistema, módulo de comandas e suítes de testes existentes.
 */
export class ServicoComandasPrisma extends ComandasService {
  constructor(
    prisma: ClienteBanco,
    servicoUsuarios: ServicoUsuarios,
    servicoProdutos?: ServicoProdutos,
  ) {
    super(new ComandasRepositoryPrisma(prisma), servicoUsuarios, servicoProdutos);
  }
}
