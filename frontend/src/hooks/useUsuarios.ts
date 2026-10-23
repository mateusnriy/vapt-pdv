import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../services/usuarios';
import type { ListarUsuariosFiltros, CriarUsuarioDto } from '../types/api';

export const USUARIOS_QUERY_KEY = ['usuarios'] as const;

export function useUsuarios(filtros?: ListarUsuariosFiltros) {
  return useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, filtros],
    queryFn: () => usuariosApi.listar(filtros),
    staleTime: 1000 * 60, // 1 minuto
  });
}

export function useGarconsAtivos() {
  return useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, { perfil: 'garcom', ativo: true }],
    queryFn: () => usuariosApi.listar({ perfil: 'garcom', ativo: true }),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useCriarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CriarUsuarioDto) => usuariosApi.criar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}

export function useInativarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usuariosApi.inativar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}
