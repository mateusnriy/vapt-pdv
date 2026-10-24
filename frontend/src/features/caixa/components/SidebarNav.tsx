import React from 'react';
import {
  UtensilsCrossed,
  ShoppingCart,
  LayoutGrid,
  ClipboardList,
  Wallet,
  Smartphone,
  LogOut,
  User,
} from 'lucide-react';
import { useSessionStore } from '../../../stores/useSessionStore';

export interface SidebarNavProps {
  abaAtiva?: 'venda' | 'mesas' | 'pedidos' | 'caixa';
  onAbaChange?: (aba: 'venda' | 'mesas' | 'pedidos' | 'caixa') => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  abaAtiva = 'venda',
  onAbaChange,
}) => {
  const { nomeOperador, perfilAtivo, setModo, logout } = useSessionStore();

  const navItems = [
    {
      id: 'venda' as const,
      label: 'Venda',
      icon: ShoppingCart,
    },
    {
      id: 'mesas' as const,
      label: 'Mesas',
      icon: LayoutGrid,
    },
    {
      id: 'pedidos' as const,
      label: 'Pedidos',
      icon: ClipboardList,
    },
    {
      id: 'caixa' as const,
      label: 'Caixa',
      icon: Wallet,
    },
  ];

  return (
    <aside
      className="w-[88px] min-w-[88px] max-w-[88px] h-full bg-nav flex flex-col items-center justify-between py-4 select-none border-r border-[#43342A] z-20"
      aria-label="Navegação do Caixa"
    >
      {/* Topo: Logotipo Vapt */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => onAbaChange?.('venda')}
          className="w-12 h-12 rounded-[14px] bg-brand text-on-brand flex items-center justify-center font-black text-xl shadow-soft hover:opacity-95 transition-transform active:scale-95"
          title="VaptPDV — Início"
          aria-label="VaptPDV Início"
        >
          <UtensilsCrossed className="w-6 h-6 text-on-brand" />
        </button>

        {/* Itens de Navegação Primária */}
        <nav className="flex flex-col items-center gap-2 mt-2 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isAtivo = abaAtiva === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onAbaChange?.(item.id)}
                className={`w-full py-2.5 px-1 rounded-[14px] flex flex-col items-center justify-center gap-1 transition-all ${
                  isAtivo
                    ? 'bg-[#523C2E] text-[#F6EEE4] shadow-sm font-bold'
                    : 'text-[#C9B8A6] hover:bg-[#523C2E]/50 hover:text-[#F6EEE4]'
                }`}
                aria-current={isAtivo ? 'page' : undefined}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${isAtivo ? 'text-brand' : 'text-[#C9B8A6]'}`} />
                <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Meio / Inferior: Alternar Modo e Operador */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Alternar para Modo Garçom PWA */}
        <button
          onClick={() => setModo('garcom')}
          className="w-full py-2 px-1 rounded-[14px] flex flex-col items-center justify-center gap-1 text-[#C9B8A6] hover:bg-[#523C2E]/60 hover:text-[#F6EEE4] transition-colors"
          title="Alternar para Modo Garçom (PWA)"
        >
          <Smartphone className="w-5 h-5 text-[#C9B8A6]" />
          <span className="text-[10px] leading-tight text-center">Garçom</span>
        </button>

        {/* Divisor */}
        <div className="w-8 h-px bg-[#43342A] my-1" />

        {/* Operador Ativo */}
        <div
          className="w-10 h-10 rounded-full bg-[#523C2E] border border-[#8F7B69]/40 flex items-center justify-center text-[#F6EEE4] font-bold text-xs shadow-soft relative group cursor-pointer"
          title={`${nomeOperador} (${perfilAtivo || 'Operador'})`}
        >
          <User className="w-4 h-4 text-brand" />
        </div>

        {/* Botão de Logout / Trocar Operador */}
        <button
          onClick={logout}
          className="p-2 rounded-btn text-[#C9B8A6] hover:text-danger-soft hover:bg-danger/20 transition-colors"
          title="Trocar Operador / Ir para Login"
          aria-label="Sair / Trocar Operador"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
