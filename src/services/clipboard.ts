import * as vscode from "vscode";

/**
 * Copie un texte dans le presse-papiers du système via l'API VS Code.
 * Isolé dans son propre service pour rester facilement testable
 * et remplaçable (ex : écrire dans un fichier plutôt que le presse-papiers).
 */
export async function copyToClipboard(text: string): Promise<void> {
  await vscode.env.clipboard.writeText(text);
}
