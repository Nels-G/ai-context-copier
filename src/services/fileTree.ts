import * as vscode from "vscode";
import { minimatch } from "minimatch";
import { isDirectory } from "../utils/workspace";

/** Profondeur maximale par défaut pour éviter un arbre trop volumineux. */
const DEFAULT_MAX_DEPTH = 8;

/**
 * Génère une représentation textuelle simple de l'arborescence complète
 * d'un workspace, en respectant les patterns d'exclusion configurés.
 *
 * Utilisée uniquement si l'utilisateur active
 * "aiContextCopier.includeFileTree" dans les Settings.
 *
 * @param root Dossier racine à partir duquel générer l'arbre
 * @param excludedPatterns Patterns glob à exclure (node_modules, dist, ...)
 * @param maxDepth Profondeur maximale pour éviter un arbre trop volumineux
 */
export async function buildFileTree(
  root: vscode.Uri,
  excludedPatterns: string[],
  maxDepth: number = DEFAULT_MAX_DEPTH
): Promise<string> {
  const lines: string[] = [`${basename(root.fsPath)}/`];
  await walkDirectory(root, "", 0, maxDepth, excludedPatterns, lines);
  return lines.join("\n");
}

/**
 * Génère l'arborescence uniquement pour les éléments sélectionnés par
 * l'utilisateur (fichiers et/ou dossiers), affichée depuis la racine du
 * workspace, mais SANS parcourir le reste du projet.
 *
 * Contrairement à `buildFileTree`, seuls les chemins menant aux éléments
 * sélectionnés apparaissent : si l'utilisateur sélectionne uniquement
 * `src/`, un dossier comme `node_modules/` à la racine n'apparaîtra jamais,
 * même s'il n'est pas dans `excludedPatterns`.
 *
 * @param uris Éléments sélectionnés dans l'Explorer, dans l'ordre de sélection
 * @param excludedPatterns Patterns glob à exclure à l'intérieur des dossiers sélectionnés
 * @param maxDepth Profondeur maximale de récursion à l'intérieur d'un dossier sélectionné
 */
export async function buildSelectionTree(
  uris: readonly vscode.Uri[],
  excludedPatterns: string[],
  maxDepth: number = DEFAULT_MAX_DEPTH
): Promise<string> {
  if (uris.length === 0) {
    return "";
  }

  // La racine affichée est celle du workspace contenant le premier élément
  // sélectionné (cas normal : tout est sélectionné dans le même workspace).
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uris[0]);
  const rootLabel = workspaceFolder
    ? basename(workspaceFolder.uri.fsPath)
    : basename(uris[0].fsPath);

  const lines: string[] = [`${rootLabel}/`];

  for (let index = 0; index < uris.length; index++) {
    const uri = uris[index];
    const isLast = index === uris.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const name = basename(uri.fsPath);
    const isDir = await isDirectory(uri);

    lines.push(`${connector}${name}${isDir ? "/" : ""}`);

    if (isDir) {
      const childPrefix = isLast ? "    " : "│   ";
      await walkDirectory(uri, childPrefix, 1, maxDepth, excludedPatterns, lines);
    }
  }

  return lines.join("\n");
}

function basename(fsPath: string): string {
  const parts = fsPath.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? fsPath;
}

/**
 * Parcourt récursivement un dossier et ajoute chaque entrée visible
 * (non exclue) à `lines`, avec les connecteurs d'arborescence appropriés.
 * Partagée par `buildFileTree` (parcours complet) et `buildSelectionTree`
 * (parcours limité aux éléments sélectionnés).
 */
async function walkDirectory(
  dir: vscode.Uri,
  prefix: string,
  depth: number,
  maxDepth: number,
  excludedPatterns: string[],
  lines: string[]
): Promise<void> {
  if (depth >= maxDepth) {
    return;
  }

  let entries: [string, vscode.FileType][];
  try {
    entries = await vscode.workspace.fs.readDirectory(dir);
  } catch {
    return;
  }

  entries.sort((a, b) => a[0].localeCompare(b[0]));

  const visible = entries.filter(
    ([name]) => !excludedPatterns.some((p) => minimatch(name, p, { dot: true }))
  );

  // Chaque entrée est affichée puis, si c'est un dossier, immédiatement
  // suivie de son propre contenu récursif. C'est essentiel : traiter
  // "afficher tous les frères" et "récursion" en deux boucles séparées
  // décale les enfants après TOUS les frères du niveau, au lieu de les
  // insérer juste sous leur propre dossier.
  for (let index = 0; index < visible.length; index++) {
    const [name, type] = visible[index];
    const isLast = index === visible.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const isDir = (type & vscode.FileType.Directory) !== 0;

    lines.push(`${prefix}${connector}${name}${isDir ? "/" : ""}`);

    if (isDir) {
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      await walkDirectory(
        vscode.Uri.joinPath(dir, name),
        childPrefix,
        depth + 1,
        maxDepth,
        excludedPatterns,
        lines
      );
    }
  }
}