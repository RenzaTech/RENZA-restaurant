'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Textarea = forwardRef(({ className, rows = 3, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'flex w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
