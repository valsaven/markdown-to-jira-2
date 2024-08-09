import jira2md from 'jira2md';
import * as vscode from 'vscode';
import { createNewDocument } from './documentUtils';
import { getDirectoryPath, getFileExtension } from './fileUtils';

type ConversionOptions = {
  sourceExtension: string;
  targetExtension: string;
  convertFunction: (text: string) => string;
  errorMessage: string;
};

const convertDocument = async (options: ConversionOptions): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.error('No active editor window found.');
    return;
  }

  const document = editor.document;
  const fileExtension = getFileExtension(document);

  if (fileExtension !== options.sourceExtension) {
    vscode.window.showInformationMessage(options.errorMessage);
    return;
  }

  const formattedText = options.convertFunction(document.getText());
  await createNewDocument(getDirectoryPath(document), formattedText, options.targetExtension);
};

export const convertToMarkdown = async (): Promise<void> => {
  await convertDocument({
    sourceExtension: '.jira',
    targetExtension: '.md',
    convertFunction: jira2md.to_markdown,
    errorMessage: 'The current file is not a valid JIRA (.jira) file.',
  });
};

export const convertToJira = async (): Promise<void> => {
  await convertDocument({
    sourceExtension: '.md',
    targetExtension: '.jira',
    convertFunction: jira2md.to_jira,
    errorMessage: 'The current file is not a valid Markdown (.md) file.',
  });
};
