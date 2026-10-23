import { PerfilUsuarioTipo } from './schemas';

export type { PerfilUsuarioTipo };

/**
 * Entidade de Domínio: Usuario
 * Representa o modelo puro de um operador/usuário no sistema VaptPDV.
 */
export interface UsuarioEntidade {
  id: number;
  nome: string;
  perfil: PerfilUsuarioTipo;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

/**
 * Filtros aceitos para consulta paginada de usuários
 */
export interface FiltrosListagemUsuarios {
  perfil?: PerfilUsuarioTipo;
  ativo?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Contrato de retorno da validação de garçom para abertura de comanda
 */
export interface GarcomValido {
  id: number;
  nome: string;
  valido: true;
}

/**
 * Dados de entrada para criação de usuário
 */
export interface CriarUsuarioDados {
  nome: string;
  perfil: PerfilUsuarioTipo;
}

/**
 * Dados de entrada para atualização parcial de usuário
 */
export interface AtualizarUsuarioDados {
  nome?: string;
  perfil?: PerfilUsuarioTipo;
}
