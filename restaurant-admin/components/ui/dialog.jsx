'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      {/* Content wrapper */}
      <div className="relative z-10 w-full sm:max-w-md">
        {children}
      </div>
    </div>
  );
}

function DialogContent({ className, children, onClose, ...props }) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full p-6',
        'animate-in slide-in-from-bottom sm:zoom-in-90 duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

function DialogTitle({ className, children, ...props }) {
  return (
    <h2 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h2>
  );
}

function DialogDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-gray-500', className)} {...props}>
      {children}
    </p>
  );
}

function DialogFooter({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6', className)} {...props}>
      {children}
    </div>
  );
}

function DialogTrigger({ children, onClick, ...props }) {
  return (
    <span onClick={onClick} {...props}>
      {children}
    </span>
  );
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger };
