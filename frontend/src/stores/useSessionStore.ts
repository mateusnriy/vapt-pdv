import { create } from 'zustand';

export type ModoOperacao = 'garcom' | 'caixa';

interface SessionState {
  modo: ModoOperacao;
  usuarioAtivoId: number | null;
  nomeOperador: string;
  setModo: (modo: ModoOperacao) => void;
  setUsuarioAtivo: (id: number | null, nome?: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  modo: 'garcom',
  usuarioAtivoId: null,
  nomeOperador: 'Garçom Padrão',
  setModo: (modo) => set({ modo }),
  setUsuarioAtivo: (usuarioAtivoId, nomeOperador) =>
    set((state) => ({
      usuarioAtivoId,
      nomeOperador: nomeOperador || state.nomeOperador,
    })),
}));
