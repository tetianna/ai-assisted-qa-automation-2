const fs = require('fs');

function readTextFile(p) {
  const b = fs.readFileSync(p);
  if (b.length >= 2 && b[1] === 0 && b[0] < 128) {
    let t = b.toString('utf16le');
    if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
    return t;
  }
  return b.toString('utf8');
}

const nodeBody = readTextFile('scripts/enforce-constitution.node.js');
const sh =
  '#!/usr/bin/env bash\n' +
  '# Constitution gate for agent Write edits under tests/** and pages/**\n' +
  'set -euo pipefail\n\n' +
  'input="$(cat)"\n\n' +
  "node - \"$input\" <<'NODE'\n" +
  nodeBody +
  '\nNODE\n';
fs.writeFileSync('.cursor/hooks/enforce-constitution.sh', sh, 'utf8');
console.log('written enforce-constitution.sh');
