export type PerfilUsuario = 'garcom' | 'caixa' | 'gerente' | 'cozinha';

export interface Usuario {
  id: number;
  nome: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: string; // "12.50"
  estoque: number;
  estoque_minimo: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export type StatusComanda = 'aberta' | 'fechada' | 'paga' | 'cancelada';

export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao';

export interface ItemComanda {
  id: number;
  comanda_id: number;
  produto_id: number;
  nome_copiado: string;
  preco_copiado: string; // "12.50"
  quantidade: number;
}

export interface Comanda {
  id: number;
  mesa: string;
  nome_cliente: string | null;
  garcom_id: number;
  status: StatusComanda;
  subtotal: string | null;
  taxa_servico: string | null;
  total: string | null;
  forma_pagamento: FormaPagamento | null;
  aberta_em: string;
  fechada_em: string | null;
  paga_em: string | null;
  itens?: ItemComanda[];
}

export interface ApiErrorDetail {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  erro: ApiErrorDetail;
}

// DTOs de Entrada
export interface CriarUsuarioDto {
  nome: string;
  perfil: PerfilUsuario;
}

export interface CriarProdutoDto {
  nome: string;
  categoria: string;
  preco: string;
  estoque: number;
  estoque_minimo?: number;
}

export interface AbrirComandaDto {
  mesa: string | number;
  garcom_id: number;
  nome_cliente?: string;
}

export interface LancarItemDto {
  produto_id: number;
  quantidade: number;
}

export interface AjustarItemDto {
  quantidade: number;
}

export interface FecharComandaDto {
  aplicar_taxa_servico: boolean;
}

export interface PagarComandaDto {
  forma_pagamento: FormaPagamento;
  documento_cliente?: string | null;
}

export interface ListarComandasFiltros {
  status?: StatusComanda;
  mesa?: string;
  de?: string;
  ate?: string;
  limit?: number;
  offset?: number;
}

export interface ListarProdutosFiltros {
  categoria?: string;
  ativo?: boolean;
}

export interface ListarUsuariosFiltros {
  perfil?: PerfilUsuario;
  ativo?: boolean;
}
