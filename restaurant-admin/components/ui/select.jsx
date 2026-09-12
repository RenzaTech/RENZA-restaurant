'use client';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

const Select = forwardRef(({ className, children, value, onChange, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10',
          'text-base text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'min-h-[48px]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
    </div>
  );
});

Select.displayName = 'Select';

function SelectOption({ value, children, ...props }) {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
}

export { Select, SelectOption };
