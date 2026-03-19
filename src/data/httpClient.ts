type FetchOptions = RequestInit & { timeoutMs?: number };

const DEFAULT_TIMEOUT = 10_000;

export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    const body = await response.json();
    return body as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
