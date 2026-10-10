import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../test/server';
import { makeListResponse, makeStructure } from '../../../../test/fixtures';
import { StructuresPage } from '../StructuresPage';

const BASE = 'http://localhost:5000/api/v1';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/structures']}>
        <Routes>
          <Route path="/structures" element={<StructuresPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('StructuresPage — états UI', () => {
  it('affiche l’état de chargement puis la liste (success)', async () => {
    server.use(
      http.get(`${BASE}/structures`, async () => {
        await new Promise((r) => setTimeout(r, 50));
        return HttpResponse.json(makeListResponse([makeStructure()]));
      }),
    );

    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('Incubateur Kamenge')).toBeInTheDocument();
  });

  it('affiche l’état vide avec message d’aide', async () => {
    server.use(
      http.get(`${BASE}/structures`, () => HttpResponse.json(makeListResponse([]))),
    );
    renderPage();
    expect(await screen.findByText('Aucune structure trouvée.')).toBeInTheDocument();
    expect(
      screen.getByText('Essayez de modifier votre recherche ou vos filtres.'),
    ).toBeInTheDocument();
  });

  it('affiche l’erreur avec bouton Réessayer', async () => {
    server.use(
      http.get(`${BASE}/structures`, () =>
        HttpResponse.json(
          { success: false, error: { code: 'SERVER_ERROR', message: 'boom' } },
          { status: 500 },
        ),
      ),
    );
    renderPage();
    expect(
      await screen.findByText('Impossible de charger les structures.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('envoie la recherche au backend (server-side) avec debounce', async () => {
    const seenUrls: string[] = [];
    server.use(
      http.get(`${BASE}/structures`, ({ request }) => {
        seenUrls.push(request.url);
        return HttpResponse.json(makeListResponse([makeStructure({ name: 'Résultat BI' })]));
      }),
    );

    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('searchbox');
    await user.type(screen.getByRole('searchbox'), 'tech');

    await waitFor(() => {
      expect(seenUrls.some((u) => u.includes('search=tech'))).toBe(true);
    });
    // Debounce : pas une requête par frappe pour les 4 derniers caractères.
    const searchRequests = seenUrls.filter((u) => u.includes('search=te'));
    expect(searchRequests.length).toBeLessThanOrEqual(2);
  });

  it('applique les filtres dans les paramètres API', async () => {
    let lastUrl = '';
    server.use(
      http.get(`${BASE}/structures`, ({ request }) => {
        lastUrl = request.url;
        return HttpResponse.json(makeListResponse([makeStructure()]));
      }),
    );

    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Incubateur Kamenge');

    await user.selectOptions(screen.getByLabelText('Statut'), 'suspended');
    await waitFor(() => {
      expect(lastUrl).toContain('status=suspended');
    });
  });

  it('utilise la pagination renvoyée par l’API (précédent/suivant)', async () => {
    const spy = vi.fn();
    server.use(
      http.get(`${BASE}/structures`, ({ request }) => {
        spy(request.url);
        const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
        return HttpResponse.json({
          success: true,
          data: [makeStructure({ id: page, name: `Structure page ${page}`, slug: `p-${page}` })],
          pagination: {
            page,
            per_page: 20,
            total: 40,
            pages: 2,
            has_next: page < 2,
            has_previous: page > 1,
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Structure page 1');

    await user.click(screen.getByRole('button', { name: /Suivant/ }));
    await screen.findByText('Structure page 2');
    expect(spy.mock.calls.some((c) => String(c[0]).includes('page=2'))).toBe(true);

    await user.click(screen.getByRole('button', { name: /Précédent/ }));
    await screen.findByText('Structure page 1');
  });
});
