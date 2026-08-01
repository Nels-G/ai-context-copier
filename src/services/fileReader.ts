import * as vscode from "vscode";
import { minimatch } from "minimatch";
import { toWorkspaceRelativePath, isDirectory } from "../utils/workspace";
import { BatchReadResult, ReadFileResult } from "../types";

/**
 * Nombre d'octets inspectés au début du fichier pour détecter un binaire.
 * Une valeur de 8000 est un bon compromis rapidité / fiabilité,
 * c'est d'ailleurs l'ordre de grandeur utilisé par Git.
 */
const BINARY_SNIFF_SIZE = 8000;

/**
 * Détermine heuristiquement si un buffer représente du contenu binaire.
 * Règle simple et robuste : présence d'un octet NUL dans les premiers
 * kilo-octets du fichier.
 */
function looksBinary(buffer: Uint8Array): boolean {
  const sample = buffer.subarray(0, Math.min(BINARY_SNIFF_SIZE, buffer.length));
  return sample.includes(0);
}

/**
 * Vérifie si un chemin relatif correspond à l'un des patterns d'exclusion
 * configurés par l'utilisateur (node_modules, dist, .git, etc.).
 */
function isExcluded(relativePath: string, excludedPatterns: string[]): boolean {
  return excludedPatterns.some((pattern) =>
    minimatch(relativePath, pattern, { dot: true, matchBase: true })
  );
}

/**
 * Décode un buffer en texte en préservant fidèlement les fins de ligne
 * et l'indentation d'origine (aucune normalisation n'est appliquée).
 */
function decodeContent(buffer: Uint8Array): string {
  return new TextDecoder("utf-8").decode(buffer);
}

/**
 * Lit une liste d'Uris (fichiers et/ou dossiers) et retourne le contenu
 * de chaque fichier valide, dans l'ordre de sélection d'origine.
 *
 * - Les dossiers sont ignorés silencieusement.
 * - Les fichiers binaires sont ignorés silencieusement.
 * - Les fichiers exclus par configuration sont ignorés silencieusement.
 * - Les fichiers illisibles sont remontés comme erreurs (sans interrompre le traitement).
 */
export async function readSelectedFiles(
  uris: readonly vscode.Uri[],
  excludedPatterns: string[]
): Promise<BatchReadResult> {
  const successes: ReadFileResult[] = [];
  const errors: { relativePath: string; reason: string }[] = [];
  const skipped: string[] = [];

  for (const uri of uris) {
    const relativePath = toWorkspaceRelativePath(uri);

    try {
      if (await isDirectory(uri)) {
        skipped.push(relativePath);
        continue;
      }

      if (isExcluded(relativePath, excludedPatterns)) {
        skipped.push(relativePath);
        continue;
      }

      const buffer = await vscode.workspace.fs.readFile(uri);

      if (looksBinary(buffer)) {
        skipped.push(relativePath);
        continue;
      }

      successes.push({
        relativePath,
        content: decodeContent(buffer),
      });
    } catch (err) {
      errors.push({
        relativePath,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { successes, errors, skipped };
}
