import * as vscode from 'vscode';
import { convertToJira, convertToMarkdown } from './convertUtils';

export function activate(context: vscode.ExtensionContext): void {
  const toJiraCommand = vscode.commands.registerCommand('extension.convertMarkdown', convertToJira);
  const toMarkdownCommand = vscode.commands.registerCommand('extension.convertJira', convertToMarkdown);

  context.subscriptions.push(toJiraCommand, toMarkdownCommand);
}

export function deactivate(): void {}
