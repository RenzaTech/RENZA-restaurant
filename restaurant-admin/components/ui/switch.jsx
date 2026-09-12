'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

function Switch({ checked, onCheckedChange, className, disabled = false, ...props }) {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-green-500' : 'bg-gray-300',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-8' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export { Switch };
