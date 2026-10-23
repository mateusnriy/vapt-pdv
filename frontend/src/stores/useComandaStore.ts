import { create } from 'zustand';
import type { LancarItemDto } from '../types/api';

export interface ItemCarrinho {
  produtoId: number;
  nome: string;
  preco: string;
  quantidade: number;
}

interface ComandaStoreState {
  mesaAtiva: string | null;
  comandaAtivaId: number | null;
  carrinho: Record<number, ItemCarrinho>;

  setMesaAtiva: (mesa: string | null) => void;
  setComandaAtivaId: (id: number | null) => void;
  incrementarItem: (produtoId: number, nome: string, preco: string) => void;
  decrementarItem: (produtoId: number) => void;
  limparCarrinho: () => void;
  obterTotalItensCarrinho: () => number;
  obterItensParaLote: () => LancarItemDto[];
}

export const useComandaStore = create<ComandaStoreState>((set, get) => ({
  mesaAtiva: null,
  comandaAtivaId: null,
  carrinho: {},

  setMesaAtiva: (mesaAtiva) => set({ mesaAtiva }),
  setComandaAtivaId: (comandaAtivaId) => set({ comandaAtivaId }),

  incrementarItem: (produtoId, nome, preco) =>
    set((state) => {
      const atual = state.carrinho[produtoId] || {
        produtoId,
        nome,
        preco,
        quantidade: 0,
      };
      return {
        carrinho: {
          ...state.carrinho,
          [produtoId]: {
            ...atual,
            quantidade: atual.quantidade + 1,
          },
        },
      };
    }),

  decrementarItem: (produtoId) =>
    set((state) => {
      const atual = state.carrinho[produtoId];
      if (!atual || atual.quantidade <= 0) return state;

      if (atual.quantidade === 1) {
        const { [produtoId]: _, ...resto } = state.carrinho;
        return { carrinho: resto };
      }

      return {
        carrinho: {
          ...state.carrinho,
          [produtoId]: {
            ...atual,
            quantidade: atual.quantidade - 1,
          },
        },
      };
    }),

  limparCarrinho: () => set({ carrinho: {} }),

  obterTotalItensCarrinho: () => {
    const itens = Object.values(get().carrinho);
    return itens.reduce((acc, curr) => acc + curr.quantidade, 0);
  },

  obterItensParaLote: () => {
    const itens = Object.values(get().carrinho);
    return itens
      .filter((i) => i.quantidade > 0)
      .map((i) => ({
        produto_id: i.produtoId,
        quantidade: i.quantidade,
      }));
  },
}));
