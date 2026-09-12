'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Button = forwardRef(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    default: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    link: 'text-orange-500 underline-offset-4 hover:underline bg-transparent',
  };

  const sizes = {
    default: 'h-11 px-4 py-2 text-sm min-h-[44px]',
    sm: 'h-9 px-3 text-xs min-h-[36px]',
    lg: 'h-12 px-6 text-base min-h-[48px]',
    icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
