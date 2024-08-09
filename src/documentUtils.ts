import path from 'node:path';
import * as vscode from 'vscode';

export const createNewDocument = async (directory: string, content: string, fileExtension: string): Promise<void> => {
  const newFilePath = path.join(directory, `formatted_file${fileExtension}`);
  const uri = vscode.Uri.file(newFilePath).with({ scheme: 'untitled' });

  const document = await vscode.workspace.openTextDocument(uri);
  const edit = new vscode.WorkspaceEdit();
  edit.insert(uri, new vscode.Position(0, 0), content);

  const success = await vscode.workspace.applyEdit(edit);

  if (success) {
    vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
  } else {
    vscode.window.showInformationMessage('Unable to display the converted text.');
  }
};
