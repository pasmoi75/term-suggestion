# Tests

Les tests unitaires du projet utilisent [Vitest](https://vitest.dev/).

## Lancer les tests

**Tous les tests :**

```bash
npm test
```

**Un seul fichier :**

```bash
npm test -- tests/foo.test.ts
```

**Filtrer par nom de test :**

```bash
npm test -- -t "pattern"
```

**Mode watch (re-exécution à chaque modification) :**

```bash
npx vitest tests/foo.test.ts
```

## Fichiers de test

| Fichier | Couverture |
|---------|------------|
| `get-suggestions.test.ts` | Algorithme principal de suggestions |
| `hamming-window-score.test.ts` | Score de similarité (fenêtre glissante) |
| `load-word-list.test.ts` | Chargement du dictionnaire |
| `max-heap.test.ts` | Tas max pour le top-N |
| `suggestion-ranking.test.ts` | Critères de classement des suggestions |
| `validator.test.ts` | Validation du format de la requête |
| `parse-word-source.test.ts` | Parsing des sources de mots (txt, json) |
| `edge-cases.test.ts` | Cas limites et tie-breakers |
| `accent-variants.test.ts` | Variantes accentuées dans le dictionnaire |
| `serve-ui.test.ts` | Handlers HTTP de l'interface web |
