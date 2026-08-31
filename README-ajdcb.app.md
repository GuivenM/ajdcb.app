# Site web AJDCB

Frontend React/Vite de l'Association des Jeunes de la Diaspora Congolaise au Bénin (AJDCB) : site vitrine public + espace d'administration complet. Consomme l'API [ajdc.api](https://github.com/GuivenM/ajdc.api).

## Stack

- **React 18** + **Vite 6** + TypeScript
- **Tailwind CSS 4**
- **shadcn/ui** (Radix UI) pour les composants (dialogs, select, tabs, accordion, etc.)
- **React Router 7**
- **sonner** pour les toasts
- **react-hook-form** (utilisé par `FedaPayButton`)

## Installation

```bash
npm install
cp .env.example .env   # ajuster VITE_API_URL si besoin
npm run dev
```

`VITE_API_URL` doit pointer vers la racine API (ex: `http://localhost:8000/api`) — voir `.env.example`.

## Structure

```
src/app/
├── pages/              # Site public
│   ├── Home, About, Actions, Guide, News, Events, Membership, Contact, Join
├── admin/               # Espace d'administration (auth requise)
│   ├── AdminLogin, AdminLayout, ProtectedRoute, Dashboard
│   ├── pages/           # Un module par ressource métier
│   └── types.ts         # Types partagés, doivent rester alignés avec les $appends des modèles Laravel
├── context/AuthContext.tsx   # Login/logout, rôle, permissions
├── components/          # Navbar, Footer, Layout, FedaPayButton, ui/ (shadcn)
└── lib/api.ts            # Client HTTP (token Bearer, gestion FormData, ApiError)
```

## Le formulaire d'adhésion public (`Join.tsx`)

`/join` propose un choix binaire avant tout formulaire :
- **Devenir membre** → fiche complète en 9 étapes (nationalité, état civil, pièces à uploader, statut professionnel avec branches étudiant/entrepreneur, compétences/langues, engagement associatif, coordonnées, déclaration sur l'honneur), avec validation stricte à chaque étape — impossible d'avancer avec un champ obligatoire manquant.
- **Devenir partenaire** → formulaire court (nom, organisation, contact, message), envoyé comme `Message` avec `objet: 'partenariat'` plutôt que de faire remplir la fiche membre à une entreprise.

## Espace d'administration (`/admin`)

Connexion par email/mot de passe (Sanctum). Rôles `super_admin` / `admin` / `moderateur`, chaque module respecte les permissions exposées par l'API (voir README du backend).

| Module | Route | Particularités |
|---|---|---|
| Adhésions | `/admin/adhesions` | Fiche détail complète (photo, pièces téléchargeables), approuver/rejeter. |
| Membres | `/admin/membres` | Recherche + tri, upload photo, activer/désactiver. |
| Cotisations | `/admin/cotisations` | Vue mensuelle par membre, marquer payé/impayé, historique 12 mois avec alerte de radiation (3 mois consécutifs impayés, Article 3 du règlement intérieur). |
| Événements | `/admin/evenements` | Dates, lieu, capacité, billetterie. |
| Actualités | `/admin/actualites` | Recherche + tri, brouillon/publié. |
| Actions | `/admin/actions` | Filtrable par commission (Solidarité, Éducation, Culture, Communication). |
| Guide | `/admin/guide` | Hiérarchie Section → Sous-section → Document en accordéons imbriqués ; bouton "œil" dédié pour voir le contenu complet d'une section/sous-section sans l'éditer. |
| Partenaires | `/admin/partenaires` | Recherche + tri, niveaux de partenariat. |
| Messages | `/admin/messages` | Boîte de réception, répondre par email, marquage lu. |

Chaque module suit le même principe : **cliquer sur une ligne ouvre une fiche détail en lecture seule** (photo, tous les champs) ; le bouton crayon dédié ouvre le formulaire d'édition. Les deux actions sont volontairement séparées.

## Design

Palette et espacements inspirés du projet `hubspot` (facturation Green Technoservices) : fond légèrement teinté (`bg-brand-green-50`) pour que les cartes blanches (`border-brand-green-100`, `rounded-xl`) ressortent avec de l'air entre elles — volontairement à l'opposé des gros blocs arrondis avec icônes en cercle coloré typiques des dashboards générés par IA.

## ⚠️ Point d'attention : paiement en ligne (FedaPay)

`FedaPayButton.tsx` appelle des endpoints (`/paiements/cotisation`, `/paiements/evenements/{id}`) qui **ne sont pas encore enregistrés côté backend** (voir README de `ajdc.api`). Le bouton ne fonctionnera pas tant que ces routes ne sont pas ajoutées à `routes/api.php`.

## Build

```bash
npm run build
```
Génère `dist/`. Le bundle dépasse 500 kB (avertissement Vite) — envisager du code-splitting (`build.rollupOptions.output.manualChunks`) si la taille devient un problème réel.
