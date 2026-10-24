import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Minus,
  Trash2,
  User,
  Clock,
  Receipt,
  ChevronDown,
} from 'lucide-react';
import type { Comanda, ItemComanda } from '../../../types/api';
import { formatCurrency, formatElapsedTime } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';
import {
  useComanda,
  useAjustarItem,
  useRemoverItem,
  useFecharComanda,
} from '../../../hooks/useComandas';
import { ApiError } from '../../../services/apiClient';

export interface PainelComandaProps {
  comandaAtivaId: number | null;
  comandasDisponiveis: Comanda[];
  onSelecionarComanda: (comandaId: number) => void;
  onAbrirModalPagamento: (comanda: Comanda) => void;
  onAbrirModalCliente: () => void;
  nomeCliente?: string;
  documentoCliente?: string;
  onToast: (tipo: 'sucesso' | 'erro', mensagem: string) => void;
  taxa10: boolean;
  onTaxa10Change: (aplicar: boolean) => void;
}

export const PainelComanda: React.FC<PainelComandaProps> = ({
  comandaAtivaId,
  comandasDisponiveis,
  onSelecionarComanda,
  onAbrirModalPagamento,
  onAbrirModalCliente,
  nomeCliente,
  onToast,
  taxa10,
  onTaxa10Change,
}) => {
  const { data: comandaAtualizada } = useComanda(comandaAtivaId);
  const ajustarItemMut = useAjustarItem();
  const removerItemMut = useRemoverItem();
  const fecharComandaMut = useFecharComanda();

  const [itemMutatingId, setItemMutatingId] = useState<number | null>(null);

  // Comanda efetiva (detalhes frescos do useComanda ou item da lista de salão)
  const comanda: Comanda | null =
    comandaAtualizada ||
    comandasDisponiveis.find((c) => c.id === comandaAtivaId) ||
    null;

  const itens: ItemComanda[] = comanda?.itens || [];
  const possuiItens = itens.length > 0;
  const isFechada = comanda?.status === 'fechada';
  const isPaga = comanda?.status === 'paga';

  // Subtotal calculado a partir dos itens copiados ou vindo da API
  const subtotalNumero = itens.reduce((acc, it) => {
    const preco = parseFloat(it.preco_copiado || '0');
    return acc + preco * it.quantidade;
  }, 0);

  // Taxa de 10% estimada se aberta, ou valor congelado se fechada
  const taxaEstimada = taxa10 ? Math.round(subtotalNumero * 10) / 100 : 0;
  const totalEstimado = subtotalNumero + taxaEstimada;

  // Valores a exibir: se a comanda já tem valores gravados pela API, respeita a API
  const subtotalExibido = comanda?.subtotal
    ? parseFloat(comanda.subtotal)
    : subtotalNumero;
  const taxaExibida =
    comanda?.taxa_servico !== null && comanda?.taxa_servico !== undefined
      ? parseFloat(comanda.taxa_servico)
      : taxaEstimada;
  const totalExibido = comanda?.total
    ? parseFloat(comanda.total)
    : totalEstimado;

  // Aumentar quantidade (+1) com trava contra duplo clique
  const handleIncrementar = async (item: ItemComanda) => {
    if (!comanda || isFechada || isPaga || itemMutatingId !== null) return;
    setItemMutatingId(item.id);
    try {
      await ajustarItemMut.mutateAsync({
        comandaId: comanda.id,
        itemId: item.id,
        dto: { quantidade: item.quantidade + 1 },
      });
    } catch (err) {
      onToast(
        'erro',
        err instanceof ApiError ? err.message : 'Erro ao ajustar quantidade do item.'
      );
    } finally {
      setItemMutatingId(null);
    }
  };

  // Diminuir quantidade (-1) ou remover se chegar a zero
  const handleDecrementar = async (item: ItemComanda) => {
    if (!comanda || isFechada || isPaga || itemMutatingId !== null) return;
    setItemMutatingId(item.id);
    try {
      if (item.quantidade <= 1) {
        await removerItemMut.mutateAsync({
          comandaId: comanda.id,
          itemId: item.id,
        });
        onToast('sucesso', `${item.nome_copiado} removido da comanda.`);
      } else {
        await ajustarItemMut.mutateAsync({
          comandaId: comanda.id,
          itemId: item.id,
          dto: { quantidade: item.quantidade - 1 },
        });
      }
    } catch (err) {
      onToast(
        'erro',
        err instanceof ApiError ? err.message : 'Erro ao ajustar item.'
      );
    } finally {
      setItemMutatingId(null);
    }
  };

  // Remover item diretamente pela lixeira
  const handleRemover = async (item: ItemComanda) => {
    if (!comanda || isFechada || isPaga || itemMutatingId !== null) return;
    setItemMutatingId(item.id);
    try {
      await removerItemMut.mutateAsync({
        comandaId: comanda.id,
        itemId: item.id,
      });
      onToast('sucesso', `${item.nome_copiado} removido da comanda.`);
    } catch (err) {
      onToast(
        'erro',
        err instanceof ApiError ? err.message : 'Erro ao remover item.'
      );
    } finally {
      setItemMutatingId(null);
    }
  };

  // Alternar switch de taxa 10%
  const handleToggleTaxa10 = (aplicar: boolean) => {
    if (isFechada || isPaga || !possuiItens) return;
    onTaxa10Change(aplicar);
  };

  // Disparo do fluxo de Cobrança / Fechamento
  const handleCobrarClick = async () => {
    if (!comanda) {
      onToast('erro', 'Nenhuma mesa ou comanda selecionada.');
      return;
    }
    if (!possuiItens) {
      onToast('erro', 'A comanda está sem itens. Adicione itens antes de cobrar.');
      return;
    }

    // Se comanda já está fechada, abre o modal de pagamento diretamente
    if (comanda.status === 'fechada') {
      onAbrirModalPagamento(comanda);
      return;
    }

    // Se comanda ainda estiver 'aberta', executa o fechamento na API primeiro
    try {
      const comandaFechada = await fecharComandaMut.mutateAsync({
        comandaId: comanda.id,
        dto: { aplicar_taxa_servico: taxa10 },
      });
      onToast('sucesso', `Mesa ${comanda.mesa} fechada para conferência e pagamento.`);
      onAbrirModalPagamento(comandaFechada);
    } catch (err) {
      onToast(
        'erro',
        err instanceof ApiError
          ? `${err.codigo}: ${err.message}`
          : 'Erro ao fechar comanda para cobrança.'
      );
    }
  };

  return (
    <aside
      className="w-[440px] min-w-[440px] max-w-[440px] h-full flex flex-col overflow-hidden bg-surface border-l border-border select-none z-10"
      aria-label="Painel de Conferência de Comanda"
    >
      {/* 1. Header do Painel: Seletor de Mesa e Dados do Atendimento */}
      <div className="p-4 border-b border-border bg-surface shrink-0 flex flex-col gap-3">
        {/* Seletor Rápido de Mesa Ativa (Alt+M) */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <label htmlFor="seletor-mesa" className="sr-only">
              Seletor de Mesa / Comanda
            </label>
            <select
              id="seletor-mesa"
              value={comandaAtivaId || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) onSelecionarComanda(id);
              }}
              className="w-full min-h-[44px] pl-3 pr-8 py-2 rounded-input bg-surface-2 border border-border text-text font-bold text-sm focus:outline-none focus:border-text focus:ring-1 focus:ring-text appearance-none cursor-pointer"
            >
              {comandasDisponiveis.length === 0 ? (
                <option value="">Nenhuma mesa em atendimento</option>
              ) : (
                comandasDisponiveis.map((c) => (
                  <option key={c.id} value={c.id}>
                    Mesa {c.mesa} (Comanda #{c.id}) — {c.status === 'fechada' ? 'Conta Pedida' : 'Aberta'}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-text-2 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Botão Cliente / CPF (F4) */}
          <button
            onClick={onAbrirModalCliente}
            className="min-h-[44px] px-3 py-2 rounded-input bg-surface-2 border border-border text-text hover:bg-border/40 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            title="Vincular Cliente ou CPF na Conta (F4)"
          >
            <User className="w-3.5 h-3.5 text-brand" />
            <span className="hidden sm:inline">
              {nomeCliente ? nomeCliente.split(' ')[0] : 'Cliente (F4)'}
            </span>
          </button>
        </div>

        {/* Resumo da Mesa Selecionada */}
        {comanda ? (
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-text tracking-tight">
                  Mesa {comanda.mesa}
                </h2>
                <span className="text-xs font-mono text-text-2">#{comanda.id}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-2 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-text-2" />
                <span>Aberta há {formatElapsedTime(comanda.aberta_em) || '1 min'}</span>
                {comanda.nome_cliente && (
                  <>
                    <span>·</span>
                    <span className="font-medium truncate max-w-[140px]">
                      {comanda.nome_cliente}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              {comanda.status === 'aberta' && (
                <Badge variant="ocupada" size="sm">
                  Em Aberto
                </Badge>
              )}
              {comanda.status === 'fechada' && (
                <Badge variant="conta_pedida" size="sm">
                  Conta Pedida
                </Badge>
              )}
              {comanda.status === 'paga' && (
                <Badge variant="livre" size="sm">
                  Paga
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-text-2 italic">
            Selecione uma mesa acima ou lance itens pelo catálogo.
          </div>
        )}
      </div>

      {/* 2. Lista de Itens da Comanda com Rolagem Flexível Antissobreposição */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {comanda && possuiItens ? (
          itens.map((item) => {
            const precoUnitario = parseFloat(item.preco_copiado || '0');
            const subtotalLinha = precoUnitario * item.quantidade;
            const isItemBusy = itemMutatingId === item.id;

            return (
              <div
                key={item.id}
                className="p-3 rounded-card bg-surface-2/60 border border-border/80 flex items-center justify-between gap-3 text-xs transition-colors hover:bg-surface-2"
              >
                {/* Nome do Item e Preço Unitário */}
                <div className="flex-1 min-w-0 pr-1">
                  <span className="font-bold text-text text-sm block truncate" title={item.nome_copiado}>
                    {item.nome_copiado}
                  </span>
                  <span className="text-[11px] text-text-2 tabular-nums">
                    {formatCurrency(precoUnitario)} cada
                  </span>
                </div>

                {/* Controles de Quantidade e Subtotal */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Stepper (+ / - / Lixeira) */}
                  {!isFechada && !isPaga ? (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center rounded-input bg-surface border border-border p-0.5 shadow-sm">
                        <button
                          onClick={() => handleDecrementar(item)}
                          disabled={isItemBusy}
                          className="w-7 h-7 flex items-center justify-center rounded-btn text-text-2 hover:text-text hover:bg-surface-2 transition-colors disabled:opacity-40"
                          title={item.quantidade === 1 ? 'Remover item' : 'Diminuir 1'}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-7 text-center font-bold text-xs text-text tabular-nums">
                          {item.quantidade}
                        </span>

                        <button
                          onClick={() => handleIncrementar(item)}
                          disabled={isItemBusy}
                          className="w-7 h-7 flex items-center justify-center rounded-btn text-text-2 hover:text-text hover:bg-surface-2 transition-colors disabled:opacity-40"
                          title="Adicionar mais 1"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemover(item)}
                        disabled={isItemBusy}
                        className="w-7 h-7 flex items-center justify-center rounded-btn text-text-2 hover:text-danger hover:bg-danger-soft transition-colors disabled:opacity-40"
                        title="Remover item da comanda"
                        aria-label="Excluir item"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-text bg-surface px-2.5 py-1 rounded-full border border-border tabular-nums text-xs">
                      {item.quantidade}x
                    </span>
                  )}

                  {/* Subtotal da Linha */}
                  <span className="font-extrabold text-sm text-text tabular-nums min-w-[72px] text-right">
                    {formatCurrency(subtotalLinha)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-2">
            <Receipt className="w-10 h-10 text-text-2/40 mb-2" />
            <p className="text-sm font-bold text-text">Comanda vazia</p>
            <p className="text-xs text-text-2 max-w-xs mt-1">
              Toque nos produtos do catálogo ao lado para lançar pedidos nesta mesa.
            </p>
          </div>
        )}
      </div>

      {/* 3. Bloco Financeiro Fixo no Rodapé (Sticky em Telas 1440x900) */}
      <div className="border-t border-border p-4 bg-surface space-y-3 shrink-0 shadow-soft">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-xs text-text-2">
          <span>Subtotal</span>
          <span className="tabular-nums font-semibold text-text text-sm">
            {formatCurrency(subtotalExibido)}
          </span>
        </div>

        {/* Switch da Gorjeta 10% */}
        <div className="flex justify-between items-center text-xs text-text-2 pt-1 border-t border-border/40">
          <div
            className="flex items-center gap-2"
            title={
              isFechada
                ? 'Conta já fechada. Gorjeta definida no fechamento.'
                : !possuiItens
                ? 'Adicione itens para calcular a taxa.'
                : undefined
            }
          >
            <ToggleSwitch
              checked={isFechada ? (parseFloat(comanda?.taxa_servico || '0') > 0) : taxa10}
              onChange={handleToggleTaxa10}
              disabled={!possuiItens || isFechada || isPaga}
            />
            <span className="font-medium text-text">Gorjeta 10% (Garçom)</span>
          </div>
          <span className="tabular-nums font-semibold text-text text-sm">
            {isFechada
              ? formatCurrency(taxaExibida)
              : taxa10
              ? formatCurrency(taxaExibida)
              : 'R$ 0,00'}
          </span>
        </div>

        {/* Total da Conta */}
        <div className="flex justify-between items-baseline pt-2 border-t border-border">
          <div>
            <span className="text-xs uppercase font-bold text-text-2 tracking-wider block">
              Total a Pagar
            </span>
            <span className="text-[11px] text-text-2">
              {comanda?.status === 'aberta' ? 'Estimado (conferência)' : 'Fechada pelo caixa'}
            </span>
          </div>
          <span className="text-3xl font-black text-text tabular-nums tracking-tight">
            {formatCurrency(totalExibido)}
          </span>
        </div>

        {/* Botão Primário Cobrar de 68px */}
        <button
          onClick={handleCobrarClick}
          disabled={!comanda || !possuiItens || fecharComandaMut.isPending || isPaga}
          className={`w-full h-[68px] min-h-[68px] px-6 rounded-card font-black text-lg flex items-center justify-between transition-all duration-150 select-none shadow-soft active:scale-[0.99] ${
            !comanda || !possuiItens || isPaga
              ? 'bg-surface-2 text-text-2/60 cursor-not-allowed border border-border'
              : 'bg-brand text-on-brand hover:opacity-95 cursor-pointer'
          }`}
          title="Fechar comanda e abrir tela de pagamento (F8)"
          aria-label="Cobrar comanda"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-input bg-on-brand/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-on-brand" />
            </div>
            <div className="text-left">
              <span className="block leading-none">
                {fecharComandaMut.isPending ? 'Fechando Conta...' : 'Cobrar (F8)'}
              </span>
              <span className="text-xs font-semibold opacity-80 leading-tight">
                {comanda?.status === 'fechada' ? 'Abrir pagamento' : 'Fechar & quitar'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl tabular-nums font-black leading-none block">
              {formatCurrency(totalExibido)}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
