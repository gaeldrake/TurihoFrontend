import type { Structure } from '../types/structure';
import { StructureCard } from './StructureCard';

/** Grille responsive : 1 col (mobile) → 2 (sm) → 3 (lg) → 4 (xl). */
export function StructureGrid({ structures }: { structures: Structure[] }) {
  return (
    <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {structures.map((s) => (
        <li key={String(s.id)}>
          <StructureCard structure={s} />
        </li>
      ))}
    </ul>
  );
}
