/**
 * Writes eval-report.md (suite reliability).
 * Cursor has no built-in telemetry — this script measures from gh CI logs,
 * git/PR history, and optional .eval/session.json (ask vs guess).
 *
 * Usage: node scripts/write-eval-report.mjs
 * Env: EVAL_ASK, EVAL_GUESS, EVAL_TRIGGER, GITHUB_TOKEN (for gh)
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const N = 10;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = path.join(ROOT, 'eval-report.md');
const SESSION = path.join(ROOT, '.eval', 'session.json');
const WORKFLOWS = ['Smoke', 'Sanity', 'Regression', 'E2E Tests', 'Test Generation'];

function sh(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts,
    }).trim();
  } catch (err) {
    return null;
  }
}

function ghJson(args) {
  const out = sh(`gh ${args} --jq .`);
  if (!out) return null;
  try {
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function readSession() {
  const asked = process.env.EVAL_ASK;
  const guessed = process.env.EVAL_GUESS;
  if (asked != null || guessed != null) {
    return {
      asked: Number(asked || 0),
      guessed: Number(guessed || 0),
      source: 'env EVAL_ASK / EVAL_GUESS',
    };
  }
  if (fs.existsSync(SESSION)) {
    const raw = JSON.parse(fs.readFileSync(SESSION, 'utf8'));
    return {
      asked: Number(raw.asked || 0),
      guessed: Number(raw.guessed || 0),
      source: '.eval/session.json (session review; no Cursor telemetry)',
      notes: raw.notes || '',
    };
  }
  return null;
}

function flakeFromGh() {
  const runs = [];
  for (const name of WORKFLOWS) {
    const list = ghJson(
      `run list --workflow "${name}" --limit ${N} --json databaseId,conclusion,status,url,displayTitle,createdAt,workflowName`,
    );
    if (Array.isArray(list)) runs.push(...list);
  }
  if (runs.length === 0) {
    return {
      measured: false,
      reason: 'gh CLI unavailable or unauthenticated (no CI log access)',
      flaky: 0,
      total: 0,
      rate: 'n/a',
    };
  }

  const completed = runs
    .filter((r) => r.status === 'completed')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, N);

  let flaky = 0;
  let examined = 0;
  for (const run of completed) {
    const log = sh(`gh run view ${run.databaseId} --log`);
    if (!log) continue;
    examined += 1;
    const hits = log.match(/\bflaky\b/gi);
    if (hits) flaky += hits.length;
  }

  const rate = examined === 0 ? 'n/a' : `${flaky} flaky mentions / ${examined} runs (last ${completed.length} completed)`;
  return { measured: true, flaky, total: examined, rate, runCount: completed.length };
}

function healFromGit() {
  const log = sh(
    `git log --all -i --format="%H\t%s" --grep="self-heal" --grep="locator after drift" --grep="fix(pom)"`,
  );
  const lines = (log || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const heals = [];
  let masked = 0;
  for (const line of lines) {
    const hash = line.slice(0, 40);
    const subject = line.slice(41);
    const isHeal = /locator after drift|^fix\(pom\)/i.test(subject) && !/hooks?/i.test(subject);
    if (!isHeal) continue;

    const specDiff = sh(`git show ${hash} --unified=0 -- "TestCases/**/*.spec.ts" "tests/**/*.spec.ts"`) || '';
    const expectTouched = /^[+-].*\bexpect\s*\(/m.test(specDiff);
    if (expectTouched) masked += 1;
    heals.push({ hash: hash.slice(0, 7), subject, masked: expectTouched });
  }

  const clean = heals.filter((h) => !h.masked).length;
  const total = heals.length;
  return { clean, total, masked, heals };
}

function generationFromGhOrGit() {
  const prs = ghJson(
    `pr list --state all --limit 30 --json number,title,headRefName,mergedAt,url,labels`,
  );
  if (Array.isArray(prs)) {
    const gen = prs.filter(
      (p) =>
        /^qa\//i.test(p.headRefName || '') ||
        (p.labels || []).some((l) => l.name === 'tests-generated'),
    );
    let firstGreen = 0;
    for (const pr of gen) {
      const checks = ghJson(`pr checks ${pr.number} --json name,state,conclusion`);
      const list = Array.isArray(checks) ? checks : [];
      const play = list.filter((c) => /smoke|sanity|e2e|playwright|test/i.test(c.name || ''));
      if (play.length && play.every((c) => c.conclusion === 'SUCCESS' || c.state === 'SUCCESS')) {
        firstGreen += 1;
      }
    }
    return {
      measured: true,
      total: gen.length,
      firstGreen,
      rate: gen.length ? `${firstGreen}/${gen.length}` : '0/0',
    };
  }

  const branches = sh(`git branch -a`) || '';
  const qa = branches.split('\n').filter((b) => /qa\/DS-/i.test(b));
  return {
    measured: false,
    total: qa.length,
    firstGreen: 0,
    rate: 'n/a',
    reason: 'gh unauthenticated — counted local qa/* branches only, not first-PR CI',
  };
}

function askVsGuess(session) {
  if (session) {
    const total = session.asked + session.guessed;
    const ratio = total === 0 ? 'n/a' : `${session.asked} asked / ${session.guessed} guessed`;
    return { ...session, ratio, total };
  }
  return {
    asked: 0,
    guessed: 0,
    ratio: 'n/a',
    total: 0,
    source: 'no .eval/session.json and no EVAL_ASK/EVAL_GUESS — not counted',
  };
}

function topRisk(flake, heal, gen, ask) {
  if (!flake.measured) {
    return {
      risk: 'Flake rate is not measurable: GitHub CLI has no credentials, and CI does not publish a JSON Playwright report.',
      action: 'Authenticate `gh`, add a JSON reporter on CI, then re-run `node scripts/write-eval-report.mjs`.',
    };
  }
  if (heal.masked > 0) {
    return {
      risk: `Masked-regression count is ${heal.masked} (must be 0): a heal changed spec expect( lines).`,
      action: 'Revert assertion edits on heal PRs; file app bugs instead of weakening expects.',
    };
  }
  if (ask.guessed > ask.asked && ask.total > 0) {
    return {
      risk: 'Agent guessed more values than it asked (invented data, tags, or locators).',
      action: 'On the next orchestrator run, stop and ask when a name, URL, or AC mapping is missing.',
    };
  }
  if (gen.measured && gen.total > 0 && gen.firstGreen / gen.total < 1) {
    return {
      risk: 'Generated specs are not green+conforming on the first PR.',
      action: 'Tighten test-writer + generation-gate; do not open the PR until the spec is green locally.',
    };
  }
  return {
    risk: 'Primary gap is still observability (retries hide flake; heals are counted from git subjects).',
    action: 'Keep masked-regression at 0; publish Playwright JSON on CI so flake is a real rate next time.',
  };
}

const trigger = process.env.EVAL_TRIGGER || 'local';
const flake = flakeFromGh();
const heal = healFromGit();
const gen = generationFromGhOrGit();
const ask = askVsGuess(readSession());
const { risk, action } = topRisk(flake, heal, gen, ask);
const now = new Date().toISOString();

const md = `# Eval report

Generated: ${now}  
Trigger: \`${trigger}\`  
Window: last **${N}** CI runs (when \`gh\` is authenticated). Cursor has **no built-in telemetry** for these metrics.

## Flake rate

**Number:** ${flake.measured ? flake.rate : `n/a (${flake.reason})`}

**How measured:** \`gh run list\` for Smoke / Sanity / Regression / E2E Tests / Test Generation (last ${N} completed), then \`gh run view <id> --log\` counted Playwright \`flaky\` lines (passed only after retry). ${flake.measured ? '' : 'This run could not read Actions logs.'}

**What it tells us:** ${flake.measured ? 'How often CI green is bought with retries rather than a first-pass pass.' : 'We cannot tell if the suite is stable until CI logs are readable.'}

## Heal success rate

**Number:** ${heal.clean}/${heal.total} clean heals; **masked-regression = ${heal.masked}** (must be 0)

**How measured:** \`git log --all\` for subjects matching self-heal / locator after drift / \`fix(pom)\`. A heal is **masked** if the same commit diffs \`expect(\` in \`tests/**\` or \`TestCases/**\`. POM-only locator diffs count as clean.

**What it tells us:** ${heal.masked === 0 ? 'Heals are not silencing product bugs by editing assertions.' : 'At least one heal changed assertions — that hides a regression.'}

${heal.heals.length ? heal.heals.map((h) => `- \`${h.hash}\` ${h.subject}${h.masked ? ' **MASKED**' : ''}`).join('\n') : '_No matching heal commits in git._'}

## Generation-gate pass rate

**Number:** ${gen.measured ? gen.rate : `n/a — ${gen.reason}`}

**How measured:** \`gh pr list\` for \`qa/*\` or label \`tests-generated\`, then first-check conclusions. Conforming = generation-gate rules (has \`expect(\`, no CSS/XPath \`page.locator\`). Maps-to-AC = PR links a DS ticket. Fallback without \`gh\`: count local \`qa/DS-*\` branches only.

**What it tells us:** ${gen.measured ? 'Whether test-writer output is shippable without a repair cycle.' : 'Gate exists (`.cursor/hooks/enforce-generation-gate.sh`) but first-PR CI pass rate is not in this clone.'}

## Ask vs guess

**Number:** ${ask.ratio}

**How measured:** ${ask.source || 'session review'}. Not inferred from model traces.

**What it tells us:** ${ask.total === 0 ? 'No session file this run — record asked/guessed in `.eval/session.json` before generating.' : ask.guessed > ask.asked ? 'The agent filled gaps instead of asking; invented values are a reliability risk.' : 'The agent preferred questions over invented values.'}

## Top reliability risk

${risk}

## Next action

${action}
`;

fs.writeFileSync(REPORT, md, 'utf8');
process.stdout.write(`wrote ${path.relative(ROOT, REPORT)}\n`);
