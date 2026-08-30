export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const BASE_URL = `${API_BASE}/api`;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export interface ApiErrorResponse {
  code?: string;
  message?: string;
  requestId?: string;
  details?: any;
}

async function request<T>(method: string, endpoint: string, body?: any, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const activeOrgId = localStorage.getItem('active_org_id');
  const headers: Record<string, string> = {
    'X-Request-Id': crypto.randomUUID(),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeOrgId) {
    headers['X-Organization-Id'] = activeOrgId;
  }

  let url = `${BASE_URL}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams.toString()}`;
  }

  let requestBody: any = undefined;

  if (body) {
    if (body instanceof FormData) {
      requestBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  const config: RequestInit = {
    method,
    headers: {
      ...headers,
      ...options.headers,
    },
    body: requestBody,
    ...options,
  };

  const response = await fetch(url, config);

  // Capture updated organization header if sent back
  const returnedOrgId = response.headers.get('X-Organization-Id');
  if (returnedOrgId && returnedOrgId !== activeOrgId) {
    localStorage.setItem('active_org_id', returnedOrgId);
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `Request failed with status ${response.status}` };
    }
    const error = new Error(errorData.message || `Request failed with status ${response.status}`) as Error & {
      status: number;
      data: ApiErrorResponse;
      requestId?: string;
    };
    error.status = response.status;
    error.data = errorData;
    error.requestId = response.headers.get('X-Request-Id') || undefined;

    // Dispatch global error modal for user feedback (except 401 unauthenticated redirect cases)
    if (typeof window !== 'undefined' && response.status !== 401) {
      window.dispatchEvent(
        new CustomEvent('show_global_error', {
          detail: {
            title: response.status === 403 ? 'Access Restricted' : 'Operation Notice',
            message: errorData.message || `The service returned HTTP status ${response.status}.`,
            code: errorData.code || `ERR_${response.status}`,
            requestId: response.headers.get('X-Request-Id') || undefined,
          }
        })
      );
    }

    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>('GET', endpoint, undefined, options),
  post: <T>(endpoint: string, body?: any, options?: RequestOptions) => request<T>('POST', endpoint, body, options),
  put: <T>(endpoint: string, body?: any, options?: RequestOptions) => request<T>('PUT', endpoint, body, options),
  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>('DELETE', endpoint, undefined, options),
};

export default api;
