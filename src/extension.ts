import * as vscode from "vscode";
import { copyAiContextCommand } from "./commands/copyContext";

/**
 * Appelé par VS Code lors de l'activation de l'extension
 * (déclenchée par l'événement défini dans package.json > activationEvents,
 * ici automatiquement via la présence de la commande "onCommand").
 */
export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "aiContextCopier.copyContext",
    (clickedUri: vscode.Uri | undefined, selectedUris: vscode.Uri[] | undefined) =>
      copyAiContextCommand(clickedUri, selectedUris)
  );

  context.subscriptions.push(disposable);
}

/**
 * Appelé par VS Code lors de la désactivation de l'extension.
 * Rien à nettoyer manuellement ici : `context.subscriptions` s'en charge.
 */
export function deactivate(): void {
  // no-op
}
