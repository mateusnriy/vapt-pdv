import React from 'react';
import { CheckCircle2, Printer, Check, Receipt } from 'lucide-react';
import type { Comanda, ItemComanda } from '../../../types/api';
import { formatCurrency } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

export interface ParcelaPagamento {
  id: string;
  forma: 'dinheiro' | 'pix' | 'cartao';
  subtipo?: 'credito' | 'debito';
  valorCentavos: number;
  valorRecebidoCentavos?: number;
  trocoCentavos?: number;
}

export interface ComprovanteVendaProps {
  comanda: Comanda;
  parcelas: ParcelaPagamento[];
  nomeOperador?: string;
  documentoCliente?: string;
  onNovaVenda: () => void;
}

export const ComprovanteVenda: React.FC<ComprovanteVendaProps> = ({
  comanda,
  parcelas,
  nomeOperador = 'Caixa 01',
  documentoCliente,
  onNovaVenda,
}) => {
  const itens: ItemComanda[] = comanda.itens || [];

  const dataFormatada = new Date(comanda.paga_em || Date.now()).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleImprimir = () => {
    window.print();
  };

  const totalCentavos = parcelas.reduce((acc, p) => acc + p.valorCentavos, 0);
  const totalPagoFormatado = formatCurrency(totalCentavos / 100);
  const trocoTotalCentavos = parcelas.reduce((acc, p) => acc + (p.trocoCentavos || 0), 0);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 text-text animate-fadeIn">
      {/* Regras de Isolamento de Impressão Térmica 80mm */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cupom-fiscal-venda, #cupom-fiscal-venda * {
            visibility: visible !important;
          }
          #cupom-fiscal-venda {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 8px !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

      {/* Marco de Sucesso */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-success-soft text-success flex items-center justify-center mb-2 shadow-soft">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-text">Venda Concluída!</h2>
        <p className="text-xs text-text-2 mt-0.5">
          Comanda #{comanda.id} (Mesa {comanda.mesa}) quitada com sucesso e estoque baixado.
        </p>
      </div>

      {/* Recibo Térmico Estilizado (ReceiptView - DESIGN.md §5 / §13) */}
      <div
        id="cupom-fiscal-venda"
        className="w-full max-w-[360px] bg-white text-[#2B2019] p-5 rounded-card border border-border shadow-modal font-mono text-xs select-none"
      >
        {/* Cabeçalho do Recibo */}
        <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
          <div className="flex items-center justify-center gap-1.5 font-sans font-black text-base text-[#2B2019]">
            <Receipt className="w-4 h-4 text-brand" />
            <span>VaptPDV BAR & RESTAURANTE</span>
          </div>
          <p className="text-[11px] text-gray-600 mt-0.5">Ponto de Venda Ágil e Inteligente</p>
          <div className="mt-2 text-[11px] text-gray-700 flex justify-between">
            <span>DATA: {dataFormatada}</span>
            <span>MESA: {comanda.mesa}</span>
          </div>
          <div className="text-[11px] text-gray-700 flex justify-between mt-0.5">
            <span>COMANDA: #{comanda.id}</span>
            <span>OPERADOR: {nomeOperador}</span>
          </div>
          {documentoCliente && (
            <div className="text-[11px] text-gray-700 text-left mt-0.5">
              <span>CPF/CNPJ: {documentoCliente}</span>
            </div>
          )}
        </div>

        {/* Lista de Itens Consumidos */}
        <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
          <div className="flex justify-between font-bold text-[11px] uppercase text-gray-500 mb-1">
            <span>Item / Qtd</span>
            <span>Subtotal</span>
          </div>
          <div className="space-y-1">
            {itens.map((it) => {
              const unit = parseFloat(it.preco_copiado || '0');
              const sub = unit * it.quantidade;
              return (
                <div key={it.id} className="flex justify-between items-baseline text-[11px]">
                  <span className="truncate pr-2">
                    {it.quantidade}x {it.nome_copiado}
                  </span>
                  <span className="tabular-nums font-bold shrink-0">
                    {formatCurrency(sub)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="border-b border-dashed border-gray-400 pb-3 mb-3 space-y-1 text-[11px]">
          <div className="flex justify-between text-gray-700">
            <span>SUBTOTAL:</span>
            <span className="tabular-nums font-bold">
              {formatCurrency(comanda.subtotal || totalPagoFormatado)}
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>GORJETA / TAXA 10%:</span>
            <span className="tabular-nums font-bold">
              {formatCurrency(comanda.taxa_servico || '0.00')}
            </span>
          </div>
          <div className="flex justify-between items-baseline font-bold text-sm text-[#2B2019] pt-1 border-t border-gray-300">
            <span>TOTAL PAGO:</span>
            <span className="tabular-nums text-base font-black">
              {formatCurrency(comanda.total || totalPagoFormatado)}
            </span>
          </div>
        </div>

        {/* Formas de Pagamento e Splits */}
        <div className="border-b border-dashed border-gray-400 pb-3 mb-3 text-[11px] space-y-1">
          <span className="font-bold uppercase text-gray-500 block mb-0.5">
            Pagamentos Realizados:
          </span>
          {parcelas.map((parc, index) => {
            const rotulo =
              parc.forma === 'dinheiro'
                ? 'Dinheiro'
                : parc.forma === 'pix'
                ? 'Pix Dinâmico'
                : parc.subtipo === 'debito'
                ? 'Cartão de Débito'
                : 'Cartão de Crédito';

            return (
              <div key={index} className="flex justify-between items-baseline">
                <span>{rotulo}:</span>
                <span className="tabular-nums font-bold">
                  {formatCurrency(parc.valorCentavos / 100)}
                </span>
              </div>
            );
          })}

          {/* Troco se houver (soma total de troco de todas as parcelas) */}
          {trocoTotalCentavos > 0 && (
            <div className="flex justify-between text-success-text font-bold pt-1">
              <span>TROCO DEVOLVIDO:</span>
              <span className="tabular-nums">
                {formatCurrency(trocoTotalCentavos / 100)}
              </span>
            </div>
          )}
        </div>

        {/* Rodapé Obrigatório do Recibo */}
        <div className="text-center text-[10px] text-gray-500 space-y-1">
          <p className="font-semibold uppercase">
            Comprovante de consumo. Não é documento fiscal.
          </p>
          <p className="text-[9px]">Obrigado pela preferência! Volte sempre.</p>
        </div>
      </div>

      {/* Botões de Ação Final */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-[360px]">
        <Button
          variant="outline"
          leftIcon={<Printer className="w-4 h-4" />}
          onClick={handleImprimir}
          className="flex-1"
        >
          Imprimir Recibo
        </Button>
        <Button
          variant="primary"
          leftIcon={<Check className="w-4 h-4" />}
          onClick={onNovaVenda}
          className="flex-1 font-bold"
        >
          Nova Venda
        </Button>
      </div>
    </div>
  );
};
