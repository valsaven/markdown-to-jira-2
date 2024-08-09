import * as path from 'node:path';
import type * as vscode from 'vscode';

export const getFileExtension = (document: vscode.TextDocument): string => path.extname(document.fileName);

export const getDirectoryPath = (document: vscode.TextDocument): string => path.dirname(document.uri.path);
