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
        'rounded-xl border bg-white p-6',
        'border-[#E8E6E0]',
        '[box-shadow:0_1px_3px_rgba(26,25,21,0.06),_0_1px_2px_rgba(26,25,21,0.04)]',
        interactive &&
          'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:[box-shadow:0_4px_12px_rgba(26,25,21,0.08),_0_2px_4px_rgba(26,25,21,0.04)]',
        selected && 'border-[#C9A84C] ring-2 ring-[#F0E4C0]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
