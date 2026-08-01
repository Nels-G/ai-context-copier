import * as vscode from "vscode";
import * as path from "path";

/**
 * Calcule le chemin relatif d'un fichier par rapport à la racine
 * du workspace qui le contient, avec des séparateurs "/" normalisés
 * (utile même sous Windows, pour un format cohérent envoyé à une IA).
 *
 * @param uri Uri absolu du fichier
 * @returns Chemin relatif, ou le chemin absolu si aucun workspace ne contient le fichier
 */
export function toWorkspaceRelativePath(uri: vscode.Uri): string {
  const folder = vscode.workspace.getWorkspaceFolder(uri);

  if (!folder) {
    // Le fichier n'appartient à aucun workspace ouvert : on retombe
    // sur le chemin absolu plutôt que de planter.
    return uri.fsPath.split(path.sep).join("/");
  }

  const relative = path.relative(folder.uri.fsPath, uri.fsPath);
  return relative.split(path.sep).join("/");
}

/**
 * Indique si un Uri pointe vers un dossier plutôt qu'un fichier.
 */
export async function isDirectory(uri: vscode.Uri): Promise<boolean> {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    return (stat.type & vscode.FileType.Directory) !== 0;
  } catch {
    // Si on ne peut pas stat le fichier, on considère prudemment
    // qu'il ne s'agit pas d'un dossier (il sera géré comme erreur de lecture ensuite).
    return false;
  }
}
