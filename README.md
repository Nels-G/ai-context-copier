# AI Context Copier

Extension VS Code qui copie plusieurs fichiers en un clic, déjà formatés,
prêts à être collés dans ChatGPT, Claude, Gemini ou tout autre assistant IA.

Fini le copier-coller fichier par fichier : sélectionne tes fichiers dans
l'Explorer, clic droit → **Copy AI Context**, colle dans ton IA préférée.

---

## 🚀 Installation (2 minutes, aucune compilation nécessaire)

### Étape 1 — Télécharger l'extension

Va dans l'onglet **[Releases](../../releases)** de ce dépôt et télécharge le
fichier `ai-context-copier-x.x.x.vsix` de la dernière version (dans la
section *Assets* de la release).

### Étape 2 — Installer dans VS Code

**Option A — en ligne de commande** (la plus rapide) :

```bash
code --install-extension chemin/vers/ai-context-copier-x.x.x.vsix
```

**Option B — depuis VS Code, sans terminal :**

1. Ouvre VS Code.
2. Va dans l'onglet **Extensions** (icône de blocs dans la barre de gauche, ou `Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Clique sur les **`...`** en haut de la panneau Extensions.
4. Choisis **Install from VSIX...**
5. Sélectionne le fichier `.vsix` téléchargé.

### Étape 3 — Redémarrer VS Code (si demandé)

C'est tout. L'extension est maintenant installée **de façon permanente**,
sur tous tes projets, à chaque ouverture de VS Code. Tu n'as plus rien à
relancer.

---

## ✅ Comment vérifier que l'installation a fonctionné

1. Ouvre n'importe quel projet dans VS Code.
2. Dans l'Explorer (panneau de fichiers à gauche), clique-droit sur un fichier.
3. Tu dois voir **Copy AI Context** dans le menu.

Si tu ne le vois pas : redémarre complètement VS Code (ferme toutes les fenêtres), puis réessaie.

---

## 🧑‍💻 Comment utiliser l'extension

1. Dans l'Explorer, sélectionne un ou plusieurs fichiers :
   - `Ctrl+clic` (ou `Cmd+clic` sur Mac) pour en ajouter un par un.
   - `Shift+clic` pour sélectionner une plage.
2. Clic droit → **Copy AI Context**.
3. Une notification confirme : `N files copied successfully.`
4. Colle (`Ctrl+V` / `Cmd+V`) directement dans ChatGPT, Claude, Gemini, etc.

Le texte collé ressemble à ceci :

```text
src/pages/Home.jsx
--------------------------------
...contenu du fichier...

src/App.jsx
--------------------------------
...contenu du fichier...
```

### Ce que l'extension fait automatiquement

- Utilise le chemin relatif du fichier (utile pour donner du contexte à l'IA).
- Ignore les dossiers sélectionnés (pas d'erreur, juste ignoré).
- Ignore les fichiers binaires (images, fonts, etc.).
- Préserve exactement l'indentation et les fins de ligne du fichier d'origine.
- Prévient si un fichier n'a pas pu être lu, sans bloquer les autres.
- Prévient si aucun fichier n'est sélectionné.

---

## ⚙️ Réglages disponibles (optionnel)

Va dans `Fichier > Préférences > Paramètres` (ou `Ctrl+,` / `Cmd+,`) et
cherche `AI Context Copier` pour configurer :

| Réglage | Ce que ça fait | Par défaut |
|---|---|---|
| Excluded Patterns | Dossiers/fichiers toujours ignorés | `node_modules`, `dist`, `build`, `.git`, `out`, `.vscode` |
| Include Line Numbers | Ajoute les numéros de ligne | Désactivé |
| Include File Tree | Ajoute l'arborescence du projet avant les fichiers | Désactivé |

Tu peux aussi éditer directement `settings.json` :

```json
{
  "aiContextCopier.excludedPatterns": ["node_modules", "dist", "build", ".git"],
  "aiContextCopier.includeLineNumbers": false,
  "aiContextCopier.includeFileTree": false
}
```

---

## 🔄 Mettre à jour vers une nouvelle version

Même procédure que l'installation : télécharge le nouveau `.vsix` depuis
les [Releases](../../releases) et réinstalle-le (Option A ou B ci-dessus).
Cela remplace automatiquement l'ancienne version.

---

## 🛠️ Pour les développeurs (modifier le code)

Cette section ne concerne que si tu veux **modifier** l'extension elle-même.
Si tu veux juste l'utiliser, tu n'as pas besoin de lire ce qui suit.

### Prérequis

[Node.js](https://nodejs.org) ≥ 18 et npm.

### Installation des dépendances

```bash
git clone <url-de-ce-repo>
cd ai-context-copier
npm install
```

### Lancer en mode debug (F5)

1. Ouvrir le dossier dans VS Code.
2. Appuyer sur **F5** → ouvre une fenêtre *Extension Development Host* de test.
3. Cette fenêtre de test se ferme quand tu arrêtes le debug ; ce n'est
   **pas** une installation permanente (voir section installation ci-dessus
   pour ça).

### Scripts disponibles

```bash
npm run compile   # build de développement
npm run watch     # recompilation automatique
npm run lint      # vérifie le code
npm run package   # génère le fichier .vsix
```

### Structure du projet

```text
ai-context-copier/
│
├── src/
│   ├── extension.ts              # Point d'entrée, enregistre la commande
│   ├── commands/copyContext.ts   # Orchestration de la commande
│   ├── services/
│   │   ├── clipboard.ts          # Copie dans le presse-papiers
│   │   ├── formatter.ts          # Génère le texte final
│   │   ├── fileReader.ts         # Lecture + détection binaires/exclusions
│   │   └── fileTree.ts           # Arborescence du projet (bonus)
│   ├── utils/workspace.ts        # Chemins relatifs, détection dossier
│   └── types.ts
│
├── resources/icon.png
├── package.json
├── tsconfig.json
├── esbuild.js
└── .github/workflows/release.yml # Build + attache le .vsix à chaque release
```

### Publier une nouvelle version (pour toi-même, pas le Marketplace)

1. Mets à jour le numéro de version dans `package.json`.
2. Crée un tag et une release sur GitHub (`v0.2.0` par exemple).
3. La GitHub Action se charge automatiquement de compiler et d'attacher
   le fichier `.vsix` à la release — tu n'as rien d'autre à faire.

---

## Roadmap

- [x] Exclusion de dossiers configurables.
- [x] Génération de l'arborescence du projet.
- [x] Numéros de ligne optionnels.
- [ ] Formats de sortie Markdown / XML / JSON.
- [ ] Copie uniquement des fichiers modifiés par Git.
- [ ] Copie récursive d'un dossier entier.

---

## Licence

Projet personnel — libre d'utilisation et de modification.
