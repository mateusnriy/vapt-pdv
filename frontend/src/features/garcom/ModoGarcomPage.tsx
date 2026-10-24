import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  CheckCircle,
  Wifi,
  WifiOff,
  Receipt,
  LayoutGrid,
  ChefHat,
  User,
  LogOut,
} from 'lucide-react';
import { MesasGrid } from './components/MesasGrid';
import { ModalAbrirMesa } from './components/ModalAbrirMesa';
import { ComandaMesaView } from './components/ComandaMesaView';
import { CardapioModal } from './components/CardapioModal';
import { Badge } from '../../components/ui/Badge';
import { useComandasSalao } from '../../hooks/useComandas';
import { useGarconsAtivos } from '../../hooks/useUsuarios';
import { useSessionStore } from '../../stores/useSessionStore';
import { useComandaStore } from '../../stores/useComandaStore';
import type { Comanda } from '../../types/api';

export interface ModoGarcomPageProps {
  apiHealth?: 'online' | 'offline' | 'checking';
}

export const ModoGarcomPage: React.FC<ModoGarcomPageProps> = ({
  apiHealth = 'online',
}) => {
  const { usuarioAtivoId, nomeOperador, setUsuarioAtivo, logout, setModo } = useSessionStore();
  const {
    mesaAtiva,
    comandaAtivaId,
    setMesaAtiva,
    setComandaAtivaId,
  } = useComandaStore();

  const [telaAtiva, setTelaAtiva] = useState<'mesas' | 'comanda'>('mesas');
  const [isModalAbrirOpen, setIsModalAbrirOpen] = useState(false);
  const [mesaParaAbrir, setMesaParaAbrir] = useState<string>('');
  const [isCardapioOpen, setIsCardapioOpen] = useState(false);

  // Toast Feedback local
  const [toast, setToast] = useState<{
    tipo: 'sucesso' | 'erro';
    mensagem: string;
  } | null>(null);

  const showToast = (tipo: 'sucesso' | 'erro', mensagem: string) => {
    setToast({ tipo, mensagem });
    setTimeout(() => setToast(null), 4000);
  };

  // Queries TanStack Query
  const { data: comandas = [], refetch: refetchComandas } = useComandasSalao();
  const { data: garcons = [] } = useGarconsAtivos();

  // Garante um garçom padrão se nenhum estiver selecionado
  React.useEffect(() => {
    if (garcons.length > 0 && !usuarioAtivoId) {
      setUsuarioAtivo(garcons[0].id, garcons[0].nome);
    }
  }, [garcons, usuarioAtivoId, setUsuarioAtivo]);

  // Se uma comanda já estiver ativa e o usuário selecionar a aba comanda
  const handleVerComanda = (comanda: Comanda) => {
    setComandaAtivaId(comanda.id);
    setMesaAtiva(comanda.mesa);
    setTelaAtiva('comanda');
  };

  const handleAbrirMesaClick = (numeroMesa: string) => {
    setMesaParaAbrir(numeroMesa);
    setIsModalAbrirOpen(true);
  };

  const handleMesaAbertaSucesso = (comanda: Comanda) => {
    showToast('sucesso', `Mesa ${comanda.mesa} aberta com sucesso!`);
    refetchComandas();
    setComandaAtivaId(comanda.id);
    setMesaAtiva(comanda.mesa);
    setTelaAtiva('comanda');
  };

  const garcomAtivoNome =
    garcons.find((g) => g.id === usuarioAtivoId)?.nome || nomeOperador || 'Garçom';

  return (
    <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-bg text-text relative selection:bg-brand selection:text-on-brand">
      {/* Toast Flutuante */}
      {toast && (
        <div className="fixed top-3 left-4 right-4 z-50 animate-bounce">
          <div
            className={`max-w-md mx-auto px-4 py-3 rounded-card shadow-modal border flex items-center gap-2 text-xs font-bold ${
              toast.tipo === 'sucesso'
                ? 'bg-success text-on-brand border-success'
                : 'bg-danger text-on-brand border-danger'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{toast.mensagem}</span>
          </div>
        </div>
      )}

      {/* Barra de Status e Cabeçalho do Salão (Ergonomia Mobile) */}
      <header className="p-3 bg-surface border-b border-border shadow-soft flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-brand text-on-brand flex items-center justify-center font-black text-xs shadow-soft select-none">
            {garcomAtivoNome.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-text leading-none">Salão</h1>
              <span className="text-[10px] text-text-2 font-bold uppercase tracking-wider">
                · Modo Garçom PWA
              </span>
            </div>
            <span className="text-xs font-semibold text-text-2 truncate block max-w-[150px]">
              {garcomAtivoNome}
            </span>
          </div>
        </div>

        {/* Indicador de Conexão com a API e Troca de Operador */}
        <div className="flex items-center gap-2">
          {apiHealth === 'online' ? (
            <Badge variant="livre" size="sm" icon={<Wifi className="w-3 h-3 text-success" />}>
              Online
            </Badge>
          ) : (
            <Badge variant="conta_pedida" size="sm" icon={<WifiOff className="w-3 h-3 text-danger" />}>
              Offline
            </Badge>
          )}

          <button
            type="button"
            onClick={logout}
            title="Trocar Operador"
            className="p-1.5 rounded-full hover:bg-surface-2 text-text-2 hover:text-danger transition-colors flex items-center gap-1 text-[11px] font-bold"
          >
            <LogOut className="w-4 h-4 text-danger" />
          </button>
        </div>
      </header>

      {/* Conteúdo Principal Alternado por Tela */}
      <main className="flex-1 p-3">
        {telaAtiva === 'mesas' ? (
          <MesasGrid
            comandas={comandas}
            garcomLogadoId={usuarioAtivoId}
            garcons={garcons}
            mesaSelecionadaId={comandaAtivaId}
            onAbrirMesa={handleAbrirMesaClick}
            onVerComanda={handleVerComanda}
          />
        ) : comandaAtivaId ? (
          <ComandaMesaView
            comandaId={comandaAtivaId}
            garcomNome={garcomAtivoNome}
            onVoltar={() => setTelaAtiva('mesas')}
            onAdicionarItens={() => setIsCardapioOpen(true)}
            onToast={showToast}
          />
        ) : (
          <div className="p-8 text-center bg-surface border border-dashed border-border rounded-card">
            <Utensils className="w-8 h-8 text-text-2/40 mx-auto mb-2" />
            <p className="text-sm font-bold text-text">Nenhuma mesa selecionada</p>
            <button
              type="button"
              onClick={() => setTelaAtiva('mesas')}
              className="mt-3 text-xs font-bold text-brand-text underline"
            >
              Voltar para as mesas
            </button>
          </div>
        )}
      </main>

      {/* Botão Flutuante (FAB) de Abrir Mesa — Posicionado na Thumb Zone (Canto Inferior Direito) */}
      {telaAtiva === 'mesas' && (
        <button
          type="button"
          onClick={() => handleAbrirMesaClick('')}
          className="fixed bottom-20 right-4 z-30 min-h-[54px] px-4 rounded-full bg-brand text-on-brand font-black text-xs shadow-modal flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all select-none border-2 border-surface"
          aria-label="Abrir nova mesa"
        >
          <Plus className="w-5 h-5 font-bold" />
          <span>Abrir Mesa</span>
        </button>
      )}

      {/* Barra de Navegação Inferior (Bottom Navigation) com 4 destinos */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-modal z-20">
        <div className="max-w-md mx-auto grid grid-cols-4">
          <button
            type="button"
            onClick={() => setTelaAtiva('mesas')}
            className={`min-h-[56px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors select-none ${
              telaAtiva === 'mesas'
                ? 'text-brand-text border-t-2 border-brand bg-brand-soft/20'
                : 'text-text-2 hover:text-text'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Mesas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (comandaAtivaId) {
                setTelaAtiva('comanda');
              } else {
                showToast('erro', 'Selecione uma mesa aberta no salão para ver a comanda.');
              }
            }}
            className={`min-h-[56px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors select-none ${
              telaAtiva === 'comanda'
                ? 'text-brand-text border-t-2 border-brand bg-brand-soft/20'
                : 'text-text-2 hover:text-text'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{mesaAtiva ? `Mesa ${mesaAtiva}` : 'Comandas'}</span>
          </button>

          <button
            type="button"
            onClick={() => setModo('cozinha')}
            className="min-h-[56px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-text-2 hover:text-text transition-colors select-none"
          >
            <ChefHat className="w-4 h-4" />
            <span>Cozinha</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="min-h-[56px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-text-2 hover:text-danger transition-colors select-none"
          >
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </button>
        </div>
      </nav>

      {/* Modais da Experiência do Garçom */}
      <ModalAbrirMesa
        isOpen={isModalAbrirOpen}
        mesaPredefinida={mesaParaAbrir}
        garcomPadraoId={usuarioAtivoId}
        onClose={() => setIsModalAbrirOpen(false)}
        onMesaAberta={handleMesaAbertaSucesso}
        onErrorToast={(msg) => showToast('erro', msg)}
      />

      {comandaAtivaId && (
        <CardapioModal
          isOpen={isCardapioOpen}
          mesaNumero={mesaAtiva || '...'}
          comandaId={comandaAtivaId}
          onClose={() => setIsCardapioOpen(false)}
          onSucessoEnvio={(qtd) => {
            showToast('sucesso', `${qtd} ${qtd === 1 ? 'item enviado' : 'itens enviados'} para a cozinha com sucesso!`);
            refetchComandas();
          }}
          onErrorToast={(msg) => showToast('erro', msg)}
        />
      )}
    </div>
  );
};

