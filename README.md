# CONDAMINE-GAMES

Ce dépôt contient les jeux éducatifs chargés par CondaWeb. Un seul projet Vercel publie tous les jeux :

- `/wispguard/` — aventure Zelda-like (MIT) ;
- `/monster-tamer/` — exploration et combats au tour par tour (MIT) ;
- `/simple-rpg/assets/` — ancien prototype Phaser conservé pour compatibilité.

## Développement et construction

```bash
npm run build
```

La sortie statique complète est créée dans `dist/`. Le dossier `node_modules` et les sorties compilées ne sont jamais versionnés.

## Intégration CondaWeb

Les iframes communiquent avec CondaWeb par `postMessage` grâce à `shared/condaweb-bridge.js`. L’URL de déploiement peut être remplacée dans CondaWeb avec `VITE_GAMES_BASE_URL`.

Le contexte pédagogique transmis aux jeux conserve la hiérarchie de la fiche :

```json
{
  "lessons": [{
    "id": "lesson-1",
    "title": "Titre de la leçon",
    "mainPoints": [{
      "number": 1,
      "text": "Idée principale (1-)",
      "keywords": ["mot important"],
      "subPoints": ["Sous-idée (-)"]
    }],
    "quiz": [{ "question": "…", "choices": ["…"], "correctIndex": 0 }]
  }]
}
```

Ainsi, un monstre peut porter le titre d'une leçon, défendre avec un point `1-` et être attaqué grâce au numéro correspondant, tout en posant les QCM de la même leçon.

Les licences d’origine sont conservées dans chaque dossier de jeu.
