import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { StructureForm } from '../StructureForm';

function renderForm(props: Partial<Parameters<typeof StructureForm>[0]> = {}) {
  const onSubmit = vi.fn();
  render(
    <MemoryRouter>
      <StructureForm
        mode="create"
        isSubmitting={false}
        serverErrors={{}}
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>,
  );
  return { onSubmit };
}

describe('StructureForm', () => {
  it('bloque la soumission et affiche l’erreur Zod si le nom manque', async () => {
    const { onSubmit } = renderForm();
    await userEvent.click(screen.getByRole('button', { name: /Créer la structure/ }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Le nom doit contenir au moins 2 caractères/),
    ).toBeInTheDocument();
  });

  it('soumet les valeurs valides', async () => {
    const { onSubmit } = renderForm();
    await userEvent.type(screen.getByLabelText(/Nom/), 'Chambre des PME');
    await userEvent.click(screen.getByRole('button', { name: /Créer la structure/ }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].name).toBe('Chambre des PME');
  });

  it('valide l’e-mail et l’URL', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Nom/), 'Test OK');
    await userEvent.type(screen.getByLabelText(/^E-mail/), 'pas-un-email');
    await userEvent.click(screen.getByRole('button', { name: /Créer la structure/ }));
    expect(screen.getByText(/Adresse e-mail invalide/)).toBeInTheDocument();
  });

  it('affiche les erreurs backend (422) sous les champs concernés', () => {
    renderForm({
      serverErrors: { name: ['Ce nom existe déjà.'], form: ['Conflit détecté.'] },
    });
    expect(screen.getByText('Ce nom existe déjà.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Conflit détecté.');
  });

  it('pré-remplit le formulaire en mode édition (données existantes chargées)', () => {
    renderForm({
      mode: 'edit',
      initialValues: { name: 'Incubateur Kamenge', city: 'Bujumbura Mairie' },
    });
    expect(screen.getByLabelText(/Nom/)).toHaveValue('Incubateur Kamenge');
    expect(screen.getByLabelText(/^Ville/)).toHaveValue('Bujumbura Mairie');
  });

  it('désactive le bouton pendant la soumission', () => {
    renderForm({ isSubmitting: true });
    expect(
      screen.getByRole('button', { name: /Enregistrement…/ }),
    ).toBeDisabled();
  });
});
