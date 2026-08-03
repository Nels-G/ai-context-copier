# Changelog

## [0.2.1]

### Corrigé
- Bug d'imbrication dans `walkDirectory` (`services/fileTree.ts`) : les
  fichiers et sous-dossiers d'un dossier récursé apparaissaient tous
  décalés après la liste complète de ses frères et sœurs, au lieu de
  s'afficher juste sous leur propre dossier parent. Affectait aussi bien
  `Copy Project Tree` que le réglage `includeFileTree`.

Toutes les modifications notables de ce projet seront documentées dans ce fichier.
## [0.2.0]

### Ajouté
- Nouvelle commande **Copy Project Tree** dans le menu contextuel de l'Explorer :
  copie uniquement l'arborescence des fichiers/dossiers sélectionnés, affichée
  depuis la racine du workspace, sans inclure le reste du projet
  (`buildSelectionTree` dans `services/fileTree.ts`).

### Modifié
- `resolveSelection` factorisée dans `utils/workspace.ts`, réutilisée par
  les deux commandes au lieu d'être dupliquée.

## [0.1.0] - Version initiale

### Ajouté
- Commande **Copy AI Context** dans le menu contextuel de l'Explorer.
- Lecture de fichiers multiples, dans l'ordre de sélection.
- Formatage `<chemin relatif>\n--------------------------------\n<contenu>`.
- Copie directe dans le presse-papiers.
- Préservation des fins de ligne et de l'indentation d'origine.
- Détection et exclusion silencieuse des fichiers binaires.
- Ignoration silencieuse des dossiers sélectionnés.
- Notification de succès (`N files copied successfully.`).
- Notification d'erreur par fichier illisible, sans interrompre le traitement global.
- Message d'erreur si aucun fichier n'est sélectionné.
- Paramètres configurables (`aiContextCopier.*`) : exclusions, numéros de ligne,
  arborescence, format de sortie (base posée pour Markdown/XML/JSON).

### À venir
- Formats de sortie Markdown / XML / JSON.
- Copie des seuls fichiers modifiés dans Git.
- Copie récursive d'un dossier entier avec sélection fine des exclusions.
