# 🍲 Popote

App mobile-first de planification de repas & de courses. L'utilisateur renseigne
ses préférences (moments, budget, régime, allergies, matériel, magasin, envies)
et Popote génère instantanément un **menu maison personnalisé** + une **liste de
courses triée par rayon**, calée sur son budget.

- 100 % gratuit pour l'utilisateur, ambiance « fait maison ».
- Axes forts : **budget maîtrisé**, **anti-gaspi**, **Bio / Made in France**.
- **Aucun LLM en temps réel** : les recettes viennent d'une base curée
  (recettes réelles, signées par un prénom de cuisinier). La génération est un
  algorithme de **filtrage + sélection** (`lib/generate.ts`).

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (design tokens dans `app/globals.css`, palette 60/30/10)
- Supabase (Postgres + Auth + Storage) — **à brancher** (phase 2)
- Déploiement cible : Vercel

## Lancer en local

> ⚠️ Node n'est pas dans le PATH système sur cette machine : il est installé via
> **nvm**. Charge-le d'abord.

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"   # charge Node
cd popote
npm run dev                                        # http://localhost:3000
```

## Structure

```
app/
  globals.css      # design system Popote (couleurs, rayons, ombres)
  layout.tsx       # métadonnées, langue fr, fond crème
  page.tsx         # flow : onboarding <-> résultat (état client)
components/
  Onboarding.tsx   # formulaire en 6 sections numérotées
  Results.tsx      # stats, pills, cartes recettes, liste, Modifier/Régénérer
  RecipeCard.tsx   # carte recette + bouton 🔁 remplacer
  ShoppingList.tsx # liste groupée par rayon, cases à cocher, total
  primitives.tsx   # Chip, Toggle, Stepper, RangeSlider, Segmented, Badge
lib/
  types.ts         # modèle de domaine (Recipe, Preferences, …)
  constants.ts     # moments, magasins, rayons, régimes, allergies, envies
  recipes.ts       # base de démo (~30 recettes) → à porter vers Supabase (50+)
  generate.ts      # algorithme : filtrage, sélection budget, liste de courses
```

## Algorithme (`lib/generate.ts`)

1. **Filtrage** : moment commun · régime compatible · aucune allergie ·
   `level ≤ niveau` · `timeMin ≤ temps` · matériel requis possédé · envies.
2. **Relâchement** progressif si trop peu de résultats : envies puis temps.
3. **Priorité** local/saison si l'interrupteur est actif ; flexitarien → viande
   limitée à ~40 % du menu.
4. **Sélection budget** gloutonne (garantit le nombre de recettes demandé).
5. **Coût** = Σ(qtyParPersonne × prix) × personnes × mult. magasin × (Bio ? 1,25).
6. **Liste de courses** : ingrédients identiques additionnés (anti-gaspi),
   groupés par rayon, quantités formatées (g→kg, ml→L, pièces arrondies).

## Reste à faire (phase 2)

- [ ] Brancher Supabase (schéma `recipes`, `recipe_ingredients`, `profiles`,
      `user_preferences`) + seed 50+ recettes avec vraies photos (Storage).
- [ ] Auth email + magic link, sauvegarde des préférences & favoris.
- [ ] Vraies photos de recettes (remplacent les dégradés + emoji).
- [ ] Déploiement Vercel.
