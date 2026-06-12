export type DocumentFormat = 'markdown' | 'jira' | 'unknown';

const JIRA_PATTERNS: RegExp[] = [
  /\{code[:|\s]/,
  /\{noformat\}/,
  /\{quote\}/,
  /^h[1-6]\.\s/m,
  /\{color:[^}]+\}/,
  /\|\|[^|\n]+\|\|/,
];

const MARKDOWN_PATTERNS: RegExp[] = [
  /```[\s\S]*?```/,
  /~~~[\s\S]*?~~~/,
  /^#{2,6}\s/m,
  /\[[^\]]+\]\([^)]+\)/,
  /!\[[^\]]*\]\([^)]+\)/,
  /^\s*[-*+]\s+\S/m,
];

const scorePatterns = (text: string, patterns: RegExp[]): number => {
  return patterns.reduce((score, pattern) => score + (pattern.test(text) ? 1 : 0), 0);
};

export const detectDocumentFormat = (text: string, languageId?: string): DocumentFormat => {
  if (languageId === 'markdown') {
    return 'markdown';
  }

  const jiraScore = scorePatterns(text, JIRA_PATTERNS);
  const markdownScore = scorePatterns(text, MARKDOWN_PATTERNS);

  if (jiraScore > markdownScore) {
    return 'jira';
  }

  if (markdownScore > jiraScore) {
    return 'markdown';
  }

  return 'unknown';
};