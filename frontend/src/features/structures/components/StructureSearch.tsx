/** Barre de recherche server-side (le debounce est appliqué par la page). */
export function StructureSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <label htmlFor="structure-search" className="sr-only">
        Rechercher une structure
      </label>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id="structure-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher une structure…"
        autoComplete="off"
        className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-2 focus:outline-offset-0 focus:outline-stone-400"
      />
    </div>
  );
}
