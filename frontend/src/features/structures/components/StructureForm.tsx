import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { z } from 'zod';
import type { StructureFormValues, structureFormSchema } from '../types/structure';
import { StructureLogo } from './StructureLogo';

/**
 * Formulaire de création / édition.
 * - `initialValues` : données existantes chargées depuis l'API (édition) ;
 *   jamais d'écrasement par des valeurs vides (payload = champs non vides).
 * - Validation Zod côté UX ; les erreurs backend (400/422) sont remontées via
 *   `serverErrors` (map champ → messages) et affichées sous les champs.
 */
export function StructureForm({
  mode,
  initialValues,
  isSubmitting,
  serverErrors,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initialValues?: Partial<StructureFormValues>;
  isSubmitting: boolean;
  serverErrors: Record<string, string[]>;
  onSubmit: (values: StructureFormValues) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Partial<StructureFormValues>>(initialValues ?? {});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const allErrors = mergeErrors(fieldErrors, serverErrors);

  function setField<K extends keyof StructureFormValues>(
    key: K,
    value: StructureFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Validation UX via le schéma du contrat ; la validation finale est backend.
    const parsed = structureFormSchemaZod.safeParse(
      // Champs non touchés = undefined → normalisés en '' pour des messages Zod français.
      Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v ?? '']),
      ),
    );
    if (!parsed.success) {
      const errs: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        errs[key] = [...(errs[key] ?? []), issue.message];
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    onSubmit(parsed.data);
  }

  const inputClass = (name: string) =>
    `w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-2 focus:outline-stone-400 ${
      allErrors[name]?.length ? 'border-red-400' : 'border-stone-300 focus:border-stone-500'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <fieldset className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Identité
        </legend>

        <Field label="Nom *" name="name" errors={allErrors.name}>
          <input
            id="field-name"
            type="text"
            required
            value={values.name ?? ''}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Ex. Chambre Nationale des PME"
            className={inputClass('name')}
          />
        </Field>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Catégorie" name="category" errors={allErrors.category}>
            <input
              id="field-category"
              type="text"
              value={values.category ?? ''}
              onChange={(e) => setField('category', e.target.value)}
              placeholder="Valeurs attendues par le backend [À CONFIRMER]"
              className={inputClass('category')}
            />
          </Field>
          <Field label="Secteur" name="sector" errors={allErrors.sector}>
            <input
              id="field-sector"
              type="text"
              value={values.sector ?? ''}
              onChange={(e) => setField('sector', e.target.value)}
              placeholder="Ex. Agriculture, Tech…"
              className={inputClass('sector')}
            />
          </Field>
        </div>

        <Field label="Description" name="description" errors={allErrors.description}>
          <textarea
            id="field-description"
            rows={4}
            value={values.description ?? ''}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Présentez la structure, sa mission, son impact…"
            className={`${inputClass('description')} resize-y`}
          />
        </Field>
      </fieldset>

      <fieldset className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Coordonnées & localisation
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="E-mail" name="email" errors={allErrors.email}>
            <input
              id="field-email"
              type="email"
              value={values.email ?? ''}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="contact@structure.bi"
              className={inputClass('email')}
            />
          </Field>
          <Field label="Téléphone" name="phone" errors={allErrors.phone}>
            <input
              id="field-phone"
              type="tel"
              value={values.phone ?? ''}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="+257 …"
              className={inputClass('phone')}
            />
          </Field>
          <Field label="Site web" name="website" errors={allErrors.website}>
            <input
              id="field-website"
              type="url"
              value={values.website ?? ''}
              onChange={(e) => setField('website', e.target.value)}
              placeholder="https://…"
              className={inputClass('website')}
            />
          </Field>
          <Field label="Année de création" name="founded_year" errors={allErrors.founded_year}>
            <input
              id="field-founded_year"
              type="number"
              inputMode="numeric"
              min={1900}
              max={new Date().getFullYear()}
              value={values.founded_year ?? ''}
              onChange={(e) =>
                setField('founded_year', e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Ex. 2018"
              className={inputClass('founded_year')}
            />
          </Field>
          <Field label="Adresse" name="address" errors={allErrors.address}>
            <input
              id="field-address"
              type="text"
              value={values.address ?? ''}
              onChange={(e) => setField('address', e.target.value)}
              className={inputClass('address')}
            />
          </Field>
          <Field label="Ville" name="city" errors={allErrors.city}>
            <input
              id="field-city"
              type="text"
              value={values.city ?? ''}
              onChange={(e) => setField('city', e.target.value)}
              placeholder="Bujumbura…"
              className={inputClass('city')}
            />
          </Field>
          <Field label="Province" name="province" errors={allErrors.province}>
            <input
              id="field-province"
              type="text"
              value={values.province ?? ''}
              onChange={(e) => setField('province', e.target.value)}
              placeholder="Liste des provinces [À CONFIRMER backend]"
              className={inputClass('province')}
            />
          </Field>
          <Field label="Pays" name="country" errors={allErrors.country}>
            <input
              id="field-country"
              type="text"
              value={values.country ?? ''}
              onChange={(e) => setField('country', e.target.value)}
              placeholder="Burundi"
              className={inputClass('country')}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Images (URLs fournies par le backend)
        </legend>
        <p className="mb-4 text-xs text-stone-500">
          L’upload de fichiers n’est pas documenté dans le contrat API : seuls des
          URLs existantes renvoyées par le backend peuvent être renseignées.{' '}
          <strong>[À CONFIRMER]</strong> endpoint d’upload.
        </p>
        <div className="mb-4 flex items-center gap-4">
          <StructureLogo src={values.logo_url} name={values.name || 'Nouvelle structure'} />
          <div className="min-w-0 text-sm text-stone-500">Aperçu du logo</div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="URL du logo" name="logo_url" errors={allErrors.logo_url}>
            <input
              id="field-logo_url"
              type="url"
              value={values.logo_url ?? ''}
              onChange={(e) => setField('logo_url', e.target.value)}
              placeholder="https://…"
              className={inputClass('logo_url')}
            />
          </Field>
          <Field label="URL de couverture" name="cover_url" errors={allErrors.cover_url}>
            <input
              id="field-cover_url"
              type="url"
              value={values.cover_url ?? ''}
              onChange={(e) => setField('cover_url', e.target.value)}
              placeholder="https://…"
              className={inputClass('cover_url')}
            />
          </Field>
        </div>
      </fieldset>

      {allErrors.form?.length ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {allErrors.form.join(' ')}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Link
            to="/structures"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
          >
            Annuler
          </Link>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 disabled:opacity-60"
        >
          {isSubmitting
            ? 'Enregistrement…'
            : mode === 'create'
              ? 'Créer la structure'
              : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}

/* Import runtime du schéma (type-only import au-dessus pour `typeof`). */
import { structureFormSchema as structureFormSchemaZod } from '../types/structure';

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  const errorId = `error-${name}`;
  return (
    <div className="mt-4 first:mt-0">
      <label htmlFor={`field-${name}`} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={errorId} className="mt-1 text-xs text-red-700">
          {errors.join(' ')}
        </p>
      ) : null}
    </div>
  );
}

function mergeErrors(
  a: Record<string, string[]>,
  b: Record<string, string[]>,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    out[key] = [...(a[key] ?? []), ...(b[key] ?? [])];
  }
  return out;
}

/** Type utilitaire exporté pour les pages. */
export type StructureFormSchema = z.infer<typeof structureFormSchema>;
