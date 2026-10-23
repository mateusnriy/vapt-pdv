import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  disabled = false,
  className,
}) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-input bg-surface-2 border border-border p-1',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-lg bg-surface flex items-center justify-center text-text hover:bg-border/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-soft active:scale-95"
        aria-label="Diminuir quantidade"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="w-10 text-center font-bold text-sm text-text tabular-nums select-none">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-lg bg-brand text-on-brand flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed shadow-soft active:scale-95"
        aria-label="Aumentar quantidade"
      >
        <Plus className="w-4 h-4 font-bold" />
      </button>
    </div>
  );
};
