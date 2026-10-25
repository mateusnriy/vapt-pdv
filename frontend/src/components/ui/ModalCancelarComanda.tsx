import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const FRASE_CANCELAMENTO = 'cancelar comanda';

export interface ModalCancelarComandaProps {
  isOpen: boolean;
  mesa?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirmar: () => void;
}

/**
 * Dupla validação para cancelamento: o operador precisa digitar
 * "cancelar comanda" para liberar o botão de confirmação.
 */
export const ModalCancelarComanda: React.FC<ModalCancelarComandaProps> = ({
  isOpen,
  mesa,
  isLoading = false,
  onClose,
  onConfirmar,
}) => {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    if (isOpen) setTexto('');
  }, [isOpen]);

  const confirmado = texto.trim().toLowerCase() === FRASE_CANCELAMENTO;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancelar comanda" maxWidth="sm">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (confirmado && !isLoading) onConfirmar();
        }}
      >
        <div className="flex items-start gap-3 p-3.5 rounded-input bg-danger-soft border border-danger/30">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <p id="cancelar-comanda-aviso" className="text-xs text-danger-text leading-relaxed">
            {mesa ? `A comanda da Mesa ${mesa} será` : 'A comanda será'} cancelada e a mesa será
            liberada. Os itens lançados não serão cobrados e não terão baixa de estoque. Esta ação
            não pode ser desfeita.
          </p>
        </div>

        <div>
          <label htmlFor="confirmar-cancelamento" className="text-xs font-semibold text-text-2 block mb-1.5">
            Para confirmar, digite <strong className="text-text">{FRASE_CANCELAMENTO}</strong>
          </label>
          <input
            id="confirmar-cancelamento"
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={isLoading}
            autoFocus
            autoComplete="off"
            aria-describedby="cancelar-comanda-aviso"
            placeholder={FRASE_CANCELAMENTO}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-input bg-surface border border-border text-text text-sm font-medium focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Voltar
          </Button>
          <Button type="submit" variant="danger" disabled={!confirmado || isLoading} isLoading={isLoading}>
            Cancelar comanda
          </Button>
        </div>
      </form>
    </Modal>
  );
};
