import React from 'react';
import {
  ArrowLeft,
  Clock,
  User,
  Utensils,
  Plus,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useComanda, useFecharComanda } from '../../../hooks/useComandas';
import { formatCurrency, formatElapsedTime } from '../../../lib/utils';
import { ApiError } from '../../../services/apiClient';

export interface ComandaMesaViewProps {
  comandaId: number;
  garcomNome?: string;
  onVoltar: () => void;
  onAdicionarItens: () => void;
  onToast: (tipo: 'sucesso' | 'erro', msg: string) => void;
}

export const ComandaMesaView: React.FC<ComandaMesaViewProps> = ({
  comandaId,
  garcomNome,
  onVoltar,
  onAdicionarItens,
  onToast,
}) => {
  const { data: comanda, isLoading, isError, refetch } = useComanda(comandaId);
  const fecharComandaMut = useFecharComanda();

  if (isLoading) {
    return (
      <div className="p-6 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-text-2">Carregando detalhes da mesa...</p>
      </div>
    );
  }

  if (isError || !comanda) {
    return (
      <div className="p-6 text-center space-y-4 bg-surface border border-danger/30 rounded-card">
        <AlertCircle className="w-8 h-8 text-danger mx-auto" />
        <div>
          <p className="text-sm font-bold text-text">Não foi possível carregar a comanda.</p>
          <p className="text-xs text-text-2 mt-1">Verifique a conexão com o servidor.</p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={onVoltar}>
            Voltar
          </Button>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const isContaPedida = comanda.status === 'fechada';
  const itens = comanda.itens || [];
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  const handlePedirConta = async () => {
    if (itens.length === 0) {
      onToast('erro', 'Não é possível pedir a conta de uma comanda sem itens.');
      return;
    }

    try {
      await fecharComandaMut.mutateAsync({
        comandaId: comanda.id,
        dto: { aplicar_taxa_servico: true },
      });
      onToast('sucesso', `Conta da Mesa ${comanda.mesa} solicitada! Notificação enviada ao Caixa.`);
    } catch (err) {
      let msg = 'Erro ao solicitar fechamento da conta.';
      if (err instanceof ApiError) {
        msg = `${err.codigo}: ${err.message}`;
      }
      onToast('erro', msg);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Barra Superior de Navegação */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onVoltar}
          className="min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-lg flex items-center gap-1.5 text-xs font-bold text-text hover:bg-surface-2 transition-colors active:scale-95 select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mesas</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-text">Mesa {comanda.mesa}</h2>
          <span className="text-[11px] font-medium text-text-2">
            Comanda #{comanda.id}
          </span>
        </div>

        <div>
          {isContaPedida ? (
            <Badge variant="conta_pedida" icon={<Receipt className="w-3 h-3" />}>
              Conta pedida
            </Badge>
          ) : (
            <Badge variant="ocupada" icon={<Clock className="w-3 h-3" />}>
              Em aberto
            </Badge>
          )}
        </div>
      </div>

      {/* Banner de Informações da Mesa */}
      <Card className="p-3.5 bg-surface space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-text" />
            Aberta há {formatElapsedTime(comanda.aberta_em) || 'poucos instantes'}
          </span>
          {comanda.nome_cliente && (
            <span className="font-bold text-text-2 flex items-center gap-1">
              <User className="w-3 h-3" />
              {comanda.nome_cliente}
            </span>
          )}
        </div>

        {garcomNome && (
          <div className="text-[11px] text-text-2 border-t border-border/50 pt-1.5 flex justify-between">
            <span>Atendente responsável:</span>
            <span className="font-bold text-text">{garcomNome}</span>
          </div>
        )}
      </Card>

      {/* Lista de Itens Já Confirmados e Lançados */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-2">
            Itens na Comanda ({totalItens})
          </h3>
          <span className="text-xs font-semibold text-brand-text">Cozinha & Bar</span>
        </div>

        {itens.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-dashed border-border rounded-card space-y-2">
            <Utensils className="w-8 h-8 text-text-2/40 mx-auto" />
            <p className="text-sm font-bold text-text">Nenhum item lançado ainda</p>
            <p className="text-xs text-text-2">
              Toque no botão abaixo para selecionar produtos no cardápio.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {itens.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-surface border border-border rounded-card flex items-center justify-between gap-3 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center font-extrabold text-xs text-text tabular-nums">
                    {item.quantidade}x
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-text leading-snug">
                      {item.nome_copiado}
                    </h4>
                    <span className="text-[11px] text-text-2 tabular-nums">
                      {formatCurrency(item.preco_copiado)} un.
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-text tabular-nums">
                    {formatCurrency(
                      (parseFloat(item.preco_copiado) * item.quantidade).toFixed(2)
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo Financeiro Oficial do Backend */}
      <Card className="p-4 space-y-2 bg-surface">
        <div className="flex justify-between text-xs text-text-2">
          <span>Subtotal</span>
          <span className="font-bold text-text tabular-nums">
            {formatCurrency(comanda.subtotal || '0.00')}
          </span>
        </div>

        {isContaPedida && comanda.taxa_servico && (
          <div className="flex justify-between text-xs text-text-2">
            <span>Taxa de serviço (10%)</span>
            <span className="font-bold text-text tabular-nums">
              {formatCurrency(comanda.taxa_servico)}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-border flex justify-between items-baseline">
          <span className="text-sm font-extrabold text-text">
            {isContaPedida ? 'Total a Pagar' : 'Parcial Acumulado'}
          </span>
          <span className="text-2xl font-black text-text tabular-nums">
            {formatCurrency(comanda.total || comanda.subtotal || '0.00')}
          </span>
        </div>
      </Card>

      {/* Barra de Ações Fixa no Rodapé da Tela */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-bg/95 backdrop-blur-md border-t border-border z-30">
        <div className="max-w-md mx-auto flex gap-2">
          {!isContaPedida && (
            <Button
              type="button"
              variant="outline"
              size="action"
              className="flex-1 bg-surface"
              leftIcon={<Receipt className="w-4 h-4" />}
              onClick={handlePedirConta}
              isLoading={fecharComandaMut.isPending}
              disabled={itens.length === 0}
            >
              Pedir Conta
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="action"
            className={isContaPedida ? 'w-full' : 'flex-1'}
            leftIcon={!isContaPedida ? <Plus className="w-5 h-5 font-bold" /> : undefined}
            onClick={onAdicionarItens}
            disabled={isContaPedida || comanda.status !== 'aberta'}
          >
            {isContaPedida ? 'Conta Pedida (Aguardando Pagamento)' : '+ Adicionar Itens'}
          </Button>
        </div>
      </div>
    </div>
  );
};
