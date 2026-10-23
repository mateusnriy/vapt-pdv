import React, { useState, useMemo } from 'react';
import { Search, Utensils } from 'lucide-react';
import { MesaCard } from './MesaCard';
import { Input } from '../../../components/ui/Input';
import type { Comanda, Usuario } from '../../../types/api';

export type FiltroMesa = 'todas' | 'minhas' | 'livres' | 'ocupadas' | 'conta_pedida';

export interface MesasGridProps {
  comandas: Comanda[];
  garcomLogadoId?: number | null;
  garcons?: Usuario[];
  mesaSelecionadaId?: number | null;
  totalMesasSalao?: number;
  onAbrirMesa: (numeroMesa: string) => void;
  onVerComanda: (comanda: Comanda) => void;
}

export const MesasGrid: React.FC<MesasGridProps> = ({
  comandas,
  garcomLogadoId,
  garcons,
  mesaSelecionadaId,
  totalMesasSalao = 12,
  onAbrirMesa,
  onVerComanda,
}) => {
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroMesa>('todas');
  const [busca, setBusca] = useState('');

  // Mapeamento de id do garçom -> nome para exibição rápida
  const garcomMap = useMemo(() => {
    const map = new Map<number, string>();
    garcons?.forEach((g) => map.set(g.id, g.nome));
    return map;
  }, [garcons]);

  // Lista de mesas do salão (ex: 1 até totalMesasSalao)
  const todasMesas = useMemo(() => {
    const lista: string[] = [];
    for (let i = 1; i <= totalMesasSalao; i++) {
      lista.push(String(i));
    }
    // Inclui mesas de comandas abertas que tenham números acima de totalMesasSalao (ex: mesa 15 ou balcão)
    comandas.forEach((c) => {
      if (!lista.includes(String(c.mesa))) {
        lista.push(String(c.mesa));
      }
    });
    return lista;
  }, [totalMesasSalao, comandas]);

  // Mapa de mesa -> comanda aberta/fechada
  const comandaPorMesa = useMemo(() => {
    const map = new Map<string, Comanda>();
    comandas.forEach((cmd) => {
      // Prioriza comandas ativas (aberta ou fechada/conta pedida)
      if (cmd.status === 'aberta' || cmd.status === 'fechada') {
        map.set(String(cmd.mesa), cmd);
      }
    });
    return map;
  }, [comandas]);

  // Contadores para os filtros
  const contadores = useMemo(() => {
    let ocupadas = 0;
    let contaPedida = 0;
    let minhas = 0;

    todasMesas.forEach((m) => {
      const cmd = comandaPorMesa.get(m);
      if (cmd) {
        if (cmd.status === 'fechada') contaPedida++;
        else if (cmd.status === 'aberta') ocupadas++;

        if (garcomLogadoId && cmd.garcom_id === garcomLogadoId) {
          minhas++;
        }
      }
    });

    const livres = todasMesas.length - (ocupadas + contaPedida);

    return {
      todas: todasMesas.length,
      ocupadas,
      contaPedida,
      livres,
      minhas,
    };
  }, [todasMesas, comandaPorMesa, garcomLogadoId]);

  // Filtra as mesas conforme seleção de chips e busca textual
  const mesasFiltradas = useMemo(() => {
    return todasMesas.filter((numMesa) => {
      const cmd = comandaPorMesa.get(numMesa);

      // Filtro de busca por número ou nome do cliente
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const bateuNumero = numMesa.toLowerCase().includes(termo);
        const bateuCliente = cmd?.nome_cliente?.toLowerCase().includes(termo);
        if (!bateuNumero && !bateuCliente) return false;
      }

      // Filtro de categorias
      if (filtroAtivo === 'livres') return !cmd;
      if (filtroAtivo === 'ocupadas') return cmd?.status === 'aberta';
      if (filtroAtivo === 'conta_pedida') return cmd?.status === 'fechada';
      if (filtroAtivo === 'minhas') return cmd && garcomLogadoId && cmd.garcom_id === garcomLogadoId;

      return true;
    });
  }, [todasMesas, comandaPorMesa, filtroAtivo, busca, garcomLogadoId]);

  const chips: { key: FiltroMesa; label: string; count: number }[] = [
    { key: 'todas', label: 'Todas', count: contadores.todas },
    { key: 'ocupadas', label: 'Ocupadas', count: contadores.ocupadas },
    { key: 'livres', label: 'Livres', count: contadores.livres },
    { key: 'conta_pedida', label: 'Conta Pedida', count: contadores.contaPedida },
    ...(garcomLogadoId ? [{ key: 'minhas' as FiltroMesa, label: 'Minhas', count: contadores.minhas }] : []),
  ];

  return (
    <div className="space-y-3">
      {/* Barra de Filtros e Busca Rápida */}
      <div className="space-y-2">
        <Input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar mesa ou cliente..."
          leftIcon={<Search className="w-4 h-4" />}
          className="bg-surface"
        />

        {/* Carrossel Horizontal de Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {chips.map((chip) => {
            const isActive = filtroAtivo === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFiltroAtivo(chip.key)}
                className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'bg-brand text-on-brand shadow-soft ring-2 ring-brand/30'
                    : 'bg-surface border border-border text-text hover:bg-border/30'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                    isActive ? 'bg-black/15 text-on-brand' : 'bg-surface-2 text-text-2'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade de Mesas (2 colunas mobile) */}
      {mesasFiltradas.length === 0 ? (
        <div className="p-8 text-center bg-surface border border-dashed border-border rounded-card">
          <Utensils className="w-8 h-8 text-text-2/40 mx-auto mb-2" />
          <p className="text-sm font-bold text-text">Nenhuma mesa encontrada</p>
          <p className="text-xs text-text-2 mt-0.5">Tente ajustar a busca ou o filtro selecionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-20">
          {mesasFiltradas.map((numMesa) => {
            const cmd = comandaPorMesa.get(numMesa);
            const nomeGarcom = cmd ? garcomMap.get(cmd.garcom_id) : undefined;
            const isSelected = cmd?.id === mesaSelecionadaId;

            return (
              <MesaCard
                key={numMesa}
                mesaNumero={numMesa}
                comanda={cmd}
                garcomNome={nomeGarcom}
                isSelected={isSelected}
                onAbrirMesa={onAbrirMesa}
                onVerComanda={onVerComanda}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
