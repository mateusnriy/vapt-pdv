import React from 'react';
import { cn } from '../../lib/utils';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={cn(
        'inline-flex items-center justify-between gap-3 cursor-pointer select-none py-1.5 min-h-[44px]',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-sm font-semibold text-text">{label}</span>}
          {description && <span className="text-xs text-text-2">{description}</span>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20',
          checked ? 'bg-brand' : 'bg-border'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface shadow-md ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
