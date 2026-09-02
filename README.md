# term-suggestion

On veut prendre un terme et retourner parmi une liste de termes en minuscule, alphanumérique, ceux qui contiennent le terme ou un terme le plus approchant de celui entré.

On retourne N suggestions (s'il y a égalité dans le nombre de différences, prendre les termes les plus proches en longueur du terme recherché, puis triés par ordre alphabétique).

La similarité est déterminée par le nombre de lettres à remplacer (on ne cherchera pas en insérant des lettres) pour retrouver le terme ; moins il y a de changements à faire, plus le mot est « contenu ».

Exemple : si on cherche 2 termes approchants de `gros` dans la liste `[gros, gras, graisse, agressif, go, ros, gro]` on aura :

- `gros` = 0 différence
- `gras` = 1 différence
- `graisse` = 2 différences
- `agressif` = 1 différence
- `go` = pas du tout similaire (pas assez de lettres)
- `ros` = pas du tout similaire (pas assez de lettres)
- `gro` = pas du tout similaire (pas assez de lettres)

## Format des mots

La requête est validée avant la recherche ; le dictionnaire peut être hétérogène, mais **seuls y participent à la recherche** les mots en minuscules alphanumériques (`[a-z0-9]+`). Les entrées non conformes du dico sont ignorées (voir [Dictionnaire](#dictionnaire)).

### Entrée (requête)

Le mot recherché doit être en **minuscules** et **alphanumérique** (`[a-z0-9]+`).

Sinon, une erreur est levée avant la recherche :

> Ce n'est pas le format attendu : le mot doit être en minuscules et ne contenir que des caractères alphanumériques ([a-z0-9]).

Exemples rejetés : `GROS`, ` chat`, `café`, `mot!`.

### Dictionnaire

Le fichier dico peut contenir n'importe quels mots (accents, majuscules, espaces, ponctuation, etc.). **Lors de la recherche**, toute entrée **non alphanumérique** — hors motif `[a-z0-9]+` en minuscules — est **ignorée** : elle n'est ni comparée au terme recherché ni proposée en suggestion, sans lever d'erreur.

Exemple : une recherche sur `notre` ne matchera pas `nôtre` présent dans le dico, mais matchera `notre` s'il y est.

## Prérequis

- [Node.js](https://nodejs.org/) 18+ (20+ recommandé)

## Installation

```bash
cd term-suggestion
npm install
npm run build:dico
```

## Utilisation

```bash
npm run search -- gros 10
npm run search -- gros 10 --dico chemin/vers/mon-dico.txt
```

Arguments :

1. terme recherché
2. nombre de suggestions (optionnel, défaut : 10)
3. `--dico <chemin>` — dictionnaire à utiliser (optionnel, défaut : `data/dico.txt`)

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run search -- <mot> [n] [--dico <chemin>]` | Lance une recherche |
| `npm run build:dico` | Génère `data/dico.txt` à partir de `data/sources/` |
| `npm run perf` | Mesure les performances (500k mots, 10 requêtes) |
| `npm test` | Tests unitaires (Vitest) |

## Structure

```
term-suggestion/
├── data/
│   ├── dico.txt                     # dictionnaire par défaut (généré)
│   └── sources/                     # listes brutes (entrées de build:dico)
│       ├── french-words.json
│       ├── francais.txt
│       └── words_alpha.txt
├── scripts/                         # entrypoints CLI & outils dev
│   ├── search-word.ts
│   ├── build-dico.ts
│   ├── measure-performance.ts
├── src/                             # librairie (logique métier)
│   ├── index.ts
│   ├── get-suggestions.ts
│   ├── hamming-window-score.ts
│   ├── max-heap.ts
│   ├── validator.ts
│   ├── suggestion-ranking.ts
│   ├── load-word-list.ts
│   └── parse-word-source.ts
└── tests/
    ├── get-suggestions.test.ts
    ├── hamming-window-score.test.ts
    ├── load-word-list.test.ts
    ├── max-heap.test.ts
    ├── suggestion-ranking.test.ts
    └── validator.test.ts
```

### Rôles des dossiers

- **`data/sources/`** — données brutes téléchargées / sources externes. Ce ne sont **pas** des scripts : juste des fichiers de mots.
- **`data/dico.txt`** — dictionnaire fusionné, produit par `npm run build:dico`.
- **`scripts/`** — commandes exécutables (`search`, `build:dico`, bench…).
- **`src/`** — code réutilisable (algo + chargement dico + validation).

## API

```typescript
import { getSuggestions, loadWordList } from './src/index.ts';

const wordList = loadWordList();
// ou avec un dico personnalisé :
const custom = loadWordList({ path: 'chemin/vers/mon-dico.txt' });
const results = getSuggestions('gros', wordList, 10);
```
## Piste d'amélioration

Pour de meilleures performances (notamment sur de grands dictionnaires), on pourrait ajouter un **seuil maximum de distance** : les mots dont la distance dépasse cette valeur seraient exclus des suggestions.
