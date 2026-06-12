import * as assert from 'node:assert';
import type * as vscode from 'vscode';
import { getOutputDirectory, isConvertibleDocument } from '../fileUtils';

const createDocument = (overrides: Partial<vscode.TextDocument>): vscode.TextDocument => {
  return {
    fileName: 'example.md',
    isUntitled: false,
    uri: { fsPath: String.raw`C:\project\example.md` } as vscode.Uri,
    ...overrides,
  } as vscode.TextDocument;
};

suite('fileUtils', () => {
  suite('isConvertibleDocument', () => {
    test('allows matching file extensions', () => {
      const document = createDocument({ fileName: 'notes.md' });

      assert.strictEqual(isConvertibleDocument(document, '.md'), true);
      assert.strictEqual(isConvertibleDocument(document, '.jira'), false);
    });

    test('allows untitled editors regardless of file name', () => {
      const document = createDocument({
        fileName: 'Untitled-1',
        isUntitled: true,
        uri: { fsPath: '' } as vscode.Uri,
      });

      assert.strictEqual(isConvertibleDocument(document, '.md'), true);
      assert.strictEqual(isConvertibleDocument(document, '.jira'), true);
    });
  });

  suite('getOutputDirectory', () => {
    test('returns the source directory for saved files', () => {
      const document = createDocument({
        uri: { fsPath: String.raw`C:\project\notes.md` } as vscode.Uri,
      });

      assert.strictEqual(getOutputDirectory(document), String.raw`C:\project`);
    });

    test('returns undefined for untitled editors', () => {
      const document = createDocument({
        fileName: 'Untitled-1',
        isUntitled: true,
        uri: { fsPath: '' } as vscode.Uri,
      });

      assert.strictEqual(getOutputDirectory(document), undefined);
    });
  });
});
