import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { StructureSearch } from '../StructureSearch';
import { StructureFilters } from '../StructureFilters';

describe('StructureSearch', () => {
  it('propage chaque frappe au parent (le debounce est géré par la page)', async () => {
    // Composant contrôlé : l'appelant reflète l'état à chaque frappe.
    const calls: string[] = [];
    const App = () => {
      const [v, setV] = useState('');
      calls.push(v);
      return <StructureSearch value={v} onChange={setV} />;
    };
    render(<App />);
    await userEvent.type(screen.getByRole('searchbox'), 'ab');
    expect(calls.at(-1)).toBe('ab');
  });

  it('est accessible (label associé)', () => {
    render(<StructureSearch value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Rechercher une structure')).toBeInTheDocument();
  });
});

describe('StructureFilters', () => {
  const empty = {};

  it('appelle onChange avec le filtre modifié', async () => {
    // Composant contrôlé : l'appelant applique le patch à chaque frappe ;
    // on vérifie la DERNIÈRE valeur propagée pour une champ complet.
    const onChange = vi.fn();
    const App = () => {
      const [filters, setFilters] = useState<{ city?: string }>({});
      return (
        <StructureFilters
          filters={filters}
          onChange={(patch) => {
            onChange(patch);
            setFilters((f) => ({ ...f, ...patch }) as { city?: string });
          }}
          onReset={() => {}}
        />
      );
    };
    render(<App />);
    await userEvent.type(screen.getByLabelText('Ville'), 'Gitega');
    expect(onChange).toHaveBeenLastCalledWith({ city: 'Gitega' });
  });

  it('propage le statut et la vérification (enums du contrat)', async () => {
    const onChange = vi.fn();
    render(
      <StructureFilters filters={empty} onChange={onChange} onReset={() => {}} />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Statut'), 'active');
    expect(onChange).toHaveBeenLastCalledWith({ status: 'active' });
    await userEvent.selectOptions(screen.getByLabelText('Vérification'), 'verified');
    expect(onChange).toHaveBeenLastCalledWith({ verification_status: 'verified' });
  });

  it('affiche « Réinitialiser » seulement si un filtre est actif', () => {
    const { rerender } = render(
      <StructureFilters filters={empty} onChange={() => {}} onReset={() => {}} />,
    );
    expect(screen.queryByText('Réinitialiser les filtres')).not.toBeInTheDocument();
    rerender(
      <StructureFilters
        filters={{ city: 'Gitega' }}
        onChange={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByText('Réinitialiser les filtres')).toBeInTheDocument();
  });
});
