import { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  LogOut,
  Utensils,
  Wine,
} from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';
import { Badge } from '../../components/ui/Badge';

interface FichaKds {
  id: number;
  comandaId: number;
  mesa: string;
  item: string;
  quantidade: number;
  setor: 'cozinha' | 'bar';
  garcom: string;
  status: 'recebido' | 'em_preparo' | 'pronto';
  minutosEspera: number;
  observacao?: string;
}

const FICHAS_INICIAIS: FichaKds[] = [
  {
    id: 101,
    comandaId: 1,
    mesa: '02',
    item: 'Isca de Peixe c/ Molho Tártaro',
    quantidade: 1,
    setor: 'cozinha',
    garcom: 'Lucas',
    status: 'recebido',
    minutosEspera: 4,
    observacao: 'Bem crocante, por favor',
  },
  {
    id: 102,
    comandaId: 1,
    mesa: '02',
    item: 'Caipirinha Tradicional 500ml',
    quantidade: 2,
    setor: 'bar',
    garcom: 'Lucas',
    status: 'em_preparo',
    minutosEspera: 7,
  },
  {
    id: 103,
    comandaId: 2,
    mesa: '05',
    item: 'Costela BBQ com Batata Rústica',
    quantidade: 1,
    setor: 'cozinha',
    garcom: 'Ana',
    status: 'em_preparo',
    minutosEspera: 12,
  },
  {
    id: 104,
    comandaId: 3,
    mesa: '08',
    item: 'Chopp Pilsen 500ml',
    quantidade: 3,
    setor: 'bar',
    garcom: 'Lucas',
    status: 'pronto',
    minutosEspera: 2,
  },
];

export function KdsPage() {
  const { nomeOperador, logout } = useSessionStore();
  const [fichas, setFichas] = useState<FichaKds[]>(FICHAS_INICIAIS);
  const [setorFiltro, setSetorFiltro] = useState<'todos' | 'cozinha' | 'bar'>('todos');

  const fichasFiltradas = fichas.filter(
    (f) => setorFiltro === 'todos' || f.setor === setorFiltro,
  );

  const avancarStatus = (id: number) => {
    setFichas((atuais) =>
      atuais.map((f) => {
        if (f.id !== id) return f;
        if (f.status === 'recebido') return { ...f, status: 'em_preparo' };
        if (f.status === 'em_preparo') return { ...f, status: 'pronto' };
        return f;
      }),
    );
  };

  const finalizarEntrega = (id: number) => {
    setFichas((atuais) => atuais.filter((f) => f.id !== id));
  };

  const colRecebido = fichasFiltradas.filter((f) => f.status === 'recebido');
  const colEmPreparo = fichasFiltradas.filter((f) => f.status === 'em_preparo');
  const colPronto = fichasFiltradas.filter((f) => f.status === 'pronto');

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Topo Operacional do KDS */}
      <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 sm:px-6 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-input bg-danger text-white flex items-center justify-center font-black shadow-soft">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight">KDS · Fila de Produção</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-danger-soft text-danger border border-danger/20">
                  Cozinha & Bar
                </span>
              </div>
              <p className="text-xs text-text-2">SLA Alvo: preparo &lt; 10 min · Ordem FIFO</p>
            </div>
          </div>

          {/* Filtro de Setor & Operador */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-surface-2 p-1 rounded-full border border-border text-xs font-bold">
              <button
                onClick={() => setSetorFiltro('todos')}
                className={`px-3 py-1 rounded-full transition-all ${
                  setorFiltro === 'todos' ? 'bg-brand text-on-brand shadow-soft' : 'text-text-2'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSetorFiltro('cozinha')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  setorFiltro === 'cozinha' ? 'bg-brand text-on-brand shadow-soft' : 'text-text-2'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                Cozinha
              </button>
              <button
                onClick={() => setSetorFiltro('bar')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  setorFiltro === 'bar' ? 'bg-brand text-on-brand shadow-soft' : 'text-text-2'
                }`}
              >
                <Wine className="w-3.5 h-3.5" />
                Bar
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
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

      {/* Grid de 3 Colunas KDS */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna 1: A Fazer / Recebido */}
        <div className="flex flex-col bg-surface border border-border rounded-card-lg p-4 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-text-2" />
              <h2 className="font-extrabold text-base text-text">A Fazer / Recebido</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-2 tabular-nums">
              {colRecebido.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {colRecebido.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-2">Nenhum pedido pendente.</div>
            ) : (
              colRecebido.map((f) => (
                <div
                  key={f.id}
                  className="bg-surface-2 border border-border rounded-card p-4 flex flex-col justify-between shadow-soft hover:border-brand transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-black text-sm text-text bg-surface px-2.5 py-1 rounded-input border border-border">
                        Mesa {f.mesa}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-text-2">
                        <Clock className="w-3 h-3 text-text-2" />
                        <span>{f.minutosEspera} min atrás</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="font-extrabold text-base text-text">
                        <span className="text-brand-text font-black mr-1">{f.quantidade}x</span>
                        {f.item}
                      </div>
                      {f.observacao && (
                        <p className="text-xs text-danger font-medium mt-1 bg-danger-soft/60 px-2 py-0.5 rounded">
                          Obs: {f.observacao}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-text-2">Garçom: {f.garcom}</span>
                    <button
                      onClick={() => avancarStatus(f.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-brand text-on-brand text-xs font-bold shadow-soft hover:opacity-95"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Iniciar Preparo</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Em Preparo */}
        <div className="flex flex-col bg-surface border border-border rounded-card-lg p-4 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand animate-pulse" />
              <h2 className="font-extrabold text-base text-text">Em Preparo</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-soft text-brand-text tabular-nums">
              {colEmPreparo.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {colEmPreparo.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-2">Nenhum item no fogo.</div>
            ) : (
              colEmPreparo.map((f) => {
                const atrasado = f.minutosEspera >= 10;
                return (
                  <div
                    key={f.id}
                    className={`bg-surface border rounded-card p-4 flex flex-col justify-between shadow-soft transition-all ${
                      atrasado ? 'border-danger bg-danger-soft/20' : 'border-brand bg-brand-soft/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-black text-sm text-text bg-surface px-2.5 py-1 rounded-input border border-border">
                          Mesa {f.mesa}
                        </span>
                        <div
                          className={`flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                            atrasado
                              ? 'bg-danger text-white'
                              : 'bg-brand text-on-brand'
                          }`}
                        >
                          {atrasado ? (
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                          ) : (
                            <Flame className="w-3 h-3 shrink-0" />
                          )}
                          <span>{f.minutosEspera} min (SLA)</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="font-extrabold text-base text-text">
                          <span className="text-brand-text font-black mr-1">{f.quantidade}x</span>
                          {f.item}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-text-2">Garçom: {f.garcom}</span>
                      <button
                        onClick={() => avancarStatus(f.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-success text-white text-xs font-bold shadow-soft hover:opacity-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pronto</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 3: Pronto */}
        <div className="flex flex-col bg-surface border border-border rounded-card-lg p-4 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success" />
              <h2 className="font-extrabold text-base text-text">Pronto para Entrega</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-success-soft text-success tabular-nums">
              {colPronto.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {colPronto.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-2">
                Nenhum prato aguardando retirada.
              </div>
            ) : (
              colPronto.map((f) => (
                <div
                  key={f.id}
                  className="bg-success-soft/20 border border-success/40 rounded-card p-4 flex flex-col justify-between shadow-soft hover:border-success transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-black text-sm text-text bg-surface px-2.5 py-1 rounded-input border border-border">
                        Mesa {f.mesa}
                      </span>
                      <Badge variant="success">Aguardando Garçom</Badge>
                    </div>

                    <div className="mt-2">
                      <div className="font-extrabold text-base text-text">
                        <span className="text-success font-black mr-1">{f.quantidade}x</span>
                        {f.item}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-text-2">Garçom: {f.garcom}</span>
                    <button
                      onClick={() => finalizarEntrega(f.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-surface border border-border hover:bg-surface-2 text-xs font-bold text-text shadow-soft"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Entregue na Mesa</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
