import { ClienteBanco } from '../../shared/prisma';
import { ProdutosRepositoryPrisma } from './produtos.repository';
import { ProdutosService, ServicoProdutos } from './produtos.service';

export * from './produtos.entity';
export * from './produtos.repository';
export * from './produtos.service';

/**
 * Adaptador / Implementação padrão que conecta o ProdutosService ao ProdutosRepositoryPrisma.
 * Mantém total retrocompatibilidade com o restante do sistema, módulo de comandas e suítes de testes existentes.
 */
export class ServicoProdutosPrisma extends ProdutosService {
  constructor(prisma: ClienteBanco) {
    super(new ProdutosRepositoryPrisma(prisma));
  }
}