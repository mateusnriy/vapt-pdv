import { create } from 'zustand';

export type Tema = 'claro' | 'escuro';

const STORAGE_KEY = 'vapt_pdv_tema';

function obterTemaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
  } catch {
    // localStorage indisponível: segue para a preferência do sistema
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'escuro';
  }
  return 'claro';
}

function aplicarTema(tema: Tema) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', tema === 'escuro');
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', tema === 'escuro' ? '#17120F' : '#2B2019');
}

interface ThemeState {
  tema: Tema;
  alternarTema: () => void;
  definirTema: (tema: Tema) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  tema: obterTemaInicial(),
  definirTema: (tema) => {
    try {
      localStorage.setItem(STORAGE_KEY, tema);
    } catch {
      // Ignora erro de gravação
    }
    aplicarTema(tema);
    set({ tema });
  },
  alternarTema: () => get().definirTema(get().tema === 'claro' ? 'escuro' : 'claro'),
}));

// Aplica o tema salvo assim que o módulo é carregado no navegador (evita flash de tema errado)
if (typeof window !== 'undefined') {
  aplicarTema(useThemeStore.getState().tema);

  // Escuta mudanças de preferência do SO quando o usuário ainda não gravou escolha explícita
  try {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', (e) => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          useThemeStore.getState().definirTema(e.matches ? 'escuro' : 'claro');
        }
      } catch {
        // Ignora erro de acesso ao localStorage
      }
    });
  } catch {
    // matchMedia não suportado
  }
}
