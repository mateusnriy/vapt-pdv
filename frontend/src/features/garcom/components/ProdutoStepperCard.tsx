import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { formatCurrency, cn } from '../../../lib/utils';
import type { Produto } from '../../../types/api';

export interface ProdutoStepperCardProps {
  produto: Produto;
  quantidade: number;
  onIncrementar: () => void;
  onDecrementar: () => void;
}

export const ProdutoStepperCard: React.FC<ProdutoStepperCardProps> = ({
  produto,
  quantidade,
  onIncrementar,
  onDecrementar,
}) => {
  const isEsgotado = !produto.ativo || produto.estoque <= 0;
  const isEstoqueBaixo =
    !isEsgotado && produto.estoque <= produto.estoque_minimo && produto.estoque_minimo > 0;

  return (
    <Card
      className={cn(
        'p-3.5 flex items-center justify-between gap-3 bg-surface transition-all duration-150',
        isEsgotado && 'opacity-55 grayscale-[20%] pointer-events-none bg-surface-2',
        quantidade > 0 && 'border-brand ring-1 ring-brand/50 shadow-soft'
      )}
    >
      {/* Informações do Produto */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-xs font-bold text-text truncate block leading-snug">
            {produto.nome}
          </span>
          {isEsgotado && <Badge variant="esgotado" size="sm">Esgotado</Badge>}
          {isEstoqueBaixo && (
            <span className="text-[10px] font-bold text-brand-text bg-brand-soft/70 px-1.5 py-0.2 rounded-full tabular-nums">
              Restam {produto.estoque}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black text-text tabular-nums">
            {formatCurrency(produto.preco)}
          </span>
          <span className="text-[11px] text-text-2 font-medium capitalize">
            {produto.categoria}
          </span>
        </div>
      </div>

      {/* Controles de Quantidade (Stepper Móvel com área de toque >= 44px) */}
      <div className="flex items-center shrink-0">
        {isEsgotado ? (
          <span className="text-xs font-bold text-text-2/60 px-2 py-1 select-none">
            Indisponível
          </span>
        ) : quantidade === 0 ? (
          <button
            type="button"
            onClick={onIncrementar}
            className="min-h-[44px] min-w-[44px] px-3.5 rounded-card bg-surface-2 border border-border hover:bg-brand hover:text-on-brand hover:border-brand flex items-center justify-center gap-1 text-xs font-bold text-text transition-all active:scale-95 shadow-soft select-none"
            aria-label={`Adicionar ${produto.nome}`}
          >
            <Plus className="w-4 h-4 font-bold" />
            <span>Adicionar</span>
          </button>
        ) : (
          <div className="flex items-center rounded-card bg-surface-2 border border-border p-1 gap-1">
            <button
              type="button"
              onClick={onDecrementar}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg bg-surface flex items-center justify-center text-text hover:bg-border/60 transition-colors shadow-soft active:scale-95 select-none"
              aria-label={`Diminuir ${produto.nome}`}
            >
              <Minus className="w-4 h-4 font-bold" />
            </button>

            <span className="w-9 text-center font-black text-sm text-text tabular-nums select-none">
              {quantidade}
            </span>

            <button
              type="button"
              onClick={onIncrementar}
              disabled={quantidade >= produto.estoque}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg bg-brand text-on-brand flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed shadow-soft active:scale-95 select-none"
              aria-label={`Aumentar ${produto.nome}`}
            >
              <Plus className="w-4 h-4 font-bold" />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
