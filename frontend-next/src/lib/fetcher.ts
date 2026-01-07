const API_BASE_URL = '/api/v1';

export async function fetcher<T>(url: string): Promise<T> {
  // If URL already has /api/v1, use as-is; otherwise prepend
  const fullUrl = url.startsWith('/api/v1') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl);
  
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  
  const json = await res.json();
  return json.data;
}

export async function fetchWithBody<T, B>(
  url: string, 
  method: 'POST' | 'PUT' | 'DELETE',
  body?: B
): Promise<T> {
  // If URL already has /api/v1, use as-is; otherwise prepend
  const fullUrl = url.startsWith('/api/v1') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  
  const json = await res.json();
  return json.data;
}
