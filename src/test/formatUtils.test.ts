import * as assert from 'node:assert';
import { detectDocumentFormat } from '../formatUtils';

const jiraSample = `# *Run the hobby deployment script:*

   {code:bash}
   curl -fsSL https://raw.githubusercontent.com/some-arbitrary-url/bash.sh
   {code} (please ignore the extra escape so it won't break)`;

const markdownSample = `# Run the hobby deployment script

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/some-arbitrary-url/bash.sh
\`\`\` (please ignore the extra escape so it won't break)`;

suite('formatUtils', () => {
  suite('detectDocumentFormat', () => {
    test('detects JIRA markup in untitled content', () => {
      assert.strictEqual(detectDocumentFormat(jiraSample), 'jira');
    });

    test('detects Markdown in untitled content', () => {
      assert.strictEqual(detectDocumentFormat(markdownSample), 'markdown');
    });

    test('uses languageId as a hint when patterns are ambiguous', () => {
      const ambiguous = 'Run the hobby deployment script';

      assert.strictEqual(detectDocumentFormat(ambiguous, 'markdown'), 'markdown');
      assert.strictEqual(detectDocumentFormat(ambiguous), 'unknown');
    });
  });
});
