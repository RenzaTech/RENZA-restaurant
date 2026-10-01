'use client';

import { useEffect } from 'react';
import EmptyState from '../../../components/EmptyState';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[Menu Error Boundary Caught]:', error);
  }, [error]);

  return <EmptyState variant="error" onReset={reset} />;
}