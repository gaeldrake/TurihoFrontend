import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

// Base API factice pour les tests — MSW intercepte toutes les requêtes.
// (Aucune URL backend réelle codée en dur dans le code applicatif.)
vi.stubEnv('VITE_API_URL', 'http://test.local');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
