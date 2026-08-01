import * as vscode from "vscode";
import { readSelectedFiles } from "../services/fileReader";
import { buildOutput } from "../services/formatter";
import { copyToClipboard } from "../services/clipboard";
import { buildFileTree } from "../services/fileTree";
import { ExtensionConfig } from "../types";

const CONFIG_SECTION = "aiContextCopier";

/**
 * Lit la configuration de l'extension depuis les Settings VS Code,
 * avec des valeurs par défaut sûres si rien n'est configuré.
 */
function loadConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

  return {
    excludedPatterns: config.get<string[]>("excludedPatterns", [
      "node_modules",
      "dist",
      "build",
      ".git",
      "out",
      ".vscode",
    ]),
    includeLineNumbers: config.get<boolean>("includeLineNumbers", false),
    includeFileTree: config.get<boolean>("includeFileTree", false),
    outputFormat: config.get<ExtensionConfig["outputFormat"]>("outputFormat", "txt"),
  };
}

/**
 * Point d'entrée de la commande "Copy AI Context".
 *
 * @param clickedUri Uri de l'élément sur lequel l'utilisateur a fait clic droit
 * @param selectedUris Ensemble des Uris sélectionnés dans l'Explorer (multi-sélection)
 */
export async function copyAiContextCommand(
  clickedUri: vscode.Uri | undefined,
  selectedUris: vscode.Uri[] | undefined
): Promise<void> {
  const uris = resolveSelection(clickedUri, selectedUris);

  if (uris.length === 0) {
    vscode.window.showErrorMessage(
      "Copy AI Context : aucun fichier sélectionné."
    );
    return;
  }

  const config = loadConfig();

  const { successes, errors } = await readSelectedFiles(
    uris,
    config.excludedPatterns
  );

  // Une notification par erreur, mais on continue toujours le traitement
  // des autres fichiers, conformément au cahier des charges.
  for (const error of errors) {
    vscode.window.showWarningMessage(
      `Copy AI Context : impossible de lire "${error.relativePath}" (${error.reason}).`
    );
  }

  if (successes.length === 0) {
    vscode.window.showErrorMessage(
      "Copy AI Context : aucun fichier valide à copier (fichiers binaires, dossiers ou illisibles uniquement)."
    );
    return;
  }

  let fileTree: string | undefined;
  if (config.includeFileTree) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uris[0]);
    if (workspaceFolder) {
      fileTree = await buildFileTree(workspaceFolder.uri, config.excludedPatterns);
    }
  }

  const output = buildOutput(successes, config.outputFormat, {
    includeLineNumbers: config.includeLineNumbers,
    fileTree,
  });

  await copyToClipboard(output);

  const count = successes.length;
  vscode.window.showInformationMessage(
    `${count} file${count > 1 ? "s" : ""} copied successfully.`
  );
}

/**
 * Détermine la liste finale d'Uris à traiter, en tenant compte du fait
 * que VS Code peut fournir soit une multi-sélection (clic droit sur
 * un groupe sélectionné), soit un unique élément cliqué.
 *
 * On préserve l'ordre de sélection tel que fourni par VS Code.
 */
function resolveSelection(
  clickedUri: vscode.Uri | undefined,
  selectedUris: vscode.Uri[] | undefined
): vscode.Uri[] {
  if (selectedUris && selectedUris.length > 0) {
    return selectedUris;
  }

  if (clickedUri) {
    return [clickedUri];
  }

  return [];
}
