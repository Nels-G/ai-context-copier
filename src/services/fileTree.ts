import * as vscode from "vscode";
import { minimatch } from "minimatch";

/**
 * Génère une représentation textuelle simple de l'arborescence d'un
 * workspace, en respectant les patterns d'exclusion configurés.
 *
 * Fonctionnalité bonus : utilisée uniquement si l'utilisateur active
 * "aiContextCopier.includeFileTree" dans les Settings.
 *
 * @param root Dossier racine à partir duquel générer l'arbre
 * @param excludedPatterns Patterns glob à exclure (node_modules, dist, ...)
 * @param maxDepth Profondeur maximale pour éviter un arbre trop volumineux
 */
export async function buildFileTree(
  root: vscode.Uri,
  excludedPatterns: string[],
  maxDepth: number = 5
): Promise<string> {
  const lines: string[] = [`${basename(root.fsPath)}/`];
  await walk(root, "", 0, maxDepth, excludedPatterns, lines);
  return lines.join("\n");
}

function basename(fsPath: string): string {
  const parts = fsPath.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? fsPath;
}

async function walk(
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

  // On affiche d'abord chaque entrée du niveau courant...
  visible.forEach(([name, type], index) => {
    const isLast = index === visible.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const isDir = (type & vscode.FileType.Directory) !== 0;
    lines.push(`${prefix}${connector}${name}${isDir ? "/" : ""}`);
  });

  // ...puis on descend récursivement dans les sous-dossiers, séquentiellement,
  // afin de garder un ordre d'affichage déterministe.
  for (let index = 0; index < visible.length; index++) {
    const [name, type] = visible[index];
    const isDir = (type & vscode.FileType.Directory) !== 0;
    if (isDir) {
      const isLast = index === visible.length - 1;
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      await walk(
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
