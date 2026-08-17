const fs = require('fs');
const path = require('path');

const input = JSON.parse(process.argv[2]);
const filePath = input.file_path || '';
const edits = Array.isArray(input.edits) ? input.edits : [];

function log(level, message) {
  process.stderr.write(`[constitution] ${level}: ${message}\n`);
}

function deny(reason) {
  log('BLOCK', reason);
  process.stderr.write(
    JSON.stringify({
      permission: 'deny',
      user_message: reason,
      agent_message:
        'Edit blocked by constitution (see .cursor/rules/constitution.mdc). Fix the violation - do not weaken assertions, use role-based locators, env vars for secrets, and tag individual tests only.',
    }) + '\n',
  );
  process.exit(2);
}

function allow(reason) {
  log('ALLOW', reason);
  process.exit(0);
}

const normalized = filePath.replace(/\\/g, '/');
const inTests =
  /(^|\/)tests\//.test(normalized) && /\.(ts|js|tsx|jsx)$/.test(normalized);
const inPages =
  /(^|\/)pages\//.test(normalized) && /\.(ts|js|tsx|jsx)$/.test(normalized);

if (!inTests && !inPages) {
  allow(`skipped (not tests/** or pages/**): ${filePath || '(no path)'}`);
}

let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  log('ERROR', `could not read ${filePath}: ${err.message}`);
  process.exit(1);
}

const basename = path.basename(filePath);

function stripBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '');
}

function checkWontViolations(text) {
  const code = stripBlockComments(text);

  if (/\bpage\.waitForTimeout\s*\(/.test(code)) {
    deny(`${basename}: forbidden page.waitForTimeout - use web-first expect(locator)`);
  }

  const locatorRe = /(?:page\.)?locator\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let locMatch;
  while ((locMatch = locatorRe.exec(code)) !== null) {
    const selector = locMatch[2];
    if (selector.includes('//')) {
      deny(
        `${basename}: forbidden XPath in locator - "${selector.slice(0, 80)}${selector.length > 80 ? '...' : ''}"`,
      );
    }
  }

  if (/\blocator\s*\(\s*['"`]xpath[=:]/i.test(code) || /\bgetByXPath\s*\(/.test(code)) {
    deny(`${basename}: forbidden XPath locator - use getByRole/getByLabel in POM`);
  }

  const anyPatterns = [
    /:\s*any\b/,
    /:\s*any\[\]/,
    /\bas\s+any\b/,
    /<any>/,
    /\bArray<any>/,
  ];
  for (const re of anyPatterns) {
    if (re.test(code)) {
      deny(`${basename}: forbidden TypeScript any - use proper types or narrow unknown`);
    }
  }

  const credentialPatterns = [
    { re: /Bearer\s+eyJ[A-Za-z0-9_-]{10,}/, msg: 'hardcoded Bearer/JWT token' },
    { re: /\beyJhbGci[A-Za-z0-9_-]+/, msg: 'hardcoded JWT' },
    {
      re: /(?:password|secret|api_key|apikey|api_token|access_token)\s*[:=]\s*['"`](?!\s*\+)[^'"`]{8,}['"`]/i,
      msg: 'hardcoded credential string',
    },
    {
      re: /Authorization\s*:\s*['"`]Bearer\s+[^'"`]+['"`]/,
      msg: 'hardcoded Authorization header',
    },
    {
      re: /['"`]Bearer\s+eyJ[^'"`]+['"`]/,
      msg: 'hardcoded Bearer token literal',
    },
  ];
  for (const { re, msg } of credentialPatterns) {
    if (re.test(code)) {
      deny(`${basename}: ${msg}`);
    }
  }

  if (inTests) {
    if (/test\.describe\s*\([^)]*\{[^}]*\btag\s*:/s.test(code)) {
      deny(`${basename}: tag on test.describe() - tag individual test() only`);
    }
    if (/test\.describe\.configure\s*\(\s*\{[^}]*\btag\s*:/s.test(code)) {
      deny(`${basename}: tag on test.describe.configure - tag individual test() only`);
    }
  }
}

checkWontViolations(content);

if (inTests) {
  function countActiveExpects(text) {
    const lines = stripBlockComments(text).split('\n');
    let count = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//')) continue;
      const matches = line.match(/\bexpect\s*\(/g);
      if (matches) count += matches.length;
    }
    return count;
  }

  function countCommentedExpects(text) {
    const lines = stripBlockComments(text).split('\n');
    let count = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') && /\bexpect\s*\(/.test(line)) {
        count += (line.match(/\bexpect\s*\(/g) || []).length;
      }
    }
    return count;
  }

  function reconstructBefore(after, editList) {
    let before = after;
    for (let i = editList.length - 1; i >= 0; i -= 1) {
      const { old_string, new_string } = editList[i];
      if (!old_string && !new_string) continue;
      if (new_string && before.includes(new_string)) {
        before = before.replace(new_string, old_string);
      } else if (old_string && !before.includes(old_string)) {
        return null;
      }
    }
    return before;
  }

  if (edits.length > 0) {
    const beforeContent = reconstructBefore(content, edits);
    if (beforeContent) {
      const activeBefore = countActiveExpects(beforeContent);
      const activeAfter = countActiveExpects(content);
      const commentedBefore = countCommentedExpects(beforeContent);
      const commentedAfter = countCommentedExpects(content);

      if (activeAfter < activeBefore) {
        deny(
          `${basename}: active expect( count dropped ${activeBefore} -> ${activeAfter} (assertion removed or weakened)`,
        );
      }

      if (commentedAfter > commentedBefore) {
        deny(
          `${basename}: expect( commented out (${commentedBefore} -> ${commentedAfter} commented expects)`,
        );
      }

      for (const edit of edits) {
        const oldActive = countActiveExpects(edit.old_string || '');
        const newActive = countActiveExpects(edit.new_string || '');
        const oldCommented = countCommentedExpects(edit.old_string || '');
        const newCommented = countCommentedExpects(edit.new_string || '');
        if (newActive < oldActive || newCommented > oldCommented) {
          deny(
            `${basename}: edit chunk weakened assertions (active ${oldActive}->${newActive}, commented ${oldCommented}->${newCommented})`,
          );
        }
      }
    }
  }
}

allow(`${basename}: passed constitution gate`);
