import { useEffect, useState } from 'react';
import { apiGet, type HealthResponse } from '@/lib/api';
import type { ApiStatus } from '../types';

/** Encapsula a chamada ao /health. A page só recebe o `status` pronto. */
export function useHomeStatus() {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    apiGet<HealthResponse>('/health')
      .then((r) => setStatus(r.status === 'ok' ? 'ok' : 'down'))
      .catch(() => setStatus('down'));
  }, []);

  return { status };
}
