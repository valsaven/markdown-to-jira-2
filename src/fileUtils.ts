import * as path from 'node:path';
import type * as vscode from 'vscode';

export const getFileExtension = (document: vscode.TextDocument): string => path.extname(document.fileName);

export const isConvertibleDocument = (document: vscode.TextDocument, sourceExtension: string): boolean =>
  document.isUntitled || getFileExtension(document) === sourceExtension;

export const getOutputDirectory = (document: vscode.TextDocument): string | undefined => {
  if (document.isUntitled) {
    return undefined;
  }

  return path.dirname(document.uri.fsPath);
};
