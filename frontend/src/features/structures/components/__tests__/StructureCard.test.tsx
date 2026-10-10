import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { makeStructure } from '../../../../test/fixtures';
import { StructureCard } from '../StructureCard';

function renderCard(structure = makeStructure()) {
  return render(
    <MemoryRouter>
      <StructureCard structure={structure} />
    </MemoryRouter>,
  );
}

describe('StructureCard', () => {
  it('affiche nom, catégorie, localisation, secteur et description', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Incubateur Kamenge' })).toBeInTheDocument();
    expect(screen.getByText('incubateur')).toBeInTheDocument();
    expect(screen.getByText('Bujumbura Mairie, Bujumbura Mairie')).toBeInTheDocument();
    expect(screen.getByText('Technologie')).toBeInTheDocument();
    expect(
      screen.getByText('Accompagnement des jeunes pousses de Bujumbura.'),
    ).toBeInTheDocument();
  });

  it('affiche les badges de vérification et de statut', () => {
    renderCard();
    expect(screen.getByText('Vérifiée')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('fournit un lien « Voir le profil » vers /structures/:slug', () => {
    renderCard();
    const link = screen.getByRole('link', { name: /Voir le profil/ });
    expect(link).toHaveAttribute('href', '/structures/incubateur-kamenge');
  });

  it('affiche un fallback initiales sans logo (pas d’image cassée)', () => {
    renderCard(makeStructure({ logo_url: null }));
    // Pas d'élément <img> pour le logo : fallback textuel rendu.
    const imgs = screen.queryAllByRole('img');
    expect(imgs.length).toBe(0);
    expect(screen.getByText('IK')).toBeInTheDocument(); // Incubateur Kamenge → IK
  });

  it('masque proprement les champs optionnels absents', () => {
    renderCard(
      makeStructure({ description: null, sector: null, city: null, province: null }),
    );
    expect(screen.queryByText('Technologie')).not.toBeInTheDocument();
    expect(screen.getByText('Catégorie non renseignée') ?? null).toBeTruthy();
  });
});
