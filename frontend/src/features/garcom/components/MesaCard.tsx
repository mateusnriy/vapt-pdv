import React from 'react';
import { Clock, User, Receipt } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { formatCurrency, formatElapsedTime, cn } from '../../../lib/utils';
import type { Comanda } from '../../../types/api';

export interface MesaCardProps {
  mesaNumero: number | string;
  comanda?: Comanda | null;
  garcomNome?: string;
  isSelected?: boolean;
  onAbrirMesa: (numeroMesa: string) => void;
  onVerComanda: (comanda: Comanda) => void;
}

export const MesaCard: React.FC<MesaCardProps> = ({
  mesaNumero,
  comanda,
  garcomNome,
  isSelected = false,
  onAbrirMesa,
  onVerComanda,
}) => {
  const numFormatado =
    typeof mesaNumero === 'number' && mesaNumero < 10
      ? `0${mesaNumero}`
      : String(mesaNumero);

  const isContaPedida = comanda?.status === 'fechada';
  const isOcupada = comanda?.status === 'aberta';
  const isLivre = !comanda || (comanda.status !== 'aberta' && comanda.status !== 'fechada');

  const handleClick = () => {
    if (isLivre) {
      onAbrirMesa(String(mesaNumero));
    } else if (comanda) {
      onVerComanda(comanda);
    }
  };

  return (
    <Card
      interactive
      onClick={handleClick}
      className={cn(
        'relative flex flex-col justify-between p-4 min-h-[140px] transition-all duration-150',
        isLivre && 'border-dashed border-border-2 bg-surface hover:border-brand/40',
        isOcupada &&
          'border-brand/70 bg-surface shadow-soft hover:shadow-card active:scale-[0.99]',
        isContaPedida &&
          'border-danger/80 ring-2 ring-danger/30 bg-surface shadow-soft active:scale-[0.99]',
        isSelected && 'ring-2 ring-brand border-brand'
      )}
    >
      {/* Topo do Card: Número da Mesa e Badge de Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-text leading-tight tracking-tight">
            Mesa {numFormatado}
          </span>
          {comanda?.nome_cliente && (
            <span className="text-xs font-semibold text-text-2 truncate max-w-[110px] flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3 shrink-0" />
              {comanda.nome_cliente}
            </span>
          )}
        </div>

        {isLivre && <Badge variant="livre">Livre</Badge>}
        {isOcupada && (
          <Badge variant="ocupada" icon={<Clock className="w-3 h-3" />}>
            Ocupada
          </Badge>
        )}
        {isContaPedida && (
          <Badge variant="conta_pedida" icon={<Receipt className="w-3 h-3" />}>
            Conta pedida
          </Badge>
        )}
      </div>

      {/* Conteúdo Central e Rodapé do Card */}
      <div className="mt-3 pt-2 border-t border-border/60 flex items-end justify-between">
        {isLivre ? (
          <div className="flex items-center gap-1.5 text-xs text-text-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-success shrink-0" />
            <span>Toque para abrir</span>
          </div>
        ) : (
          <>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-text-2 flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0 text-text-2/80" />
                {formatElapsedTime(comanda?.aberta_em) || 'Recém aberta'}
              </span>
              {garcomNome && (
                <span className="text-[11px] text-text-2 truncate max-w-[100px] block">
                  {garcomNome}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-text-2 tracking-wider block">
                {isContaPedida ? 'Total' : 'Consumo'}
              </span>
              <span className="text-base font-extrabold text-text tabular-nums leading-none">
                {formatCurrency(comanda?.total ?? comanda?.subtotal ?? '0.00')}
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
