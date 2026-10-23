import { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Smartphone,
  Monitor,
  Activity,
  Plus,
  Send,
  CreditCard,
  Search,
  Clock,
  User,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Modal,
  Stepper,
  ToggleSwitch,
} from './components/common';
import { formatCurrency } from './lib/utils';
import { useSessionStore } from './stores/useSessionStore';
import { useComandaStore } from './stores/useComandaStore';
import {
  useComandasAbertas,
  useAbrirComanda,
  useLancarItensLote,
  useFecharComanda,
} from './hooks/useComandas';
import { useProdutosDisponiveis } from './hooks/useProdutos';
import { useGarconsAtivos } from './hooks/useUsuarios';
import { ApiError } from './services/apiClient';

export function App() {
  const { setModo, nomeOperador } = useSessionStore();
  const {
    carrinho,
    incrementarItem,
    decrementarItem,
    limparCarrinho,
    obterTotalItensCarrinho,
    obterItensParaLote,
  } = useComandaStore();

  const [activeTab, setActiveTab] = useState<'design' | 'garcom' | 'caixa'>('design');
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stepperVal, setStepperVal] = useState(2);
  const [taxa10, setTaxa10] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<{
    tipo: 'sucesso' | 'erro';
    mensagem: string;
  } | null>(null);

  // Formulário do Modal de Abertura de Mesa
  const [mesaInput, setMesaInput] = useState('5');
  const [garcomSelecionadoId, setGarcomSelecionadoId] = useState<number | null>(null);

  // Queries TanStack Query
  const { data: comandasAbertas, refetch: refetchComandas, isFetching: isFetchingComandas } =
    useComandasAbertas();
  const { data: produtos } = useProdutosDisponiveis();
  const { data: garcons } = useGarconsAtivos();

  // Mutações TanStack Query
  const abrirComandaMut = useAbrirComanda();
  const lancarItensMut = useLancarItensLote();
  const fecharComandaMut = useFecharComanda();

  // Checagem de conectividade com a API Fastify via Proxy
  useEffect(() => {
    fetch('/health')
      .then((res) => {
        if (res.ok) setApiHealth('online');
        else setApiHealth('offline');
      })
      .catch(() => setApiHealth('offline'));
  }, []);

  // Seleciona automaticamente o primeiro garçom da lista se existir
  useEffect(() => {
    if (garcons && garcons.length > 0 && !garcomSelecionadoId) {
      setGarcomSelecionadoId(garcons[0].id);
    }
  }, [garcons, garcomSelecionadoId]);

  const showToast = (tipo: 'sucesso' | 'erro', mensagem: string) => {
    setFeedbackToast({ tipo, mensagem });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleAbrirMesa = async () => {
    if (!mesaInput) {
      showToast('erro', 'Informe o número da mesa.');
      return;
    }
    const garcomId = garcomSelecionadoId || 1;

    try {
      await abrirComandaMut.mutateAsync({
        mesa: mesaInput,
        garcom_id: garcomId,
      });
      showToast('sucesso', `Mesa ${mesaInput} aberta com sucesso!`);
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        showToast('erro', `${err.codigo}: ${err.message}`);
      } else {
        showToast('erro', 'Erro ao tentar abrir mesa.');
      }
    }
  };

  const handleEnviarLoteCozinha = async (comandaId?: number) => {
    const itens = obterItensParaLote();
    if (itens.length === 0) {
      showToast('erro', 'Selecione ao menos 1 item para enviar.');
      return;
    }

    const idAlvo = comandaId || (comandasAbertas && comandasAbertas[0]?.id);
    if (!idAlvo) {
      showToast('erro', 'Nenhuma comanda aberta selecionada.');
      return;
    }

    try {
      await lancarItensMut.mutateAsync({
        comandaId: idAlvo,
        itens,
      });
      showToast('sucesso', `${itens.length} itens enviados para a cozinha com sucesso!`);
      limparCarrinho();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast('erro', `${err.codigo}: ${err.message}`);
      } else {
        showToast('erro', 'Erro ao enviar itens para a cozinha.');
      }
    }
  };

  const totalItensCarrinho = obterTotalItensCarrinho();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Toast Notification Flutuante */}
      {feedbackToast && (
        <div className="fixed top-16 right-4 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-card shadow-modal border text-xs font-bold ${
              feedbackToast.tipo === 'sucesso'
                ? 'bg-success text-white border-success'
                : 'bg-danger text-white border-danger'
            }`}
          >
            {feedbackToast.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackToast.mensagem}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-input bg-brand text-on-brand flex items-center justify-center font-black text-xl shadow-soft">
              <UtensilsCrossed className="w-5 h-5 text-on-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-text tracking-tight">VaptPDV</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-soft text-brand-text border border-brand/20">
                  Módulo 1
                </span>
              </div>
              <p className="text-xs text-text-2 hidden sm:block">
                Ponto de Venda Ágil · TanStack Query v5 + Zustand Store
              </p>
            </div>
          </div>

          {/* Status do Backend / Proxy */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs">
              <Activity className="w-3.5 h-3.5 text-text-2" />
              <span className="text-text-2">API Fastify:</span>
              {apiHealth === 'online' ? (
                <span className="font-semibold text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Conectado (:3000)
                </span>
              ) : apiHealth === 'offline' ? (
                <span className="font-medium text-text-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-border" />
                  Aguardando API
                </span>
              ) : (
                <span className="text-text-2 animate-pulse">Testando...</span>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-soft text-xs font-semibold">
              <User className="w-4 h-4 text-brand-text" />
              <span>{nomeOperador}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center justify-between border-t border-border/50 pt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('design')}
              className={`flex items-center gap-2 px-4 py-2 rounded-input text-xs font-bold transition-all min-h-[40px] ${
                activeTab === 'design'
                  ? 'bg-brand text-on-brand shadow-soft'
                  : 'text-text-2 hover:bg-surface-2'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Tokens & Camada de API
            </button>
            <button
              onClick={() => {
                setActiveTab('garcom');
                setModo('garcom');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-input text-xs font-bold transition-all min-h-[40px] ${
                activeTab === 'garcom'
                  ? 'bg-brand text-on-brand shadow-soft'
                  : 'text-text-2 hover:bg-surface-2'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Modo Garçom (PWA)
            </button>
            <button
              onClick={() => {
                setActiveTab('caixa');
                setModo('caixa');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-input text-xs font-bold transition-all min-h-[40px] ${
                activeTab === 'caixa'
                  ? 'bg-brand text-on-brand shadow-soft'
                  : 'text-text-2 hover:bg-surface-2'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Modo Caixa / Balcão
            </button>
          </div>

          <button
            onClick={() => refetchComandas()}
            disabled={isFetchingComandas}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-text-2 hover:text-text rounded-lg hover:bg-surface-2 transition-colors"
            title="Atualizar dados do backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingComandas ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* ================= ABA 1: DESIGN SYSTEM & CAMADA DE API ================= */}
        {activeTab === 'design' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Banner com TanStack Query & Zustand Status */}
            <div className="rounded-card bg-surface border border-border p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <Badge variant="brand" size="sm" className="mb-2">
                  TanStack Query v5 & Zustand Store Conectados
                </Badge>
                <h1 className="text-2xl font-extrabold text-text tracking-tight">
                  Camada Reativa de API REST e Estado Global
                </h1>
                <p className="text-sm text-text-2 mt-1 max-w-2xl">
                  Cliente HTTP tipado com tratamento padronizado do envelope de erro da API. Stores
                  desacopladas para gestão de sessão e carrinho de lote, com invalidação atômica de
                  cache pós-mutação.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Abrir Mesa (API)
                </Button>
              </div>
            </div>

            {/* Painel de Estado Reativo Atual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Comandas no Backend</span>
                    <Badge variant="brand" size="sm">
                      {comandasAbertas ? comandasAbertas.length : 0} abertas
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-text-2 mb-2">
                    Consulta automática via <code className="font-mono">useComandasAbertas()</code> com polling a cada 5s.
                  </p>
                  {comandasAbertas && comandasAbertas.length > 0 ? (
                    <div className="space-y-1">
                      {comandasAbertas.slice(0, 3).map((cmd) => (
                        <div
                          key={cmd.id}
                          className="flex items-center justify-between text-xs p-1.5 rounded bg-surface-2"
                        >
                          <span className="font-bold">Mesa {cmd.mesa}</span>
                          <span className="tabular-nums font-semibold">
                            {formatCurrency(cmd.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-text-2 italic">Nenhuma mesa aberta no momento.</span>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Cardápio & Produtos</span>
                    <Badge variant="livre" size="sm">
                      {produtos ? produtos.length : 0} ativos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-text-2 mb-2">
                    Consulta via <code className="font-mono">useProdutosDisponiveis()</code>.
                  </p>
                  {produtos && produtos.length > 0 ? (
                    <div className="space-y-1">
                      {produtos.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs p-1.5 rounded bg-surface-2"
                        >
                          <span className="font-medium truncate">{p.nome}</span>
                          <span className="tabular-nums font-bold">{formatCurrency(p.preco)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-text-2 italic">Aguardando catálogo de produtos...</span>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Carrinho Zustand</span>
                    <Badge variant="ocupada" size="sm">
                      {totalItensCarrinho} itens
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-text-2 mb-2">
                    Gerenciado por <code className="font-mono">useComandaStore</code> para lote.
                  </p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold">Total Lote:</span>
                    <span className="font-bold tabular-nums">
                      {totalItensCarrinho} un.
                    </span>
                  </div>
                  {totalItensCarrinho > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => limparCarrinho()}
                    >
                      Limpar Carrinho
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Demonstração de Componentes Atômicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Botões e Alvos de Toque</CardTitle>
                  <CardDescription>
                    Variantes semânticas com altura mínima ergonômica de 44px
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary">Primary Mostarda</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="success" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                      Manjericão
                    </Button>
                    <Button variant="danger" leftIcon={<AlertCircle className="w-4 h-4" />}>
                      Tomate
                    </Button>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="action"
                      fullWidth
                      rightIcon={<CreditCard className="w-6 h-6" />}
                    >
                      Botão de Ação Primária (60px/68px)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Badges de Status & Controles</CardTitle>
                  <CardDescription>
                    Identificação visual imediata de mesas e seleção de unidades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="livre">Mesa Livre</Badge>
                    <Badge variant="ocupada">Ocupada (34 min)</Badge>
                    <Badge variant="conta_pedida">Conta Pedida</Badge>
                    <Badge variant="fechada">Comanda Fechada</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-card bg-surface-2 border border-border">
                    <div>
                      <span className="text-sm font-bold text-text block">Quantidade de Itens</span>
                      <span className="text-xs text-text-2">Alvos de toque $\ge 40$px</span>
                    </div>
                    <Stepper value={stepperVal} onChange={setStepperVal} min={0} max={20} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-card bg-surface border border-border">
                    <ToggleSwitch
                      checked={taxa10}
                      onChange={setTaxa10}
                      label="Gorjeta / Taxa de Serviço 10%"
                      description="Calculada pelo backend Fastify no fechamento"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ================= ABA 2: MODO GARÇOM ================= */}
        {activeTab === 'garcom' && (
          <div className="max-w-md mx-auto space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-text">Salão & Mesas</h2>
                <p className="text-xs text-text-2">Modo Garçom PWA · {nomeOperador}</p>
              </div>
              <Badge variant="ocupada" icon={<Clock className="w-3.5 h-3.5" />}>
                {comandasAbertas ? `${comandasAbertas.length} abertas` : '0 abertas'}
              </Badge>
            </div>

            {/* Grade de Mesas do Salão com Dados Reais da API */}
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((numMesa) => {
                const cmd = comandasAbertas?.find((c) => String(c.mesa) === String(numMesa));
                const ocupada = !!cmd;

                return (
                  <Card
                    key={numMesa}
                    interactive
                    onClick={() => {
                      if (!ocupada) {
                        setMesaInput(String(numMesa));
                        setIsModalOpen(true);
                      }
                    }}
                    className={ocupada ? 'border-brand ring-1 ring-brand/50' : 'border-dashed'}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl font-black text-text">
                        {numMesa < 10 ? `0${numMesa}` : numMesa}
                      </span>
                      {ocupada ? (
                        <Badge variant="ocupada">Ocupada</Badge>
                      ) : (
                        <Badge variant="livre">Livre</Badge>
                      )}
                    </div>
                    {ocupada ? (
                      <div className="space-y-0.5">
                        <span className="text-xs text-text-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Em consumo
                        </span>
                        <span className="text-sm font-extrabold text-text block tabular-nums">
                          {formatCurrency(cmd.subtotal)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-text-2">Toque para abrir</p>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Cardápio Rápido Integrado com o Carrinho Zustand */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-2">
                Cardápio do Salão (Seleção para Envio)
              </h3>
              <div className="space-y-2">
                {produtos && produtos.length > 0 ? (
                  produtos.map((p) => {
                    const qtd = carrinho[p.id]?.quantidade || 0;
                    return (
                      <Card key={p.id} className="flex items-center justify-between p-3">
                        <div>
                          <h4 className="font-bold text-sm text-text">{p.nome}</h4>
                          <span className="text-xs font-semibold text-text-2 tabular-nums">
                            {formatCurrency(p.preco)}
                          </span>
                        </div>
                        <Stepper
                          value={qtd}
                          onChange={(novaQtd) => {
                            if (novaQtd > qtd) {
                              incrementarItem(p.id, p.nome, p.preco);
                            } else {
                              decrementarItem(p.id);
                            }
                          }}
                        />
                      </Card>
                    );
                  })
                ) : (
                  <>
                    <Card className="flex items-center justify-between p-3">
                      <div>
                        <h4 className="font-bold text-sm text-text">Chopp Artesanal 500ml</h4>
                        <span className="text-xs font-semibold text-text-2 tabular-nums">
                          {formatCurrency(14.0)}
                        </span>
                      </div>
                      <Stepper
                        value={carrinho[1]?.quantidade || 0}
                        onChange={(novaQtd) => {
                          const atual = carrinho[1]?.quantidade || 0;
                          if (novaQtd > atual) incrementarItem(1, 'Chopp Artesanal 500ml', '14.00');
                          else decrementarItem(1);
                        }}
                      />
                    </Card>
                    <Card className="flex items-center justify-between p-3">
                      <div>
                        <h4 className="font-bold text-sm text-text">Hambúrguer Vapt Costela</h4>
                        <span className="text-xs font-semibold text-text-2 tabular-nums">
                          {formatCurrency(32.0)}
                        </span>
                      </div>
                      <Stepper
                        value={carrinho[2]?.quantidade || 0}
                        onChange={(novaQtd) => {
                          const atual = carrinho[2]?.quantidade || 0;
                          if (novaQtd > atual)
                            incrementarItem(2, 'Hambúrguer Vapt Costela', '32.00');
                          else decrementarItem(2);
                        }}
                      />
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Barra Flutuante de Envio em Lote */}
            <div className="sticky bottom-4 pt-2">
              <Button
                variant="primary"
                size="action"
                fullWidth
                disabled={totalItensCarrinho === 0 || lancarItensMut.isPending}
                isLoading={lancarItensMut.isPending}
                leftIcon={<Send className="w-5 h-5" />}
                onClick={() => handleEnviarLoteCozinha()}
              >
                Enviar {totalItensCarrinho > 0 ? `(${totalItensCarrinho}) ` : ''}para a Cozinha
              </Button>
            </div>
          </div>
        )}

        {/* ================= ABA 3: MODO CAIXA ================= */}
        {activeTab === 'caixa' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Seção Principal: Catálogo em Grid */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Input
                  leftIcon={<Search className="w-4 h-4" />}
                  placeholder="Buscar produto pelo código ou nome... (F2)"
                  className="max-w-md"
                />
                <div className="flex gap-1.5">
                  <Badge variant="brand">Bebidas</Badge>
                  <Badge variant="neutral">Lanches</Badge>
                  <Badge variant="neutral">Porções</Badge>
                </div>
              </div>

              {/* Grid 4 Colunas com Produtos Reais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {produtos && produtos.length > 0 ? (
                  produtos.map((p) => (
                    <Card
                      key={p.id}
                      interactive
                      className="text-center p-3"
                      onClick={() => incrementarItem(p.id, p.nome, p.preco)}
                    >
                      <Coffee className="w-6 h-6 text-brand mx-auto mb-1.5" />
                      <span className="font-bold text-xs text-text block truncate">{p.nome}</span>
                      <span className="font-extrabold text-sm text-text tabular-nums">
                        {formatCurrency(p.preco)}
                      </span>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card interactive className="text-center p-3">
                      <Coffee className="w-6 h-6 text-brand mx-auto mb-1.5" />
                      <span className="font-bold text-xs text-text block truncate">Chopp 500ml</span>
                      <span className="font-extrabold text-sm text-text tabular-nums">
                        {formatCurrency(14.0)}
                      </span>
                    </Card>
                    <Card interactive className="text-center p-3">
                      <Coffee className="w-6 h-6 text-brand mx-auto mb-1.5" />
                      <span className="font-bold text-xs text-text block truncate">Água sem Gás</span>
                      <span className="font-extrabold text-sm text-text tabular-nums">
                        {formatCurrency(6.0)}
                      </span>
                    </Card>
                  </>
                )}
              </div>

              {/* Atalhos de Teclado no Rodapé */}
              <div className="p-3 rounded-card bg-surface-2 border border-border text-xs flex flex-wrap items-center justify-between text-text-2 gap-2">
                <span>
                  <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border font-mono font-bold text-text">
                    F2
                  </kbd>{' '}
                  Buscar
                </span>
                <span>
                  <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border font-mono font-bold text-text">
                    F4
                  </kbd>{' '}
                  Cliente CPF
                </span>
                <span>
                  <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border font-mono font-bold text-text">
                    F6
                  </kbd>{' '}
                  Desconto
                </span>
                <span>
                  <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border font-mono font-bold text-text">
                    F8
                  </kbd>{' '}
                  Cobrar
                </span>
              </div>
            </div>

            {/* Painel de Comanda Lateral Fixo (440px) */}
            <div className="lg:col-span-4">
              <Card elevated className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-black text-lg text-text">
                      {comandasAbertas && comandasAbertas[0]
                        ? `Mesa ${comandasAbertas[0].mesa}`
                        : 'Mesa Balcão'}
                    </h3>
                    <span className="text-xs text-text-2">
                      {comandasAbertas && comandasAbertas[0]
                        ? `Comanda #${comandasAbertas[0].id}`
                        : 'Nenhuma comanda ativa'}
                    </span>
                  </div>
                  <Badge variant="ocupada">Em aberto</Badge>
                </div>

                {/* Resumo Financeiro da Comanda */}
                <div className="pt-2 border-t border-border space-y-1.5">
                  <div className="flex justify-between text-xs text-text-2">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-semibold text-text">
                      {formatCurrency(
                        comandasAbertas && comandasAbertas[0] ? comandasAbertas[0].subtotal : 60.0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-text-2 items-center">
                    <span className="flex items-center gap-1.5">
                      <ToggleSwitch checked={taxa10} onChange={setTaxa10} />
                      <span>Taxa 10%</span>
                    </span>
                    <span className="tabular-nums font-semibold text-text">
                      {taxa10
                        ? formatCurrency(
                            comandasAbertas && comandasAbertas[0] && comandasAbertas[0].subtotal
                              ? Number(comandasAbertas[0].subtotal) * 0.1
                              : 6.0
                          )
                        : 'R$ 0,00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-border">
                    <span className="text-sm font-bold text-text">Total</span>
                    <span className="text-2xl font-black text-text tabular-nums">
                      {formatCurrency(
                        comandasAbertas && comandasAbertas[0] && comandasAbertas[0].subtotal
                          ? Number(comandasAbertas[0].subtotal) * (taxa10 ? 1.1 : 1.0)
                          : taxa10
                          ? 66.0
                          : 60.0
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="action"
                  fullWidth
                  leftIcon={<Receipt className="w-5 h-5" />}
                  onClick={() => {
                    if (comandasAbertas && comandasAbertas[0]) {
                      fecharComandaMut.mutate(
                        {
                          comandaId: comandasAbertas[0].id,
                          dto: { aplicar_taxa_servico: taxa10 },
                        },
                        {
                          onSuccess: () => {
                            showToast('sucesso', 'Comanda fechada para pagamento!');
                          },
                          onError: (err) => {
                            showToast(
                              'erro',
                              err instanceof ApiError ? err.message : 'Erro ao fechar comanda.'
                            );
                          },
                        }
                      );
                    } else {
                      showToast('erro', 'Nenhuma comanda aberta para fechar.');
                    }
                  }}
                >
                  Fechar & Cobrar (F8)
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Modal Reutilizável de Abertura de Mesa com Chamada à API */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Abertura de Mesa — Salão"
        description="Selecione o garçom e a mesa para criar uma nova comanda"
      >
        <div className="space-y-4">
          <Input
            label="Número da Mesa"
            type="number"
            value={mesaInput}
            onChange={(e) => setMesaInput(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-text-2 tracking-wide uppercase block mb-1.5">
              Garçom Responsável
            </label>
            <select
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-input bg-surface border border-border text-text font-medium text-sm focus:outline-none focus:ring-1 focus:ring-text"
              value={garcomSelecionadoId || ''}
              onChange={(e) => setGarcomSelecionadoId(Number(e.target.value))}
            >
              {garcons && garcons.length > 0 ? (
                garcons.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome} ({g.perfil})
                  </option>
                ))
              ) : (
                <option value={1}>Garçom Padrão (ID 1)</option>
              )}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              isLoading={abrirComandaMut.isPending}
              onClick={handleAbrirMesa}
            >
              Confirmar Abertura
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
