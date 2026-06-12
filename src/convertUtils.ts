import jira2md from 'jira2md';
import * as vscode from 'vscode';
import { createNewDocument } from './documentUtils';
import { type DocumentFormat, detectDocumentFormat } from './formatUtils';
import { getOutputDirectory, isConvertibleDocument } from './fileUtils';

type ConversionOptions = {
  sourceExtension: string;
  targetExtension: string;
  convertFunction: (text: string) => string;
  errorMessage: string;
};

type ResolvedConversion = {
  targetExtension: string;
  convertFunction: (text: string) => string;
};

const getConversionForFormat = (format: DocumentFormat): ResolvedConversion => {
  if (format === 'markdown') {
    return {
      targetExtension: '.jira',
      convertFunction: jira2md.to_jira,
    };
  }

  return {
    targetExtension: '.md',
    convertFunction: jira2md.to_markdown,
  };
};

const promptDocumentFormat = async (): Promise<DocumentFormat | undefined> => {
  const selection = await vscode.window.showQuickPick(
    [
      { label: 'Markdown', value: 'markdown' as const },
      { label: 'JIRA', value: 'jira' as const },
    ],
    { placeHolder: 'Select the format of the current untitled document' },
  );

  return selection?.value;
};

const resolveUntitledConversion = async (document: vscode.TextDocument): Promise<ResolvedConversion | undefined> => {
  let format = detectDocumentFormat(document.getText(), document.languageId);

  if (format === 'unknown') {
    format = await promptDocumentFormat() ?? 'unknown';
  }

  if (format === 'unknown') {
    return undefined;
  }

  return getConversionForFormat(format);
};

const convertDocument = async (options: ConversionOptions): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.error('No active editor window found.');
    return;
  }

  const document = editor.document;
  const conversion = document.isUntitled
    ? await resolveUntitledConversion(document)
    : isConvertibleDocument(document, options.sourceExtension)
      ? { targetExtension: options.targetExtension, convertFunction: options.convertFunction }
      : undefined;

  if (!conversion) {
    if (!document.isUntitled) {
      vscode.window.showInformationMessage(options.errorMessage);
    }
    return;
  }

  const formattedText = conversion.convertFunction(document.getText());
  await createNewDocument(
    getOutputDirectory(document),
    formattedText,
    conversion.targetExtension
  );
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
