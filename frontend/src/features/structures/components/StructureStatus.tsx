import type { StructureStatus, VerificationStatus } from '../types/structure';

/*
 * Libellés FR déduits des enums SUPPOSÉS du contrat (docs/api/structures.md §5).
 * ⚠️ Si le backend utilise d'autres valeurs, ajuster ici + le schéma Zod — une seule fois.
 */

const statusLabels: Record<StructureStatus, string> = {
  active: 'Active',
  pending: 'En attente',
  suspended: 'Suspendue',
  inactive: 'Inactive',
};

const statusStyles: Record<StructureStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  suspended: 'bg-red-50 text-red-700 ring-red-600/20',
  inactive: 'bg-stone-100 text-stone-600 ring-stone-500/20',
};

const verificationLabels: Record<VerificationStatus, string> = {
  verified: 'Vérifiée',
  pending: 'Vérification en cours',
  unverified: 'Non vérifiée',
  rejected: 'Vérification refusée',
};

export function StructureStatusBadge({ status }: { status: StructureStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function VerificationBadge({
  verification_status,
}: {
  verification_status: VerificationStatus;
}) {
  const verified = verification_status === 'verified';
  return (
    <span
      title={verificationLabels[verification_status]}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        verified
          ? 'bg-sky-50 text-sky-800 ring-sky-600/20'
          : 'bg-stone-50 text-stone-500 ring-stone-400/20'
      }`}
    >
      {verified ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M8.6 2.6a2.3 2.3 0 0 1 1.7-.7h3.4c.7 0 1.3.3 1.7.7l1 1c.5.4 1 .5 1.6.4l1.4-.3c.7-.1 1.4.1 1.9.6l2.4 2.4c.5.5.7 1.2.6 1.9l-.3 1.4c-.1.6 0 1.1.4 1.6l1 1c.4.4.7 1 .7 1.7v3.4c0 .7-.3 1.3-.7 1.7l-1 1c-.5.5-.5 1-.4 1.6l.3 1.4c.1.7-.1 1.4-.6 1.9l-2.4 2.4c-.5.5-1.2.7-1.9.6l-1.4-.3c-.6-.1-1.1 0-1.6.4l-1 1c-.4.4-1 .7-1.7.7h-3.4c-.7 0-1.3-.3-1.7-.7l-1-1c-.5-.5-1-.5-1.6-.4l-1.4.3c-.7.1-1.4-.1-1.9-.6L2.6 19c-.5-.5-.7-1.2-.6-1.9l.3-1.4c.1-.6 0-1.1-.4-1.6l-1-1A2.3 2.3 0 0 1 2.6 10V6.6c0-.7.3-1.3.7-1.7l1-1c.5-.5.5-1 .4-1.6M10 15.2l6.1-6.1a.9.9 0 1 1 1.3 1.3l-6.8 6.7a.9.9 0 0 1-1.3 0l-2.7-2.7a.9.9 0 1 1 1.3-1.3Z"
            clipRule="evenodd"
          />
        </svg>
      ) : null}
      {verificationLabels[verification_status]}
    </span>
  );
}

export { statusLabels, verificationLabels };
