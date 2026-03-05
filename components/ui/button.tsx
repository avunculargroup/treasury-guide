import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#C9A84C] text-[#1A1915] hover:bg-[#9A7A2E] shadow-sm',
  secondary:
    'bg-white border border-[#E8E6E0] text-[#1A1915] hover:bg-[#F4F4F1]',
  outline:
    'border border-[#E8E6E0] text-[#1A1915] hover:bg-[#F4F4F1]',
  ghost:
    'text-[#1A1915] hover:bg-[#F4F4F1]',
  destructive:
    'bg-[#B04040] text-white hover:bg-[#8F3333] shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 active:scale-[0.98]',
          variantStyles[variant],
          sizeStyles[size],
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
