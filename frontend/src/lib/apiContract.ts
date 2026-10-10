/**
 * Contrat API — source unique de vérité côté frontend.
 *
 * ⚠️ Le dépôt ne contient AUCUN code backend Flask ni spécification OpenAPI.
 * Les conventions ci-dessous sont déduites des maquettes HTML du projet
 * (admin_structures.html, modifier_structure.html, create.html) et documentées
 * dans `docs/api/structures.md`. Si le backend diffère, ajuster UNIQUEMENT
 * ce fichier et les schémas Zod associés — jamais les composants.
 */

/** Préfixe d'API supposé pour le backend TURIHO. */
export const API_PREFIX = '/api/v1';

/** Ressources & sous-ressources utilisées par le module Structures. */
export const endpoints = {
  structures: () => `${API_PREFIX}/structures`,
  structureBySlug: (slug: string) =>
    `${API_PREFIX}/structures/${encodeURIComponent(slug)}`,
  structureById: (id: string | number) =>
    `${API_PREFIX}/structures/${encodeURIComponent(String(id))}`,
} as const;

/** Clés de cache TanStack Query (centralisées pour l'invalidation). */
export const queryKeys = {
  structures: ['structures'] as const,
  structureList: (params: object) =>
    ['structures', 'list', params] as const,
  structureDetail: (slug: string) => ['structures', 'detail', slug] as const,
} as const;
