import type { Result } from 'axe-core';

export function formatViolations(violations: Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    - \`${node.html}\` (${node.target.join(' > ')})`)
        .join('\n');
      return [
        `### ${violation.id} (${violation.impact ?? 'unknown impact'})`,
        `${violation.help}: ${violation.description}`,
        `Help URL: ${violation.helpUrl}`,
        'Affected nodes:',
        nodes,
      ].join('\n');
    })
    .join('\n\n');
}

export function recordViolations(scope: string, violations: Result[]): void {
  if (violations.length === 0) return;

  console.warn(`[a11y] ${scope} — ${violations.length} violation(s):\n${formatViolations(violations)}`);
}