import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comandasApi } from '../services/comandas';
import { PRODUTOS_QUERY_KEY } from './useProdutos';
import type {
  ListarComandasFiltros,
  AbrirComandaDto,
  LancarItemDto,
  AjustarItemDto,
  FecharComandaDto,
  PagarComandaDto,
} from '../types/api';

export const COMANDAS_QUERY_KEY = ['comandas'] as const;

export function useComandas(filtros?: ListarComandasFiltros) {
  return useQuery({
    queryKey: [...COMANDAS_QUERY_KEY, filtros],
    queryFn: () => comandasApi.listar(filtros),
    refetchInterval: 1000 * 10, // polling a cada 10s para manter status do salão atualizado
  });
}

export function useComandasSalao() {
  return useQuery({
    queryKey: [...COMANDAS_QUERY_KEY, 'salao'],
    queryFn: async () => {
      const todas = await comandasApi.listar();
      return todas.filter((cmd) => cmd.status === 'aberta' || cmd.status === 'fechada');
    },
    refetchInterval: 1000 * 5, // polling a cada 5s para salão
  });
}

export function useComandasAbertas() {
  return useQuery({
    queryKey: [...COMANDAS_QUERY_KEY, { status: 'aberta' }],
    queryFn: () => comandasApi.listar({ status: 'aberta' }),
    refetchInterval: 1000 * 5, // polling a cada 5s para salão
  });
}

export function useComanda(id: number | null | undefined) {
  return useQuery({
    queryKey: [...COMANDAS_QUERY_KEY, id],
    queryFn: () => (id ? comandasApi.consultarPorId(id) : null),
    enabled: !!id,
  });
}

export function useAbrirComanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AbrirComandaDto) => comandasApi.abrir(dto),
    onSuccess: (comandaCriada) => {
      queryClient.invalidateQueries({ queryKey: COMANDAS_QUERY_KEY });
      queryClient.setQueryData([...COMANDAS_QUERY_KEY, comandaCriada.id], comandaCriada);
    },
  });
}

export function useLancarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comandaId, dto }: { comandaId: number; dto: LancarItemDto }) =>
      comandasApi.lancarItem(comandaId, dto),
    onSuccess: (_, { comandaId }) => {
      queryClient.invalidateQueries({ queryKey: COMANDAS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...COMANDAS_QUERY_KEY, comandaId] });
    },
  });
}

export function useLancarItensLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comandaId, itens }: { comandaId: number; itens: LancarItemDto[] }) =>
      comandasApi.lancarItensLote(comandaId, itens),
    onSuccess: (_, { comandaId }) => {
      queryClient.invalidateQueries({ queryKey: COMANDAS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...COMANDAS_QUERY_KEY, comandaId] });
    },
  });
}

export function useAjustarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      comandaId,
      itemId,
      dto,
    }: {
      comandaId: number;
      itemId: number;
      dto: AjustarItemDto;
    }) => comandasApi.ajustarItem(comandaId, itemId, dto),
    onSuccess: (_, { comandaId }) => {
      queryClient.invalidateQueries({ queryKey: COMANDAS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...COMANDAS_QUERY_KEY, comandaId] });
    },
  });
}

export function useRemoverItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comandaId, itemId }: { comandaId: number; itemId: number }) =>
      comandasApi.removerItem(comandaId, itemId),
    onSuccess: (_, { comandaId }) => {
      queryClient.invalidateQueries({ queryKey: COMANDAS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...COMANDAS_QUERY_KEY, comandaId] });
    },
  });
}

export function useFecharComanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comandaId, dto }: { comandaId: number; dto: FecharComandaDto }) =>
      comandasApi.fechar(comandaId, dto),
    onSuccess: (comandaAtualizada, { comandaId }) => {
      queryClient.invalidateQueries({ queryKey: COMANDAS_QUERY_KEY });
      queryClient.setQueryData([...COMANDAS_QUERY_KEY, comandaId], comandaAtualizada);
    },
  });
}

export function usePagarComanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comandaId, dto }: { comandaId: number; dto: PagarComandaDto }) =>
      comandasApi.pagar(comandaId, dto),
    onSuccess: (comandaPaga, { comandaId }) => {
      queryClient.invalidateQueries({ queryKey: COMANDAS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUTOS_QUERY_KEY });
      queryClient.setQueryData([...COMANDAS_QUERY_KEY, comandaId], comandaPaga);
    },
  });
}

export function useCancelarComanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comandaId: number) => comandasApi.cancelar(comandaId),
    onSuccess: (comandaCancelada, comandaId) => {
      queryClient.invalidateQueries({ queryKey: COMANDAS_QUERY_KEY });
      queryClient.setQueryData([...COMANDAS_QUERY_KEY, comandaId], comandaCancelada);
    },
  });
}
