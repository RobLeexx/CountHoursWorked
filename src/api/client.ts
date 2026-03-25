import { APP_CONFIG } from '@/constants';

type Primitive = string | number | boolean;
type QueryParams = Record<string, Primitive | null | undefined>;

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | FormData | Record<string, unknown> | null;
  query?: QueryParams;
};

type JsonRecord = Record<string, unknown>;

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const buildQueryString = (query?: QueryParams) => {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

const normalizeBody = (body?: RequestOptions['body']) => {
  if (!body) {
    return undefined;
  }

  if (body instanceof FormData || typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
};

const buildMessage = (status: number, data: unknown) => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const payload = data as JsonRecord;

    if (typeof payload.message === 'string') {
      return payload.message;
    }
  }

  return `Request failed with status ${status}.`;
};

class ApiClient {
  private readonly baseUrl = APP_CONFIG.apiBaseUrl.replace(/\/$/, '');

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { query, headers, body, ...rest } = options;
    const requestBody = normalizeBody(body);
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}${buildQueryString(query)}`;

    const response = await fetch(url, {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...(requestBody && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: requestBody,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(buildMessage(response.status, data), response.status, data);
    }

    return data as T;
  }

  get<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: RequestOptions['body'], options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }
}

export const apiClient = new ApiClient();

