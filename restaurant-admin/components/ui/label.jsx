'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Label = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn('text-sm font-medium text-gray-700 leading-none', className)}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';

export { Label };
