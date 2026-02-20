# Bilan carbone association

## Démarrage

1. Installer les dépendances :

```bash
npm install
```

2. Définir la clé API :

- Créer un fichier `.env` à la racine.
- Ajouter `IMPACTCO2_TOKEN` et, si besoin, `PORT`.

3. Lancer :

```bash
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Architecture MVC

- `server/models`: accès données, cache et API ImpactCO2.
- `server/services`: logique métier (calcul bilan, export Excel).
- `server/controllers`: orchestration des requêtes.
- `server/views`: formatage des réponses HTTP.
- `server/routes`: définition des routes API.
- `public/js`: MVC côté front (model API, views DOM, controller UI).

## Personnaliser les catégories

Le fichier `server/config/categories.json` contrôle les 7 catégories du questionnaire.
