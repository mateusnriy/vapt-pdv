import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Printer,
  User,
  LogOut,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SidebarNav } from './components/SidebarNav';
import { CatalogoGrid } from './components/CatalogoGrid';
import { PainelComanda } from './components/PainelComanda';
import { ModalPagamento } from './components/ModalPagamento';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useSessionStore } from '../../stores/useSessionStore';
import { useComandaStore } from '../../stores/useComandaStore';
import {
  useComandasSalao,
  useLancarItem,
  useAbrirComanda,
  useFecharComanda,
} from '../../hooks/useComandas';
import { useProdutosDisponiveis } from '../../hooks/useProdutos';
import { useGarconsAtivos } from '../../hooks/useUsuarios';
import type { Comanda, Produto } from '../../types/api';
import { ApiError } from '../../services/apiClient';

export interface ModoCaixaPageProps {
  apiHealth?: 'online' | 'offline' | 'checking';
}

export const ModoCaixaPage: React.FC<ModoCaixaPageProps> = ({
  apiHealth = 'online',
}) => {
  const { nomeOperador, perfilAtivo, logout } = useSessionStore();
  const { comandaAtivaId, setComandaAtivaId } = useComandaStore();

  // Queries TanStack Query
  const { data: comandasSalao = [], refetch: refetchComandas } = useComandasSalao();
  const { data: produtos = [], isLoading: isLoadingProdutos } = useProdutosDisponiveis();
  const { data: garcons = [] } = useGarconsAtivos();

  // Mutações
  const lancarItemMut = useLancarItem();
  const abrirComandaMut = useAbrirComanda();
  const fecharComandaMut = useFecharComanda();

  // Navegação lateral interna
  const [abaNavegacao, setAbaNavegacao] = useState<'venda' | 'mesas' | 'pedidos' | 'caixa'>('venda');

  // Termo de busca e ref do input
  const [buscaValor, setBuscaValor] = useState<string>('');
  const buscaInputRef = useRef<HTMLInputElement>(null);

  // Switch de taxa 10%
  const [taxa10, setTaxa10] = useState<boolean>(true);

  // Dados do cliente vinculado
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [documentoCliente, setDocumentoCliente] = useState<string>('');

  // Modais
  const [isModalPagamentoOpen, setIsModalPagamentoOpen] = useState<boolean>(false);
  const [comandaParaPagamento, setComandaParaPagamento] = useState<Comanda | null>(null);

  const [isModalClienteOpen, setIsModalClienteOpen] = useState<boolean>(false);
  const [isModalAbrirMesaOpen, setIsModalAbrirMesaOpen] = useState<boolean>(false);
  const [novaMesaInput, setNovaMesaInput] = useState<string>('');
  const [novoGarcomId, setNovoGarcomId] = useState<number | null>(null);

  // Toasts de feedback
  const [toast, setToast] = useState<{
    tipo: 'sucesso' | 'erro';
    mensagem: string;
  } | null>(null);

  const showToast = (tipo: 'sucesso' | 'erro', mensagem: string) => {
    setToast({ tipo, mensagem });
    setTimeout(() => setToast(null), 4000);
  };

  // Garante que uma comanda esteja selecionada se houver mesas em atendimento
  useEffect(() => {
    if (comandasSalao.length > 0) {
      if (!comandaAtivaId || !comandasSalao.some((c) => c.id === comandaAtivaId)) {
        setComandaAtivaId(comandasSalao[0].id);
      }
    } else {
      setComandaAtivaId(null);
    }
  }, [comandasSalao, comandaAtivaId, setComandaAtivaId]);

  // Garante seleção padrão de garçom para abertura de mesa
  useEffect(() => {
    if (garcons.length > 0 && !novoGarcomId) {
      setNovoGarcomId(garcons[0].id);
    }
  }, [garcons, novoGarcomId]);

  // Comanda ativa selecionada no painel
  const comandaAtiva = comandasSalao.find((c) => c.id === comandaAtivaId) || null;

  // Lançamento rápido de produto no caixa
  const handleLancarItemCatalogo = async (produto: Produto) => {
    if (!comandaAtivaId || !comandaAtiva) {
      showToast('erro', 'Nenhuma comanda aberta. Abra uma mesa antes de lançar itens.');
      setIsModalAbrirMesaOpen(true);
      return;
    }

    if (comandaAtiva.status === 'fechada') {
      showToast(
        'erro',
        `A Mesa ${comandaAtiva.mesa} está com a conta fechada. Não é possível lançar novos itens.`
      );
      return;
    }

    try {
      await lancarItemMut.mutateAsync({
        comandaId: comandaAtivaId,
        dto: {
          produto_id: produto.id,
          quantidade: 1,
        },
      });
      showToast('sucesso', `${produto.nome} lançado na Mesa ${comandaAtiva.mesa}.`);
    } catch (err) {
      showToast(
        'erro',
        err instanceof ApiError ? err.message : 'Erro ao lançar item na comanda.'
      );
    }
  };

  // Abertura do modal de pagamento
  const handleAbrirPagamento = (comanda: Comanda) => {
    setComandaParaPagamento(comanda);
    setIsModalPagamentoOpen(true);
  };

  // Conclusão do pagamento
  const handlePagamentoConcluido = (_comandaPaga: Comanda) => {
    refetchComandas();
  };

  // Ao clicar em 'Nova Venda' ou fechar após quitação, limpa dados do cliente anterior
  const handleNovaVenda = () => {
    setNomeCliente('');
    setDocumentoCliente('');
    setIsModalPagamentoOpen(false);
    setComandaParaPagamento(null);
  };

  // Criação de nova comanda pelo caixa
  const handleConfirmarAbrirMesa = async () => {
    if (!novaMesaInput.trim()) {
      showToast('erro', 'Informe o número da mesa.');
      return;
    }
    const garcomId = novoGarcomId || (garcons[0] ? garcons[0].id : 1);

    try {
      const nova = await abrirComandaMut.mutateAsync({
        mesa: novaMesaInput.trim(),
        garcom_id: garcomId,
        nome_cliente: nomeCliente.trim() || undefined,
      });
      showToast('sucesso', `Mesa ${nova.mesa} aberta com sucesso!`);
      setComandaAtivaId(nova.id);
      setIsModalAbrirMesaOpen(false);
      setNovaMesaInput('');
      refetchComandas();
    } catch (err) {
      showToast(
        'erro',
        err instanceof ApiError ? `${err.codigo}: ${err.message}` : 'Erro ao abrir mesa.'
      );
    }
  };

  // Atalhos Globais de Teclado Protegidos (F2, F4, F8, Esc)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape: Fechar Modais Secundários
      if (event.key === 'Escape') {
        if (isModalClienteOpen) {
          setIsModalClienteOpen(false);
          return;
        } else if (isModalAbrirMesaOpen) {
          setIsModalAbrirMesaOpen(false);
          return;
        }
      }

      // Ignora atalhos de digitação se o foco estiver em INPUT ou TEXTAREA
      const target = event.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (isInput) {
        return;
      }

      // Não dispara atalhos de venda/cobrança se o modal de pagamento já estiver aberto
      if (isModalPagamentoOpen) {
        return;
      }

      // F2: Focar Busca
      if (event.key === 'F2') {
        event.preventDefault();
        buscaInputRef.current?.focus();
        buscaInputRef.current?.select();
        return;
      }

      // F4: Cliente / CPF
      if (event.key === 'F4') {
        event.preventDefault();
        setIsModalClienteOpen(true);
        return;
      }

      // F8: Cobrar
      if (event.key === 'F8') {
        event.preventDefault();
        if (comandaAtiva && comandaAtiva.itens && comandaAtiva.itens.length > 0) {
          if (comandaAtiva.status === 'fechada') {
            handleAbrirPagamento(comandaAtiva);
          } else {
            fecharComandaMut.mutate(
              {
                comandaId: comandaAtiva.id,
                dto: { aplicar_taxa_servico: taxa10 },
              },
              {
                onSuccess: (comandaFechada) => {
                  showToast('sucesso', `Mesa ${comandaAtiva.mesa} fechada.`);
                  handleAbrirPagamento(comandaFechada);
                },
                onError: (err) => {
                  showToast('erro', err instanceof ApiError ? err.message : 'Erro ao fechar comanda.');
                },
              }
            );
          }
        } else {
          showToast('erro', 'A comanda está sem itens ou nenhuma mesa está selecionada.');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    comandaAtiva,
    taxa10,
    fecharComandaMut,
    isModalClienteOpen,
    isModalAbrirMesaOpen,
    isModalPagamentoOpen,
  ]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-row bg-bg text-text select-none">
      {/* Toast Flutuante no Topo */}
      {toast && (
        <div className="fixed top-4 right-6 z-60 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-card shadow-modal border text-xs font-bold ${
              toast.tipo === 'sucesso'
                ? 'bg-success text-white border-success'
                : 'bg-danger text-white border-danger'
            }`}
          >
            {toast.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.mensagem}</span>
          </div>
        </div>
      )}

      {/* 1. Barra Lateral Compacta de 88px */}
      <SidebarNav
        abaAtiva={abaNavegacao}
        onAbaChange={(aba) => setAbaNavegacao(aba)}
      />

      {/* 2. Conteúdo Central + TopBar + Painel Lateral */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TopBar Superior de 80px (DESIGN.md §6.1) */}
        <header className="h-20 min-h-[80px] max-h-[80px] bg-surface border-b border-border px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-text tracking-tight">Balcão & Caixa</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-soft text-brand-text border border-brand/20">
                  Estação 01
                </span>
              </div>
              <p className="text-xs text-text-2">
                Operação de Frente de Caixa · Terminal Desktop 1440×900
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsModalAbrirMesaOpen(true)}
              className="text-xs ml-2 font-bold"
            >
              Abrir Mesa
            </Button>
          </div>

          {/* Indicadores de Conexão, Hardware e Operador */}
          <div className="flex items-center gap-3">
            {/* Sincronização API */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs">
              <Activity className="w-3.5 h-3.5 text-text-2" />
              <span className="text-text-2">API Fastify:</span>
              {apiHealth === 'online' ? (
                <span className="font-semibold text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Sincronizado
                </span>
              ) : (
                <span className="font-semibold text-danger flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-danger" />
                  Desconectado
                </span>
              )}
            </div>

            {/* Impressora Placeholder (DESIGN.md §6.1) */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2/60 border border-border text-xs text-text-2"
              title="Impressora de cozinha e balcão não conectada (disponível em versão futura)"
            >
              <Printer className="w-3.5 h-3.5 text-text-2" />
              <span>Impressora cozinha:</span>
              <span className="font-medium text-text-2/80">Não conectada</span>
            </div>

            {/* Operador Ativo */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-soft text-xs font-semibold">
              <User className="w-4 h-4 text-brand-text" />
              <span>{nomeOperador}</span>
              {perfilAtivo && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-soft text-brand-text">
                  {perfilAtivo}
                </span>
              )}
            </div>

            {/* Botão de Logout */}
            <button
              onClick={logout}
              title="Trocar Operador / Ir para Login"
              className="p-2 text-danger hover:bg-danger-soft rounded-full transition-colors border border-danger/30"
              aria-label="Trocar Operador"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Área Central: Catálogo em Grid (Esquerda) + Painel da Comanda (Direita) */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Catálogo de Produtos em 4 Colunas */}
          <CatalogoGrid
            produtos={produtos}
            isLoading={isLoadingProdutos}
            onLancarItem={handleLancarItemCatalogo}
            buscaInputRef={buscaInputRef}
            buscaValor={buscaValor}
            onBuscaChange={setBuscaValor}
            comandaAbertaId={comandaAtivaId}
          />

          {/* Painel Lateral Fixo de 440px Antissobreposição */}
          <PainelComanda
            comandaAtivaId={comandaAtivaId}
            comandasDisponiveis={comandasSalao}
            onSelecionarComanda={(id) => setComandaAtivaId(id)}
            onAbrirModalPagamento={handleAbrirPagamento}
            onAbrirModalCliente={() => setIsModalClienteOpen(true)}
            nomeCliente={nomeCliente}
            documentoCliente={documentoCliente}
            onToast={showToast}
            taxa10={taxa10}
            onTaxa10Change={setTaxa10}
          />
        </div>

        {/* Rodapé de Atalhos de Teclado (DESIGN.md §6.1 / §8.5) */}
        <footer className="h-10 min-h-[40px] max-h-[40px] bg-surface-2 border-t border-border px-6 flex items-center justify-between text-xs text-text-2 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border font-mono text-[11px] font-bold text-text">
                F2
              </kbd>
              Buscar Produto
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border font-mono text-[11px] font-bold text-text">
                F4
              </kbd>
              Cliente / CPF
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border font-mono text-[11px] font-bold text-text">
                F8
              </kbd>
              Cobrar
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border font-mono text-[11px] font-bold text-text">
                Esc
              </kbd>
              Fechar Modal
            </span>
          </div>

          <div className="text-[11px] text-text-2 hidden md:block">
            VaptPDV 1.0 · Módulo 1 (Desktop 1440×900)
          </div>
        </footer>
      </div>

      {/* Modal de Pagamento em 3 Colunas com Split e Quitação Exata */}
      <ModalPagamento
        isOpen={isModalPagamentoOpen}
        onClose={handleNovaVenda}
        onNovaVenda={handleNovaVenda}
        comanda={comandaParaPagamento}
        onPagamentoConcluido={handlePagamentoConcluido}
        nomeOperador={nomeOperador}
        documentoClienteInicial={documentoCliente}
        onToast={showToast}
      />

      {/* Modal Rápido de Identificação do Cliente / CPF (F4) */}
      <Modal
        isOpen={isModalClienteOpen}
        onClose={() => setIsModalClienteOpen(false)}
        title="Identificação do Cliente (F4)"
        description="Vincule o nome ou CPF/CNPJ do cliente à venda atual"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Cliente"
            placeholder="Ex: Kaio França"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
          />

          <Input
            label="CPF / CNPJ na Nota"
            placeholder="000.000.000-00"
            value={documentoCliente}
            onChange={(e) => setDocumentoCliente(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalClienteOpen(false)}>
              Fechar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                showToast('sucesso', 'Dados do cliente salvos para o fechamento.');
                setIsModalClienteOpen(false);
              }}
            >
              Salvar Dados
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Abertura de Mesa */}
      <Modal
        isOpen={isModalAbrirMesaOpen}
        onClose={() => setIsModalAbrirMesaOpen(false)}
        title="Abrir Mesa no Salão"
        description="Informe o número da mesa e selecione o garçom responsável"
      >
        <div className="space-y-4">
          <Input
            label="Número da Mesa"
            placeholder="Ex: 12"
            type="number"
            value={novaMesaInput}
            onChange={(e) => setNovaMesaInput(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-text-2 tracking-wide uppercase block mb-1.5">
              Garçom Responsável
            </label>
            <select
              value={novoGarcomId || ''}
              onChange={(e) => setNovoGarcomId(Number(e.target.value))}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-input bg-surface border border-border text-text font-medium text-sm focus:outline-none focus:ring-1 focus:ring-text"
            >
              {garcons.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome} ({g.perfil})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setIsModalAbrirMesaOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              isLoading={abrirComandaMut.isPending}
              onClick={handleConfirmarAbrirMesa}
            >
              Confirmar Abertura
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
