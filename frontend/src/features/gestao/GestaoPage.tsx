import { useState } from 'react';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  ShoppingBag,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';
import { useProdutosDisponiveis } from '../../hooks/useProdutos';
import { formatCurrency } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';

export function GestaoPage() {
  const { nomeOperador, logout } = useSessionStore();
  const { data: produtos } = useProdutosDisponiveis();
  const [abaAtiva, setAbaAtiva] = useState<'visao_geral' | 'estoque' | 'curva_abc'>('visao_geral');

  const produtosAbaixoDoMinimo = (produtos || []).filter(
    (p) => p.estoque <= (p.estoque_minimo || 0),
  );

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Topo Operacional da Gestão */}
      <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 sm:px-6 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-input bg-text text-bg flex items-center justify-center font-black shadow-soft">
              <BarChart3 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight">Painel de Gestão & BI</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-surface-2 text-text-2 border border-border">
                  Administração
                </span>
              </div>
              <p className="text-xs text-text-2">Visão Executiva, Desempenho e Ruptura de Estoque</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>{nomeOperador}</span>
            </div>

            <button
              onClick={logout}
              title="Trocar Operador"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger-soft rounded-full transition-colors border border-danger/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* 4 Cards de KPIs Executivos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-card p-4 shadow-soft">
            <div className="flex items-center justify-between text-text-2 text-xs font-bold mb-1">
              <span>Faturamento Bruto</span>
              <DollarSign className="w-4 h-4 text-brand" />
            </div>
            <div className="text-2xl font-black text-text tabular-nums">R$ 3.842,50</div>
            <div className="text-[11px] text-success font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18% vs. semana anterior</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-card p-4 shadow-soft">
            <div className="flex items-center justify-between text-text-2 text-xs font-bold mb-1">
              <span>Comandas Atendidas</span>
              <ShoppingBag className="w-4 h-4 text-brand" />
            </div>
            <div className="text-2xl font-black text-text tabular-nums">42</div>
            <div className="text-[11px] text-text-2 mt-1">Ticket médio de R$ 91,48</div>
          </div>

          <div className="bg-surface border border-border rounded-card p-4 shadow-soft">
            <div className="flex items-center justify-between text-text-2 text-xs font-bold mb-1">
              <span>Taxa de Serviço (10%)</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-black text-text tabular-nums">R$ 349,30</div>
            <div className="text-[11px] text-text-2 mt-1">Repasse estimado da equipe</div>
          </div>

          <div className="bg-surface border border-border rounded-card p-4 shadow-soft">
            <div className="flex items-center justify-between text-text-2 text-xs font-bold mb-1">
              <span>Alertas de Estoque</span>
              <AlertOctagon className="w-4 h-4 text-danger" />
            </div>
            <div className="text-2xl font-black text-danger tabular-nums">
              {produtosAbaixoDoMinimo.length} produtos
            </div>
            <div className="text-[11px] text-danger font-bold mt-1">Abaixo do estoque mínimo</div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            onClick={() => setAbaAtiva('visao_geral')}
            className={`px-4 py-2 rounded-btn text-xs font-bold transition-all ${
              abaAtiva === 'visao_geral'
                ? 'bg-brand text-on-brand shadow-soft'
                : 'bg-surface text-text-2 hover:bg-surface-2'
            }`}
          >
            Visão Geral & Meios de Pagamento
          </button>
          <button
            onClick={() => setAbaAtiva('estoque')}
            className={`px-4 py-2 rounded-btn text-xs font-bold transition-all ${
              abaAtiva === 'estoque'
                ? 'bg-brand text-on-brand shadow-soft'
                : 'bg-surface text-text-2 hover:bg-surface-2'
            }`}
          >
            Alertas de Estoque ({produtosAbaixoDoMinimo.length})
          </button>
          <button
            onClick={() => setAbaAtiva('curva_abc')}
            className={`px-4 py-2 rounded-btn text-xs font-bold transition-all ${
              abaAtiva === 'curva_abc'
                ? 'bg-brand text-on-brand shadow-soft'
                : 'bg-surface text-text-2 hover:bg-surface-2'
            }`}
          >
            Curva ABC de Produtos
          </button>
        </div>

        {/* Conteúdo da Aba */}
        {abaAtiva === 'visao_geral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-card-lg p-5 shadow-soft">
              <h3 className="font-extrabold text-base text-text mb-3">
                Distribuição de Meios de Pagamento
              </h3>
              <p className="text-xs text-text-2 mb-4">
                Total acumulado por modalidade no fechamento do caixa.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Pix Dinâmico</span>
                    <span className="tabular-nums">48% (R$ 1.844,40)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: '48%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Cartão de Crédito / Débito</span>
                    <span className="tabular-nums">38% (R$ 1.460,15)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: '38%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Dinheiro em Espécie</span>
                    <span className="tabular-nums">14% (R$ 537,95)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-text-2 rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-card-lg p-5 shadow-soft">
              <h3 className="font-extrabold text-base text-text mb-3">
                Desempenho da Equipe de Salão
              </h3>
              <p className="text-xs text-text-2 mb-4">
                Ranking de atendimentos e taxa de serviço acumulada por garçom.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-card bg-surface-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand text-on-brand font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <div className="font-extrabold text-text">Lucas Garçom</div>
                      <div className="text-[11px] text-text-2">24 mesas atendidas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-text tabular-nums">R$ 2.140,00</div>
                    <div className="text-[11px] text-success font-semibold">10%: R$ 214,00</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-card bg-surface-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-border text-text font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <div className="font-extrabold text-text">Ana Salão</div>
                      <div className="text-[11px] text-text-2">18 mesas atendidas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-text tabular-nums">R$ 1.702,50</div>
                    <div className="text-[11px] text-success font-semibold">10%: R$ 135,30</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'estoque' && (
          <div className="bg-surface border border-border rounded-card-lg p-5 shadow-soft">
            <h3 className="font-extrabold text-base text-text mb-1">
              Produtos Críticos (Risco de Ruptura)
            </h3>
            <p className="text-xs text-text-2 mb-4">
              Itens cujo saldo atual é menor ou igual ao estoque mínimo de segurança cadastrado.
            </p>

            {produtosAbaixoDoMinimo.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-2">
                Nenhum produto em nível crítico de estoque.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-2 font-bold">
                      <th className="pb-2">Produto</th>
                      <th className="pb-2">Categoria</th>
                      <th className="pb-2 text-right">Preço</th>
                      <th className="pb-2 text-right">Estoque Atual</th>
                      <th className="pb-2 text-right">Estoque Mínimo</th>
                      <th className="pb-2 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {produtosAbaixoDoMinimo.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-2 transition-colors">
                        <td className="py-2.5 font-bold text-text">{p.nome}</td>
                        <td className="py-2.5 text-text-2 capitalize">{p.categoria}</td>
                        <td className="py-2.5 text-right font-semibold tabular-nums">
                          {formatCurrency(p.preco)}
                        </td>
                        <td className="py-2.5 text-right font-black text-danger tabular-nums">
                          {p.estoque} un
                        </td>
                        <td className="py-2.5 text-right font-medium tabular-nums text-text-2">
                          {p.estoque_minimo} un
                        </td>
                        <td className="py-2.5 text-center">
                          <Badge variant="danger">Repor Urgente</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'curva_abc' && (
          <div className="bg-surface border border-border rounded-card-lg p-5 shadow-soft">
            <h3 className="font-extrabold text-base text-text mb-1">
              Curva ABC de Vendas (Volume vs. Margem)
            </h3>
            <p className="text-xs text-text-2 mb-4">
              Classificação estratégica dos produtos que geram maior receita no restaurante.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-card bg-brand-soft/40 border border-brand/30">
                <div className="flex items-center justify-between font-extrabold text-sm text-brand-text mb-1">
                  <span>Classe A (80% da Receita)</span>
                  <Badge variant="brand">Alta Margem</Badge>
                </div>
                <p className="text-xs text-text-2 mb-2">
                  Itens vitais: Chopp Pilsen 500ml, Picanha na Chapa, Cerveja Artesanal IPA.
                </p>
                <div className="text-[11px] font-bold text-text">
                  Garantir estoque e evitar ruptura a qualquer custo.
                </div>
              </div>

              <div className="p-4 rounded-card bg-surface-2 border border-border">
                <div className="flex items-center justify-between font-extrabold text-sm text-text mb-1">
                  <span>Classe B (15% da Receita)</span>
                  <Badge variant="neutral">Intermediário</Badge>
                </div>
                <p className="text-xs text-text-2">
                  Itens secundários: Porção de Batata Frita, Refrigerante Lata, Caipirinha de Limão.
                </p>
              </div>

              <div className="p-4 rounded-card bg-surface-2 border border-border">
                <div className="flex items-center justify-between font-extrabold text-sm text-text mb-1">
                  <span>Classe C (5% da Receita)</span>
                  <Badge variant="neutral">Baixo Volume</Badge>
                </div>
                <p className="text-xs text-text-2">
                  Itens de cauda longa: Água Mineral c/ Gás, Sobremesas Especiais, Doses.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
