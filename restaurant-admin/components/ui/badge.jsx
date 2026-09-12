'use client';

import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-orange-100 text-orange-700',
    secondary: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    destructive: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
