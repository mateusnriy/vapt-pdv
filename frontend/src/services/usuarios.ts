import { apiClient } from './apiClient';
import type {
  Usuario,
  CriarUsuarioDto,
  ListarUsuariosFiltros,
} from '../types/api';

export const usuariosApi = {
  listar: (filtros?: ListarUsuariosFiltros) =>
    apiClient.get<Usuario[]>('/usuarios', filtros as Record<string, string | number | boolean | undefined>),

  consultarPorId: (id: number) =>
    apiClient.get<Usuario>(`/usuarios/${id}`),

  criar: (dto: CriarUsuarioDto) =>
    apiClient.post<Usuario>('/usuarios', dto),

  inativar: (id: number) =>
    apiClient.post<Usuario>(`/usuarios/${id}/inativar`),

  validarGarcom: (id: number) =>
    apiClient.get<{ id: number; nome: string; valido: boolean }>(`/usuarios/${id}/validar-garcom`),
};
