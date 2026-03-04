import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  interactive?: boolean;
}

export function Card({ className, selected, interactive, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-6 shadow-sm',
        interactive && 'cursor-pointer transition-all hover:shadow-md hover:border-brand-300',
        selected && 'border-brand-500 ring-2 ring-brand-200',
        !selected && 'border-navy-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
