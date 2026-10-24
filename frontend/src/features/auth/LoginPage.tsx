import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  ChefHat,
  BarChart3,
  UserCheck,
  UserPlus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Coffee,
} from 'lucide-react';
import { useUsuariosAtivos, useCriarUsuario } from '../../hooks/useUsuarios';
import { useSessionStore } from '../../stores/useSessionStore';
import type { PerfilUsuario, Usuario } from '../../types/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface PerfilConfig {
  titulo: string;
  subtitulo: string;
  descricao: string;
  estacao: string;
  icone: React.ComponentType<{ className?: string }>;
  badgeColor: 'brand' | 'success' | 'danger' | 'neutral';
  bgSoft: string;
}

const PERFIS_CONFIG: Record<PerfilUsuario, PerfilConfig> = {
  garcom: {
    titulo: 'Modo Garçom',
    subtitulo: 'Salão & PWA Mobile',
    descricao: 'Abertura de mesas, visualização do salão e envio rápido de pedidos com uma mão.',
    estacao: 'Smartphones Android / iOS (PWA)',
    icone: Smartphone,
    badgeColor: 'success',
    bgSoft: 'bg-success-soft/40',
  },
  caixa: {
    titulo: 'Modo Caixa',
    subtitulo: 'Balcão & Pagamento',
    descricao: 'Conferência de consumo, taxa de serviço de 10%, split payments e baixa de estoque.',
    estacao: 'Desktop / Widescreen (1440×900)',
    icone: Monitor,
    badgeColor: 'brand',
    bgSoft: 'bg-brand-soft/50',
  },
  cozinha: {
    titulo: 'Painel KDS',
    subtitulo: 'Display de Produção',
    descricao: 'Fila cronológica de preparo em 3 colunas (Recebido, Em Preparo, Pronto) com SLA visual.',
    estacao: 'Monitor / Tablet de Cozinha e Bar',
    icone: ChefHat,
    badgeColor: 'danger',
    bgSoft: 'bg-danger-soft/40',
  },
  gerente: {
    titulo: 'Painel de Gestão',
    subtitulo: 'Administração & BI',
    descricao: 'Gestão de cardápio, alerta de estoque mínimo, Curva ABC e métricas de desempenho.',
    estacao: 'Notebook / Desktop Gerencial',
    icone: BarChart3,
    badgeColor: 'neutral',
    bgSoft: 'bg-surface-2',
  },
};

const OPERADORES_DEMO = [
  { nome: 'Lucas Garçom', perfil: 'garcom' as const },
  { nome: 'Carla Caixa', perfil: 'caixa' as const },
  { nome: 'Seu Roberto Cozinha', perfil: 'cozinha' as const },
  { nome: 'Marcos Gerente', perfil: 'gerente' as const },
];

export function LoginPage() {
  const { login, setModo } = useSessionStore();
  const { data: usuarios, isLoading } = useUsuariosAtivos();
  const criarUsuarioMut = useCriarUsuario();
  const [perfilFiltro, setPerfilFiltro] = useState<PerfilUsuario | 'todos'>('todos');
  const [isSeeding, setIsSeeding] = useState(false);

  const usuariosFiltrados = (usuarios || []).filter(
    (u) => perfilFiltro === 'todos' || u.perfil === perfilFiltro,
  );

  const handleCadastrarEquipeDemo = async () => {
    setIsSeeding(true);
    try {
      for (const op of OPERADORES_DEMO) {
        await criarUsuarioMut.mutateAsync(op);
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const handleEntrarDireto = (perfil: PerfilUsuario) => {
    // Busca o primeiro usuário cadastrado daquele perfil ou cria uma sessão transitória
    const usuarioExistente = usuarios?.find((u) => u.perfil === perfil);
    if (usuarioExistente) {
      login(usuarioExistente);
    } else {
      const mock: Usuario = {
        id: 99,
        nome: `${PERFIS_CONFIG[perfil].titulo} Demo`,
        perfil,
        ativo: true,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      };
      login(mock);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-4 sm:p-8">
      {/* Topo / Marca */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-card bg-brand text-on-brand flex items-center justify-center font-black text-2xl shadow-soft">
            V
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              VaptPDV
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-soft text-brand-text border border-brand/20">
                Food Service OS
              </span>
            </h1>
            <p className="text-xs text-text-2">Sistema Operacional para Bares e Lanchonetes</p>
          </div>
        </div>

        <button
          onClick={() => setModo('design')}
          className="text-xs font-bold text-text-2 hover:text-text px-3 py-1.5 rounded-full hover:bg-surface-2 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Design System & API</span>
        </button>
      </header>

      {/* Conteúdo Central */}
      <main className="max-w-6xl mx-auto w-full my-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-text-2 mb-3 shadow-soft">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>Turno Operacional · Sem atrito de senhas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
            Selecione sua estação de trabalho
          </h2>
          <p className="text-sm text-text-2 mt-2">
            Escolha o colaborador ou perfil para ser direcionado automaticamente à interface
            especializada do seu posto de atendimento.
          </p>
        </div>

        {/* 4 Cards das Estações Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {(Object.keys(PERFIS_CONFIG) as PerfilUsuario[]).map((perfil) => {
            const config = PERFIS_CONFIG[perfil];
            const Icone = config.icone;
            const operadoresDoPerfil = (usuarios || []).filter((u) => u.perfil === perfil);

            return (
              <div
                key={perfil}
                className="group relative bg-surface border border-border hover:border-brand rounded-card-lg p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-card cursor-pointer"
                onClick={() => handleEntrarDireto(perfil)}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-input ${config.bgSoft} flex items-center justify-center text-text transition-transform group-hover:scale-105`}
                    >
                      <Icone className="w-6 h-6" />
                    </div>
                    <Badge variant={config.badgeColor}>{config.subtitulo}</Badge>
                  </div>

                  <h3 className="font-extrabold text-lg text-text group-hover:text-brand-text transition-colors">
                    {config.titulo}
                  </h3>
                  <p className="text-xs text-text-2 mt-1 leading-relaxed">{config.descricao}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <div className="text-[11px] font-semibold text-text-2 mb-2 flex items-center justify-between">
                    <span>{config.estacao}</span>
                    <span className="font-bold tabular-nums">
                      {operadoresDoPerfil.length}{' '}
                      {operadoresDoPerfil.length === 1 ? 'operador' : 'operadores'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-btn text-xs font-bold bg-surface-2 group-hover:bg-brand group-hover:text-on-brand transition-all text-text"
                  >
                    <span>Acessar Estação</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seção de Colaboradores Cadastrados */}
        <div className="bg-surface border border-border rounded-card-lg p-6 shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="font-extrabold text-base text-text flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand" />
                Colaboradores em Atividade
              </h3>
              <p className="text-xs text-text-2">
                Clique no seu nome para assumir o turno com registro auditável de comissões e vendas.
              </p>
            </div>

            {/* Filtro por Perfil */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setPerfilFiltro('todos')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  perfilFiltro === 'todos'
                    ? 'bg-brand text-on-brand shadow-soft'
                    : 'bg-surface-2 text-text-2 hover:bg-border'
                }`}
              >
                Todos
              </button>
              {(Object.keys(PERFIS_CONFIG) as PerfilUsuario[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPerfilFiltro(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${
                    perfilFiltro === p
                      ? 'bg-brand text-on-brand shadow-soft'
                      : 'bg-surface-2 text-text-2 hover:bg-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Colaboradores */}
          <div className="mt-5">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-2 animate-pulse">
                Carregando operadores ativos da equipe...
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="py-10 text-center">
                <Coffee className="w-10 h-10 text-border mx-auto mb-2" />
                <p className="text-sm font-bold text-text">Nenhum operador cadastrado ainda.</p>
                <p className="text-xs text-text-2 max-w-md mx-auto mt-1 mb-4">
                  Para começar a operar o restaurante, cadastre os colaboradores padrão da equipe com
                  um clique abaixo.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCadastrarEquipeDemo}
                  disabled={isSeeding}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isSeeding ? 'Cadastrando equipe...' : 'Cadastrar Equipe Inicial (Demo)'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {usuariosFiltrados.map((usuario) => {
                  const config = PERFIS_CONFIG[usuario.perfil];
                  const Icone = config.icone;

                  return (
                    <button
                      key={usuario.id}
                      onClick={() => login(usuario)}
                      className="group flex items-center justify-between p-3.5 rounded-card bg-surface-2 hover:bg-brand hover:text-on-brand transition-all text-left border border-transparent hover:border-brand shadow-soft"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-input bg-surface text-text flex items-center justify-center font-bold text-xs shrink-0 shadow-soft">
                          <Icone className="w-4 h-4 text-text-2 group-hover:text-text" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold truncate text-text group-hover:text-on-brand">
                            {usuario.nome}
                          </div>
                          <div className="text-[11px] text-text-2 group-hover:text-on-brand/80 capitalize">
                            {usuario.perfil}
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 shrink-0 text-text-2 group-hover:text-on-brand group-hover:translate-x-0.5 transition-transform ml-2" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="max-w-6xl mx-auto w-full pt-4 pb-2 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-2 gap-2">
        <span>VaptPDV · Ponto de Venda Distribuído para Bares e Lanchonetes</span>
        <span>Sistemas Distribuídos · DCC/UERN</span>
      </footer>
    </div>
  );
}
