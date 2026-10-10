# Contrat API — Module Structures (TURIHO)

## ⚠️ AVERTISSEMENT — SOURCE DE VÉRITÉ

Ce document a été rédigé par l'équipe frontend à partir de l'analyse du prototype HTML
(`admin_structures.html`, `modifier_structure.html`, `create.html`) présent dans le dépôt.

**Aucun code backend Flask ni spécification OpenAPI n'existe dans ce dépôt.**
Chaque champ marqué **[À CONFIRMER]** doit être validé par l'équipe backend avant la mise en production.
Le frontend centralise toutes ces conventions dans `src/lib/apiContract.ts` : si le backend diffère,
seul ce fichier (et les types Zod correspondants) doit être ajusté.

---

## 1. Base & authentification

- Préfixe supposé : `/api/v1`
- URL racine configurée via la variable d'environnement frontend `VITE_API_URL` (jamais codée en dur).
- Authentification supposée : JWT porteur (`Authorization: Bearer <token>`) **[À CONFIRMER : cookie de session Flask ?]**

## 2. Enveloppe de réponse supposée

Liste paginée :

```json
{
  "success": true,
  "data": [ /* Structure[] */ ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5,
    "has_next": true,
    "has_previous": false
  }
}
```

Erreur :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides.",
    "details": { "name": ["Le nom est requis."] }
  }
}
```

**[À CONFIRMER]** : clés exactes (`error` vs `message` vs `errors`), présence de `success`.

## 3. Endpoints consommés par le frontend

| Méthode | Endpoint | Usage | Auth |
|---|---|---|---|
| GET | `/api/v1/structures` | Liste + recherche + filtres + pagination | Public (supposé) |
| GET | `/api/v1/structures/:slug` | Détail d'une structure | Public (supposé) |
| POST | `/api/v1/structures` | Création | Requise |
| PUT/PATCH | `/api/v1/structures/:id` | Modification | Requise |
| DELETE | `/api/v1/structures/:id` | Suppression | Requise (propriétaire/admin) |

## 4. Paramètres de requête (GET /api/v1/structures)

| Paramètre | Type | Description | Statut |
|---|---|---|---|
| `search` | string | Recherche server-side (nom, description…) | **[À CONFIRMER]** |
| `category` | string | Filtre catégorie | **[À CONFIRMER]** |
| `city` | string | Filtre ville | **[À CONFIRMER]** |
| `province` | string | Filtre province | **[À CONFIRMER]** |
| `sector` | string | Filtre secteur | **[À CONFIRMER]** |
| `status` | string | Filtre statut | **[À CONFIRMER]** |
| `verification_status` | string | Filtre vérification | **[À CONFIRMER]** |
| `page` | number | Page (défaut 1) | Standard |
| `per_page` | number | Taille de page (défaut 20, max ?) | Standard |

## 5. Champs du modèle `Structure` (déduits des maquettes)

| Champ | Type | Obligatoire (POST) | Notes |
|---|---|---|---|
| `id` | number|string | — | Génération côté backend **[À CONFIRMER]** |
| `name` | string | oui | |
| `slug` | string | — | Généré depuis le nom ? **[À CONFIRMER]** |
| `description` | string\|null | non | |
| `logo_url` | string\|null | non | URL renvoyée par le backend |
| `cover_url` | string\|null | non | |
| `email` | string\|null | non | |
| `phone` | string\|null | non | |
| `website` | string\|null | non | |
| `address` | string\|null | non | |
| `city` | string\|null | non | |
| `province` | string\|null | non | Burundi : liste des 18 provinces ? |
| `country` | string\|null | non | Défaut « Burundi » ? |
| `category` | string\|null | non | Valeurs enum **[À CONFIRMER]** |
| `sector` | string\|null | non | Valeurs enum **[À CONFIRMER]** |
| `founded_year` | number\|null | non | Année de création |
| `status` | string | — | Enum supposé : `active`, `pending`, `suspended`, `inactive` **[À CONFIRMER]** |
| `verification_status` | string | — | Enum supposé : `unverified`, `pending`, `verified`, `rejected` **[À CONFIRMER]** |
| `created_at` / `updated_at` | string ISO | — | |

## 6. Actions d'administration (vérifier / suspendre / restaurer)

Aucun endpoint documenté trouvé. Le frontend expose une interface conditionnelle
mais **n'appelle aucun endpoint inventé**. À fournir par le backend, p. ex. :

```text
PATCH /api/v1/structures/:id/verification
PATCH /api/v1/structures/:id/status
```

## 7. Codes d'erreur attendus

400 · 401 · 403 · 404 · 409 (slug dupliqué) · 422 · 429 · 500 — avec l'enveloppe d'erreur §2.
