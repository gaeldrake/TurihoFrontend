import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * MSW — mock du backend Flask UNIQUEMENT pour les tests (règle §27).
 * Les chemins correspondent au contrat docs/api/structures.md.
 */
const BASE = 'http://localhost:5000/api/v1';

export const handlers = [
  http.get(`${BASE}/structures`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        per_page: 20,
        total: 0,
        pages: 1,
        has_next: false,
        has_previous: false,
      },
    }),
  ),
];

export const server = setupServer(...handlers);
