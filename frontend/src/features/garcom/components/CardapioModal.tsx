import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Send, Utensils } from 'lucide-react';
import { ProdutoStepperCard } from './ProdutoStepperCard';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useProdutosDisponiveis } from '../../../hooks/useProdutos';
import { useLancarItem } from '../../../hooks/useComandas';
import { useComandaStore } from '../../../stores/useComandaStore';
import { formatCurrency } from '../../../lib/utils';
import { ApiError } from '../../../services/apiClient';

export interface CardapioModalProps {
  isOpen: boolean;
  mesaNumero: string;
  comandaId: number;
  onClose: () => void;
  onSucessoEnvio: (quantidadeItens: number) => void;
  onErrorToast: (mensagem: string) => void;
}

export const CardapioModal: React.FC<CardapioModalProps> = ({
  isOpen,
  mesaNumero,
  comandaId,
  onClose,
  onSucessoEnvio,
  onErrorToast,
}) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');
  const [busca, setBusca] = useState('');

  const { data: produtos, isLoading: isLoadingProdutos } = useProdutosDisponiveis();
  const lancarItemMut = useLancarItem();

  const {
    carrinho,
    incrementarItem,
    decrementarItem,
    removerItemCarrinho,
    obterTotalItensCarrinho,
    obterItensParaLote,
  } = useComandaStore();

  // Lista de categorias distintas extraídas dos produtos
  const categorias = useMemo(() => {
    if (!produtos) return ['todas'];
    const setCat = new Set<string>();
    produtos.forEach((p) => {
      if (p.categoria) setCat.add(p.categoria.toLowerCase());
    });
    return ['todas', ...Array.from(setCat)];
  }, [produtos]);

  // Produtos filtrados por categoria e termo de busca
  const produtosFiltrados = useMemo(() => {
    if (!produtos) return [];

    return produtos.filter((prod) => {
      if (categoriaAtiva !== 'todas' && prod.categoria.toLowerCase() !== categoriaAtiva) {
        return false;
      }

      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const bateuNome = prod.nome.toLowerCase().includes(termo);
        const bateuCat = prod.categoria.toLowerCase().includes(termo);
        if (!bateuNome && !bateuCat) return false;
      }

      return true;
    });
  }, [produtos, categoriaAtiva, busca]);

  const totalItensLote = obterTotalItensCarrinho();

  // Subtotal aproximado dos itens em seleção no carrinho local
  const valorTotalLote = useMemo(() => {
    let total = 0;
    Object.values(carrinho).forEach((item) => {
      total += parseFloat(item.preco || '0') * item.quantidade;
    });
    return total;
  }, [carrinho]);

  const handleEnviarLote = async () => {
    const itens = obterItensParaLote();
    if (itens.length === 0) {
      onErrorToast('Selecione ao menos 1 item para enviar.');
      return;
    }

    let enviadosComSucesso = 0;
    try {
      for (const item of itens) {
        await lancarItemMut.mutateAsync({
          comandaId,
          dto: item,
        });
        removerItemCarrinho(item.produto_id);
        enviadosComSucesso++;
      }

      onSucessoEnvio(enviadosComSucesso);
      onClose();
    } catch (err) {
      let msg = 'Erro ao enviar itens para a cozinha.';
      if (err instanceof ApiError) {
        if (err.codigo === 'ESTOQUE_INSUFICIENTE') {
          msg = 'Estoque insuficiente para um ou mais itens selecionados.';
        } else {
          msg = `${err.codigo}: ${err.message}`;
        }
      }
      onErrorToast(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col animate-fadeIn">
      {/* Barra Superior Fixa */}
      <div className="p-3 bg-surface border-b border-border shadow-soft flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-lg flex items-center gap-1.5 text-xs font-bold text-text hover:bg-surface-2 transition-colors active:scale-95 select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black text-text">Cardápio · Mesa {mesaNumero}</h2>
          <span className="text-[11px] font-medium text-text-2">
            Selecione itens com os seletores (+ / -)
          </span>
        </div>

        <div className="w-10" />
      </div>

      {/* Área de Filtros e Busca */}
      <div className="p-3 bg-surface-2 border-b border-border space-y-2 shrink-0">
        <Input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto pelo nome..."
          leftIcon={<Search className="w-4 h-4" />}
          className="bg-surface"
        />

        {/* Carrossel de Categorias */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {categorias.map((cat) => {
            const isActive = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAtiva(cat)}
                className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold shrink-0 capitalize transition-all select-none ${
                  isActive
                    ? 'bg-brand text-on-brand shadow-soft ring-2 ring-brand/30'
                    : 'bg-surface border border-border text-text hover:bg-border/30'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Produtos com Steppers */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-28">
        {isLoadingProdutos ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-text-2">Carregando cardápio...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-dashed border-border rounded-card">
            <Utensils className="w-8 h-8 text-text-2/40 mx-auto mb-2" />
            <p className="text-sm font-bold text-text">Nenhum produto encontrado</p>
            <p className="text-xs text-text-2 mt-0.5">Tente selecionar outra categoria ou termo de busca.</p>
          </div>
        ) : (
          produtosFiltrados.map((produto) => {
            const qtdNoCarrinho = carrinho[produto.id]?.quantidade || 0;

            return (
              <ProdutoStepperCard
                key={produto.id}
                produto={produto}
                quantidade={qtdNoCarrinho}
                onIncrementar={() =>
                  incrementarItem(produto.id, produto.nome, produto.preco)
                }
                onDecrementar={() => decrementarItem(produto.id)}
              />
            );
          })
        )}
      </div>

      {/* Barra de Rodapé Fixa (Floating Bottom Action - 60px) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border shadow-modal z-20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-black text-text tabular-nums">
              {totalItensLote} {totalItensLote === 1 ? 'item novo' : 'itens novos'}
            </span>
            <span className="text-xs font-extrabold text-brand-text tabular-nums">
              {formatCurrency(valorTotalLote.toFixed(2))}
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="action"
            className="flex-1 h-[54px] min-h-[50px] text-sm font-black shadow-card active:scale-[0.98]"
            leftIcon={<Send className="w-5 h-5 font-bold" />}
            onClick={handleEnviarLote}
            isLoading={lancarItemMut.isPending}
            disabled={totalItensLote === 0 || lancarItemMut.isPending}
          >
            {lancarItemMut.isPending ? 'Enviando Pedido...' : 'Enviar para a Cozinha'}
          </Button>
        </div>
      </div>
    </div>
  );
};
