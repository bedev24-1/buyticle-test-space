# Salle de simulation — Buyticle

Outil interne. On y choisit une simulation, on la regarde tourner en direct,
et on télécharge son dossier.

## Lancer en local

```bash
npm install
npm run dev
```

## Se connecter

| Identifiant | Mot de passe | Rôle |
|---|---|---|
| `buyticle` | `Relais2026!` | Direction |
| `terrain` | `Mboppi2026!` | Équipe terrain |

Les identifiants sont **écrits en dur** dans `src/auth.jsx` et la session ne
dure que le temps de l'onglet.

> **Ce que cette porte protège, et ce qu'elle ne protège pas.**
> Elle écarte un visiteur de passage. Elle ne protège rien d'autre : le code
> est envoyé au navigateur, donc les identifiants sont lisibles par qui les
> cherche, et les fichiers sous `public/simulations/` sont servis directement,
> sans passer par l'écran de connexion — `/simulations/marche-de-mboppi/index.html`
> s'ouvre sans mot de passe.
> Ne déposez donc dans ce dépôt aucune donnée qui ne puisse pas être vue.
> Si un jour il faut vraiment fermer l'accès, il faudra une vérification côté
> serveur (fonction Vercel + cookie signé) et sortir les fichiers de `public/`.

## Ajouter une simulation

Il n'y a pas de base de données. Une simulation, c'est deux dossiers.

```
src/simulations/<slug>/meta.js              ← le dossier : nom, date, objectif,
                                              public, métriques, scènes, résultats
public/simulations/<slug>/index.html        ← la simulation qui tourne
public/simulations/<slug>/<document>.docx   ← le document à télécharger
```

`src/simulations/index.js` ramasse tout seul les `meta.js` — rien à déclarer
nulle part. Copiez `marche-de-mboppi/meta.js`, changez les valeurs, et la
simulation apparaît dans la liste.

Le fichier `index.html` doit être **autonome** : il est chargé dans une iframe,
sans build ni dépendance, et ne fait aucune requête réseau.

Celui de Mboppi est produit par un second build. Sa source vit dans `sim/`
(Three.js, WebGL) et `npm run build:sim` la compile en un seul fichier de
643 Ko, moteur et textures inlinés. `npm run build` enchaîne les deux.

```bash
npm run dev:sim     # travailler la simulation seule, rechargement à chaud
npm run build:sim   # produire le fichier autonome
```

## Déployer sur Vercel

Importer le dépôt, rien à configurer : `vercel.json` fixe déjà le build, la
sortie et la réécriture des routes. Aucune variable d'environnement.

La règle de réécriture laisse passer `/simulations/*` vers les fichiers réels
et renvoie tout le reste sur `index.html`, pour que les URL du routeur
fonctionnent au rechargement.

## Ce qu'il y a dedans

`SIM-001 · Le marché de Mboppi` — un mois de renvois entre quatorze boutiques
de chaussures, produits et prix réels, 259 clients renvoyés, 5 940 600 F de
marchandise vendue.
