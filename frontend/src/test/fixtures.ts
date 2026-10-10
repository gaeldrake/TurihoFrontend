/**
 * ⚠️ Données de TEST uniquement (mocks MSW) — autorisées par la règle §27.
 * Elles ne sont jamais importées par le code applicatif.
 */
import type { Structure, StructureListResponse } from '../features/structures/types/structure';

export const makeStructure = (overrides: Partial<Structure> = {}): Structure => ({
  id: 1,
  name: 'Incubateur Kamenge',
  slug: 'incubateur-kamenge',
  description: 'Accompagnement des jeunes pousses de Bujumbura.',
  logo_url: null,
  cover_url: null,
  email: 'contact@kamenge.bi',
  phone: '+257 22 00 00 00',
  website: 'https://kamenge.bi',
  address: 'Avenue de l’Uprona, Kamenge',
  city: 'Bujumbura Mairie',
  province: 'Bujumbura Mairie',
  country: 'Burundi',
  category: 'incubateur',
  sector: 'Technologie',
  founded_year: 2018,
  status: 'active',
  verification_status: 'verified',
  ...overrides,
});

export const makeListResponse = (
  structures: Structure[],
  paginationOverrides: Partial<StructureListResponse['pagination']> = {},
): StructureListResponse => ({
  success: true,
  data: structures,
  pagination: {
    page: 1,
    per_page: 20,
    total: structures.length,
    pages: 1,
    has_next: false,
    has_previous: false,
    ...paginationOverrides,
  },
});

export const apiErrorBody = (
  code: string,
  message: string,
  details?: Record<string, unknown>,
) => ({ success: false, error: { code, message, details } });
