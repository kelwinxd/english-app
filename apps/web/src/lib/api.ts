// Base da API. Em dev fica '/api' (proxy do Vite). Em produção, VITE_API_URL
// aponta para a URL pública da API no Railway.
const BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `POST ${path} -> ${res.status}`);
  return data as T;
}

/**
 * POST multipart cuja resposta é NDJSON (um JSON por linha). Chama `onEvent`
 * para cada evento conforme ele chega. Em erro HTTP (ex.: 429), tenta ler o
 * JSON de erro e lança.
 */
export async function apiPostFormStream<E>(
  path: string,
  form: FormData,
  onEvent: (event: E) => void,
): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `POST ${path} -> ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const flushLines = (final = false) => {
    let idx: number;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line) onEvent(JSON.parse(line) as E);
    }
    if (final && buffer.trim()) onEvent(JSON.parse(buffer.trim()) as E);
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    flushLines();
  }
  flushLines(true);
}

export type HealthResponse = {
  status: string;
  uptime: number;
  timestamp: string;
};
