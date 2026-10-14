#!/usr/bin/env node
// Zet het versienummer in beheer.html.
//
// Het nummer is "1.0.<aantal commits>", waarbij de commit die nu gemaakt wordt
// alvast meetelt; de datum is de dag van vandaag. Draait automatisch via de
// git-hook .git/hooks/pre-commit (kopie: tools/hooks/pre-commit), maar kan ook
// met de hand: node tools/tib-versie.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const twee = (n) => String(n).padStart(2, '0');
const nu = new Date();
const datum = `${twee(nu.getDate())}-${twee(nu.getMonth() + 1)}-${nu.getFullYear()}`;

let commits = 0;
try {
  commits = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim(), 10) || 0;
} catch {
  // Geen git-geschiedenis (bijvoorbeeld een verse kloon): dan maar bij 0 beginnen.
}
const nummer = `1.0.${commits + 1}`;

const bestand = fileURLToPath(new URL('../beheer.html', import.meta.url));
const bron = readFileSync(bestand, 'utf8');
const patroon = /const CMS_VERSIE = \{[^}]*\};/;
if (!patroon.test(bron)) {
  console.error('tib-versie: de regel "const CMS_VERSIE = { ... };" staat niet in beheer.html');
  process.exit(1);
}
const nieuw = bron.replace(patroon, `const CMS_VERSIE = { nummer: '${nummer}', datum: '${datum}' };`);
if (nieuw === bron) {
  console.log(`tib-versie: ongewijzigd (${nummer}, ${datum})`);
  process.exit(0);
}
writeFileSync(bestand, nieuw);
console.log(`tib-versie: versie gezet op ${nummer} (${datum})`);
