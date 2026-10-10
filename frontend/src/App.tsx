import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Link,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from './lib/apiClient';
import { useAuthStore } from './lib/authStore';
import { StructuresPage } from './features/structures/pages/StructuresPage';

// Code splitting : les pages secondaires ne pèsent pas sur la liste publique.
const StructureDetailsPage = lazy(() =>
  import('./features/structures/pages/StructureDetailsPage').then((m) => ({
    default: m.StructureDetailsPage,
  })),
);
const CreateStructurePage = lazy(() =>
  import('./features/structures/pages/CreateStructurePage').then((m) => ({
    default: m.CreateStructurePage,
  })),
);
const EditStructurePage = lazy(() =>
  import('./features/structures/pages/EditStructurePage').then((m) => ({
    default: m.EditStructurePage,
  })),
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-semibold text-stone-900">Page introuvable</h1>
      <p className="mt-2 text-sm text-stone-500">Le lien suivi est invalide.</p>
      <Link
        to="/structures"
        className="mt-6 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
      >
        Retour aux structures
      </Link>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.token !== null);
  if (!isAuthenticated) {
    // ⚠️ Le module auth global du projet reste à brancher (backend absent).
    // Redirection vers le login existant dès qu'il sera disponible en SPA ;
    // en attendant, message + retour. La protection réelle est backend (401/403).
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold text-stone-900">Connexion requise</h1>
        <p className="mt-2 text-sm text-stone-500">
          Vous devez être authentifié pour accéder à cette page.
        </p>
        <Link
          to="/structures"
          className="mt-6 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Retour aux structures
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

function PageSuspense() {
  return (
    <div role="status" className="py-20 text-center text-sm text-stone-500">
      Chargement…
    </div>
  );
}

function Shell({ children, requireAuth = false }: { children: React.ReactNode; requireAuth?: boolean }) {
  return (
    <AppShell>
      <Suspense fallback={<PageSuspense />}>
        {requireAuth ? <RequireAuth>{children}</RequireAuth> : children}
      </Suspense>
    </AppShell>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<RootRedirect />} />
      <Route path="/structures" element={<Shell><StructuresPage /></Shell>} />
      <Route
        path="/structures/new"
        element={
          <Shell requireAuth>
            <CreateStructurePage />
          </Shell>
        }
      />
      <Route
        path="/structures/:slug"
        element={
          <Shell>
            <StructureDetailsPage />
          </Shell>
        }
      />
      <Route
        path="/structures/:id/edit"
        element={
          <Shell requireAuth>
            <EditStructurePage />
          </Shell>
        }
      />
      <Route path="*" element={<Shell><NotFound /></Shell>} />
    </>,
  ),
);

function RootRedirect() {
  return <Shell><StructuresPage /></Shell>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

// Ré-export pour tests / intégration future.
export { ApiError };
