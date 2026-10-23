import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'R$ 0,00';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatElapsedTime(isoString?: string | null): string {
  if (!isoString) return '';
  const start = new Date(isoString).getTime();
  if (isNaN(start)) return '';
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.floor((now - start) / (1000 * 60)));
  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
}
