/**
 * Types et interfaces partagés dans toute l'extension.
 */

/**
 * Représente un fichier lu avec succès, prêt à être formaté.
 */
export interface ReadFileResult {
  /** Chemin relatif à la racine du workspace (toujours en slashs "/") */
  relativePath: string;
  /** Contenu brut du fichier, fins de ligne préservées */
  content: string;
}

/**
 * Représente un échec de lecture pour un fichier donné.
 */
export interface ReadFileError {
  relativePath: string;
  reason: string;
}

/**
 * Résultat global de la lecture de plusieurs fichiers.
 */
export interface BatchReadResult {
  successes: ReadFileResult[];
  errors: ReadFileError[];
  /** Fichiers ignorés silencieusement (dossiers, binaires, exclusions) */
  skipped: string[];
}

/**
 * Formats de sortie possibles (bonus : évolutif dans le temps).
 * Pour l'instant seul TXT (format historique demandé) est implémenté,
 * mais l'architecture est prête à accueillir Markdown / XML / JSON.
 */
export type OutputFormat = "txt" | "markdown" | "xml" | "json";

/**
 * Options de configuration de l'extension, lues depuis les Settings VS Code.
 * Voir la section "contributes.configuration" de package.json.
 */
export interface ExtensionConfig {
  /** Glob patterns de dossiers/fichiers à toujours exclure */
  excludedPatterns: string[];
  /** Ajouter les numéros de ligne devant chaque ligne de contenu */
  includeLineNumbers: boolean;
  /** Ajouter l'arborescence du projet avant les fichiers */
  includeFileTree: boolean;
  /** Format de sortie choisi */
  outputFormat: OutputFormat;
}
