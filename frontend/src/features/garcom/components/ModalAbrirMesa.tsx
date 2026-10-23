import React, { useState, useEffect } from 'react';
import { User, Users, AlertCircle, Utensils } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useGarconsAtivos } from '../../../hooks/useUsuarios';
import { useAbrirComanda } from '../../../hooks/useComandas';
import { ApiError } from '../../../services/apiClient';
import type { Comanda } from '../../../types/api';

export interface ModalAbrirMesaProps {
  isOpen: boolean;
  mesaPredefinida?: string;
  garcomPadraoId?: number | null;
  onClose: () => void;
  onMesaAberta: (comanda: Comanda) => void;
  onErrorToast?: (mensagem: string) => void;
}

export const ModalAbrirMesa: React.FC<ModalAbrirMesaProps> = ({
  isOpen,
  mesaPredefinida = '',
  garcomPadraoId,
  onClose,
  onMesaAberta,
  onErrorToast,
}) => {
  const [mesa, setMesa] = useState(mesaPredefinida);
  const [nomeCliente, setNomeCliente] = useState('');
  const [garcomId, setGarcomId] = useState<number | null>(garcomPadraoId ?? null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const { data: garcons, isLoading: isLoadingGarcons } = useGarconsAtivos();
  const abrirComandaMut = useAbrirComanda();

  useEffect(() => {
    if (mesaPredefinida) {
      setMesa(mesaPredefinida);
    }
  }, [mesaPredefinida]);

  useEffect(() => {
    if (garcomPadraoId) {
      setGarcomId(garcomPadraoId);
    } else if (garcons && garcons.length > 0 && !garcomId) {
      setGarcomId(garcons[0].id);
    }
  }, [garcomPadraoId, garcons, garcomId]);

  useEffect(() => {
    if (isOpen) {
      setErroLocal(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLocal(null);

    const mesaTrim = mesa.trim();
    if (!mesaTrim) {
      setErroLocal('Informe o número ou identificação da mesa.');
      return;
    }

    if (!garcomId) {
      setErroLocal('Selecione o garçom responsável pelo atendimento.');
      return;
    }

    try {
      const novaComanda = await abrirComandaMut.mutateAsync({
        mesa: mesaTrim,
        garcom_id: garcomId,
        nome_cliente: nomeCliente.trim() || undefined,
      });

      setNomeCliente('');
      onMesaAberta(novaComanda);
      onClose();
    } catch (err) {
      let msg = 'Erro ao abrir mesa.';
      if (err instanceof ApiError) {
        if (err.codigo === 'MESA_OCUPADA') {
          msg = `A mesa ${mesaTrim} já possui uma comanda aberta no salão.`;
        } else {
          msg = `${err.codigo}: ${err.message}`;
        }
      }
      setErroLocal(msg);
      onErrorToast?.(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Abrir Atendimento — Mesa ${mesa || '...'}`}
      description="Inicie a comanda no salão para começar a lançar pedidos."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {erroLocal && (
          <div className="p-3 bg-danger-soft border border-danger/30 rounded-card flex items-start gap-2.5 text-xs text-danger font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{erroLocal}</span>
          </div>
        )}

        {/* Campo Número da Mesa */}
        <div>
          <label className="block text-xs font-bold text-text mb-1 uppercase tracking-wider">
            Número da Mesa
          </label>
          <Input
            type="text"
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            placeholder="Ex: 5"
            leftIcon={<Utensils className="w-4 h-4" />}
            required
            autoFocus
          />
        </div>

        {/* Seleção de Garçom Responsável */}
        <div>
          <label className="block text-xs font-bold text-text mb-1 uppercase tracking-wider">
            Garçom Atendente
          </label>
          {isLoadingGarcons ? (
            <div className="h-11 rounded-input bg-surface-2 animate-pulse" />
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {garcons?.map((g) => {
                const isSelected = garcomId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGarcomId(g.id)}
                    className={`h-11 min-h-[44px] px-3 rounded-card text-xs font-bold border flex items-center gap-2 transition-all select-none ${
                      isSelected
                        ? 'bg-brand text-on-brand border-brand shadow-soft ring-2 ring-brand/30'
                        : 'bg-surface-2 text-text border-border hover:bg-border/40'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{g.nome}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Nome do Cliente (Opcional) */}
        <div>
          <label className="block text-xs font-bold text-text mb-1 uppercase tracking-wider">
            Nome do Cliente (Opcional)
          </label>
          <Input
            type="text"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            placeholder="Ex: Família Souza, João..."
            leftIcon={<User className="w-4 h-4" />}
          />
        </div>

        {/* Ações do Modal */}
        <div className="pt-2 flex gap-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={abrirComandaMut.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={abrirComandaMut.isPending}
            disabled={!mesa.trim() || !garcomId}
          >
            Abrir Mesa
          </Button>
        </div>
      </form>
    </Modal>
  );
};
