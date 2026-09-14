'use client';

import EmptyState from '../../../components/EmptyState';

export default function Error({ reset }) {
  return <EmptyState variant="error" onReset={reset} />;
}