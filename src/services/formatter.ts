import { ReadFileResult, OutputFormat } from "../types";

/** Séparateur fixe imposé entre le chemin et le contenu d'un fichier. */
const SEPARATOR = "--------------------------------";

/**
 * Formate un seul fichier au format texte demandé :
 *
 * <chemin relatif>
 * --------------------------------
 * <contenu>
 *
 * @param relativePath Chemin relatif du fichier (racine du workspace)
 * @param content Contenu brut du fichier
 */
export function formatFile(relativePath: string, content: string): string {
  return `${relativePath}\n${SEPARATOR}\n${content}`;
}

/**
 * Ajoute optionnellement des numéros de ligne devant chaque ligne
 * d'un contenu (bonus configurable, désactivé par défaut).
 */
export function withLineNumbers(content: string): string {
  const lines = content.split("\n");
  const width = String(lines.length).length;
  return lines
    .map((line, index) => `${String(index + 1).padStart(width, " ")} | ${line}`)
    .join("\n");
}

/**
 * Assemble le texte final à copier dans le presse-papiers à partir
 * de la liste des fichiers lus avec succès, dans leur ordre de sélection.
 *
 * Chaque bloc de fichier est séparé du suivant par deux retours à la ligne,
 * conformément au format demandé.
 */
export function buildClipboardText(
  files: ReadFileResult[],
  options: { includeLineNumbers: boolean; fileTree?: string } = {
    includeLineNumbers: false,
  }
): string {
  const blocks = files.map((file) => {
    const content = options.includeLineNumbers
      ? withLineNumbers(file.content)
      : file.content;
    return formatFile(file.relativePath, content);
  });

  const body = blocks.join("\n\n");

  if (options.fileTree) {
    return `${options.fileTree}\n\n${body}`;
  }

  return body;
}

/**
 * Point d'extension pour les futurs formats de sortie (Markdown, XML, JSON).
 * Aujourd'hui, seul "txt" est implémenté ; les autres valeurs retombent
 * sur le format texte historique afin de ne jamais bloquer l'utilisateur.
 */
export function buildOutput(
  files: ReadFileResult[],
  format: OutputFormat,
  options: { includeLineNumbers: boolean; fileTree?: string }
): string {
  switch (format) {
    case "txt":
    default:
      return buildClipboardText(files, options);
    // "markdown" | "xml" | "json" seront ajoutés ici dans une prochaine version.
  }
}
