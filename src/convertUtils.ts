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

const getConversionForFormat = (format: Exclude<DocumentFormat, 'unknown'>): ResolvedConversion => {
  if (format === 'markdown') {
    return {
      targetExtension: '.jira',
      convertFunction: jira2md.to_jira,
    };
  }

  if (format === 'jira') {
    return {
      targetExtension: '.md',
      convertFunction: jira2md.to_markdown,
    };
  }

  const _exhaustive: never = format;
  throw new Error(`Unhandled format: ${_exhaustive}`);
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

const convertDocument = async (options: ConversionOptions): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.error('No active editor window found.');
    return;
  }

  const document = editor.document;

  let conversion: ResolvedConversion | undefined;

  if (document.isUntitled) {
    // For untitled documents we can't check extension, so honour the invoked
    // command directly. Fall back to auto-detection only when the format score
    // is ambiguous, and prompt the user when even detection can't decide.
    const detectedFormat = detectDocumentFormat(document.getText(), document.languageId);

    if (detectedFormat === 'unknown') {
      const promptedFormat = await promptDocumentFormat();
      // If the user dismissed the QuickPick, silently do nothing.
      if (!promptedFormat || promptedFormat === 'unknown') {
        return;
      }
      conversion = getConversionForFormat(promptedFormat);
    } else {
      conversion = getConversionForFormat(detectedFormat);
    }
  } else if (isConvertibleDocument(document, options.sourceExtension)) {
    conversion = {
      targetExtension: options.targetExtension,
      convertFunction: options.convertFunction,
    };
  } else {
    vscode.window.showInformationMessage(options.errorMessage);
    return;
  }

  const formattedText = conversion.convertFunction(document.getText());
  await createNewDocument(
    getOutputDirectory(document),
    formattedText,
    conversion.targetExtension,
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
