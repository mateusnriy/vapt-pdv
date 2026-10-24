import { create } from 'zustand';
import type { PerfilUsuario, Usuario } from '../types/api';

export type ModoOperacao = 'login' | 'garcom' | 'caixa' | 'gerente' | 'cozinha' | 'design';

interface SessionState {
  modo: ModoOperacao;
  usuarioAtivoId: number | null;
  nomeOperador: string;
  perfilAtivo: PerfilUsuario | null;
  usuarioAtivo: Usuario | null;
  setModo: (modo: ModoOperacao) => void;
  setUsuarioAtivo: (id: number | null, nome?: string, perfil?: PerfilUsuario) => void;
  login: (usuario: Usuario) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  modo: 'login',
  usuarioAtivoId: null,
  nomeOperador: 'Selecione um Operador',
  perfilAtivo: null,
  usuarioAtivo: null,
  setModo: (modo) => set({ modo }),
  setUsuarioAtivo: (usuarioAtivoId, nomeOperador, perfil) =>
    set((state) => ({
      usuarioAtivoId,
      nomeOperador: nomeOperador || state.nomeOperador,
      perfilAtivo: perfil || state.perfilAtivo,
    })),
  login: (usuario) => {
    // Mapeamento automático do perfil para a rota/modo operacional
    const modoPorPerfil: Record<PerfilUsuario, ModoOperacao> = {
      garcom: 'garcom',
      caixa: 'caixa',
      gerente: 'gerente',
      cozinha: 'cozinha',
    };
    set({
      usuarioAtivo: usuario,
      usuarioAtivoId: usuario.id,
      nomeOperador: usuario.nome,
      perfilAtivo: usuario.perfil,
      modo: modoPorPerfil[usuario.perfil] || 'garcom',
    });
  },
  logout: () =>
    set({
      usuarioAtivo: null,
      usuarioAtivoId: null,
      nomeOperador: 'Selecione um Operador',
      perfilAtivo: null,
      modo: 'login',
    }),
}));
