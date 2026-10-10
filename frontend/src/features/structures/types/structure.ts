import { z } from 'zod';

/*
 * Types du module Structures.
 * ⚠️ Déduits de docs/api/structures.md (aucun backend dans ce dépôt).
 * Les enums marqués "supposés" doivent être confirmés par l'équipe backend.
 */

/** Statut opérationnel d'une structure — supposé, [À CONFIRMER backend]. */
export const structureStatusValues = [
  'active',
  'pending',
  'suspended',
  'inactive',
] as const;

/** Statut de vérification — supposé, [À CONFIRMER backend]. */
export const verificationStatusValues = [
  'unverified',
  'pending',
  'verified',
  'rejected',
] as const;

export const structureStatusSchema = z.enum(structureStatusValues);
export const verificationStatusSchema = z.enum(verificationStatusValues);

export type StructureStatus = z.infer<typeof structureStatusSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

/** Modèle complet renvoyé par le backend (enveloppe `data`). */
export interface Structure {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  category?: string | null;
  sector?: string | null;
  founded_year?: number | null;
  status: StructureStatus;
  verification_status: VerificationStatus;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Pagination renvoyée par l'API (§2 du contrat). */
export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/** Réponse liste : { success, data: [], pagination: {} }. */
export interface StructureListResponse {
  /** Clé `success` supposée présente côté backend ; tolérée absente (défensif). */
  success?: boolean;
  data: Structure[];
  pagination: Pagination;
}

/** Réponse détail : { success, data: {...} }. */
export interface StructureDetailResponse {
  success?: boolean;
  data: Structure;
}

/** Paramètres server-side de la liste (recherche, filtres, pagination). */
export interface StructureListParams {
  search?: string;
  category?: string;
  city?: string;
  province?: string;
  sector?: string;
  status?: StructureStatus;
  verification_status?: VerificationStatus;
  page?: number;
  per_page?: number;
}

/* ---------- Validation formulaire (Zod) — UX uniquement, ne remplace pas le backend ---------- */

const optionalString = z
  .string()
  .trim()
  .max(255, 'Maximum 255 caractères.')
  .optional()
  .or(z.literal(''));

const optionalUrl = z
  .union([
    z.string().trim().url('URL invalide (ex. https://exemple.bi).'),
    z.literal(''),
  ])
  .optional();

const optionalEmail = z
  .union([z.string().trim().email('Adresse e-mail invalide.'), z.literal('')])
  .optional();

export const structureFormSchema = z.object({
  name: z
    .string({ error: 'Le nom est requis.' })
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(150, 'Maximum 150 caractères.'),
  category: optionalString,
  sector: optionalString,
  description: z
    .string()
    .trim()
    .max(2000, 'Maximum 2000 caractères.')
    .optional()
    .or(z.literal('')),
  email: optionalEmail,
  phone: optionalString,
  website: optionalUrl,
  address: optionalString,
  city: optionalString,
  province: optionalString,
  country: optionalString,
  // Chaîne vide tolérée (champ non renseigné) ; coercition en nombre borné sinon.
  founded_year: z
    .union([
      z.literal(''),
      z.coerce
        .number({ message: 'Saisissez une année valide.' })
        .int('L’année doit être un nombre entier.')
        .min(1900, 'Année trop ancienne.')
        .max(new Date().getFullYear(), 'L’année ne peut pas être dans le futur.'),
    ])
    .optional(),
  logo_url: optionalUrl,
  cover_url: optionalUrl,
});

export type StructureFormValues = z.infer<typeof structureFormSchema>;

/** Payload envoyé au backend : uniquement les champs non vides (modifications partielles). */
export function toStructurePayload(values: StructureFormValues): Record<string, string | number> {
  const payload: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      payload[key] = value;
    } else if (typeof value === 'string' && value.trim() !== '') {
      payload[key] = value.trim();
    }
  }
  return payload;
}

/* ---------- Schéma de lecture défensif des réponses backend ---------- */

const nullableString = z.string().nullable().optional();

export const structureSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  slug: z.string(),
  description: nullableString,
  logo_url: nullableString,
  cover_url: nullableString,
  email: nullableString,
  phone: nullableString,
  website: nullableString,
  address: nullableString,
  city: nullableString,
  province: nullableString,
  country: nullableString,
  category: nullableString,
  sector: nullableString,
  founded_year: z.number().nullable().optional(),
  status: structureStatusSchema,
  verification_status: verificationStatusSchema,
  created_at: nullableString,
  updated_at: nullableString,
});

export const paginationSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  pages: z.number(),
  has_next: z.boolean(),
  has_previous: z.boolean(),
});

export const structureListResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.array(structureSchema),
  pagination: paginationSchema,
});

export const structureDetailResponseSchema = z.object({
  success: z.boolean().optional(),
  data: structureSchema,
});
