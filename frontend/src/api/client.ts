const API_BASE_URL = '';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null as any;
  }

  // Handle CSV/Blob downloads
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    const blob = await response.blob();
    return blob as any;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    if (data && data.detail) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map((d: any) => d.msg || d).join(', ');
      }
    }
    throw new Error(errorMsg);
  }

  return data as T;
}
