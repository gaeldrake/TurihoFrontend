import { API_PREFIX } from './apiContract';

/**
 * Erreur normalisée du client API.
 * L'enveloppe backend supposée (docs/api/structures.md §2) :
 * { success: false, error: { code, message, details? } }
 */
export class ApiError extends Error {
  readonly status: number;
  /** Code métier renvoyé par le backend (ou code HTTP si absent). */
  readonly code: string;
  /** Détails de validation backend, p. ex. { name: ["Le nom est requis."] }. */
  readonly details?: Record<string, unknown>;
  /** true si l'utilisateur doit se réauthentifier (401). */
  readonly isAuthError: boolean;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isAuthError = status === 401;
  }

  /** Message court et sûr à afficher à l'utilisateur (jamais la réponse brute). */
  getUserMessage(): string {
    switch (this.status) {
      case 400:
        return 'Les données envoyées sont invalides.';
      case 401:
        return 'Vous devez être connecté pour effectuer cette action.';
      case 403:
        return 'Vous n’avez pas les autorisations nécessaires.';
      case 404:
        return 'Cette structure est introuvable.';
      case 409:
        return 'Une structure avec ce nom ou cet identifiant existe déjà.';
      case 422:
        return 'Certaines informations posent problème. Vérifiez le formulaire.';
      case 429:
        return 'Trop de requêtes. Veuillez réessayer dans quelques instants.';
      default:
        if (this.status >= 500) {
          return 'Une erreur est survenue côté serveur. Réessayez plus tard.';
        }
        return this.message || 'Une erreur inattendue est survenue.';
    }
  }

  /** Extrait les messages de validation champ par champ (§2 `error.details`). */
  getFieldErrors(): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    if (!this.details) return out;
    for (const [key, value] of Object.entries(this.details)) {
      if (Array.isArray(value)) {
        out[key] = value.map((v) => String(v));
      } else if (typeof value === 'string') {
        out[key] = [value];
      }
    }
    return out;
  }
}

/** Token d'authentification — lu uniquement depuis le store auth (zustand). */
let tokenGetter: () => string | null = () => null;

/** Permet au module auth d'injecter son jeton sans couplage circulaire. */
export function setAuthTokenGetter(getter: () => string | null): void {
  tokenGetter = getter;
}

function apiUrl(path: string): string {
  // VITE_API_URL peut inclure /api/v1 ou non ; on évite la double préfixation.
  const raw = import.meta.env.VITE_API_URL?.trim();
  const base = raw ? raw.replace(/\/+$/, '') : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith(API_PREFIX)) {
    return `${base}${normalizedPath.slice(API_PREFIX.length)}`;
  }
  return `${base}${normalizedPath}`;
}

interface RequestOptions {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(apiUrl(path));
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const token = tokenGetter();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: string | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), { method, headers, body });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Connexion au serveur impossible.');
  }

  const payload = await parseBody(res);

  if (!res.ok) {
    // Enveloppe d'erreur supposée : { success:false, error:{ code, message, details } }
    const err = (payload ?? {}) as {
      error?: { code?: string; message?: string; details?: Record<string, unknown> };
      message?: string;
    };
    const code = err.error?.code ?? `HTTP_${res.status}`;
    const message =
      err.error?.message ?? err.message ?? 'Une erreur est survenue.';
    throw new ApiError(res.status, code, message, err.error?.details);
  }

  return payload as T;
}

/** Client API centralisé — seul point de sortie HTTP du frontend. */
export const api = {
  get: <T>(path: string, options?: Pick<RequestOptions, 'params' | 'headers'>) =>
    request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: Pick<RequestOptions, 'headers'>) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: Pick<RequestOptions, 'headers'>) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: Pick<RequestOptions, 'headers'>) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: Pick<RequestOptions, 'headers'>) =>
    request<T>('DELETE', path, options),
};
