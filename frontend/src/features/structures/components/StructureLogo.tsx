import { useState } from 'react';

/**
 * Logo de structure : URL fournie par le backend uniquement (jamais de chemin
 * construit côté frontend). Fallback initiales si absent ou cassé, lazy loading.
 */
export function StructureLogo({
  src,
  name,
  size = 'md',
}: {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [failed, setFailed] = useState(false);

  const sizeClass =
    size === 'lg' ? 'size-20 rounded-2xl text-2xl' : size === 'sm' ? 'size-9 rounded-lg text-xs' : 'size-14 rounded-xl text-sm';

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center bg-stone-200 font-semibold text-stone-600 ${sizeClass}`}
      >
        {initials || '?'}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`Logo de ${name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 border border-stone-200 bg-white object-contain ${sizeClass}`}
    />
  );
}
