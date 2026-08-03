import * as vscode from "vscode";
import { buildSelectionTree } from "../services/fileTree";
import { copyToClipboard } from "../services/clipboard";
import { resolveSelection } from "../utils/workspace";

const CONFIG_SECTION = "aiContextCopier";

/**
 * Valeurs par défaut des dossiers/fichiers exclus, réutilisées si rien
 * n'est configuré (identiques à celles de copyContext.ts).
 */
const DEFAULT_EXCLUDED_PATTERNS = [
  "node_modules",
  "dist",
  "build",
  ".git",
  "out",
  ".vscode",
];

/**
 * Point d'entrée de la commande "Copy Project Tree".
 *
 * Contrairement à "Copy AI Context" (qui copie le contenu des fichiers),
 * cette commande copie uniquement la structure en arbre des éléments
 * sélectionnés, affichée depuis la racine du workspace.
 *
 * Utile pour donner à une IA le plan d'une partie du projet (ex. `src/`)
 * sans faire remonter tout l'arbre complet, y compris des dossiers non
 * pertinents comme `node_modules`.
 *
 * @param clickedUri Uri de l'élément sur lequel l'utilisateur a fait clic droit
 * @param selectedUris Ensemble des Uris sélectionnés dans l'Explorer (multi-sélection)
 */
export async function copyProjectTreeCommand(
  clickedUri: vscode.Uri | undefined,
  selectedUris: vscode.Uri[] | undefined
): Promise<void> {
  const uris = resolveSelection(clickedUri, selectedUris);

  if (uris.length === 0) {
    vscode.window.showErrorMessage(
      "Copy Project Tree : aucun fichier ou dossier sélectionné."
    );
    return;
  }

  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  const excludedPatterns = config.get<string[]>(
    "excludedPatterns",
    DEFAULT_EXCLUDED_PATTERNS
  );

  const tree = await buildSelectionTree(uris, excludedPatterns);

  if (!tree) {
    vscode.window.showErrorMessage(
      "Copy Project Tree : impossible de générer l'arborescence pour cette sélection."
    );
    return;
  }

  await copyToClipboard(tree);

  vscode.window.showInformationMessage("Project tree copied successfully.");
}