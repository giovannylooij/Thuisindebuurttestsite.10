import { parse } from '@babel/parser';
import fs from 'node:fs';
const opts = { sourceType: 'script', plugins: ['jsx'] };
const ORDE = ['ui.jsx','tweaks-panel.jsx','app.jsx','home.jsx','buurtatlas.jsx','clubjes.jsx','detail.jsx','boek.jsx','contact.jsx','other.jsx'];
let fouten = 0;
function check(naam, code, offset = 0) {
  try { parse(code, opts); console.log('OK  ', naam); }
  catch (e) {
    fouten++;
    console.log('FOUT', naam, '— regel', (e.loc ? e.loc.line + offset : '?'), ':', e.message.split('\n')[0]);
  }
}
for (const f of ORDE) check('bundle-src/' + f, fs.readFileSync('bundle-src/' + f, 'utf8'));
// Alle schermbestanden komen in één Babel-script terecht: dubbele namen
// tussen twee bestanden breken dan de hele site. Dus ook samen controleren.
let samen = '', grenzen = [];
for (const f of ORDE) { grenzen.push([samen.split('\n').length, f]); samen += fs.readFileSync('bundle-src/' + f, 'utf8') + '\n'; }
try { parse(samen, opts); console.log('OK   alle schermbestanden samen (geen dubbele namen)'); }
catch (e) {
  fouten++;
  const r = e.loc ? e.loc.line : 0;
  const uit = grenzen.filter(([n]) => n <= r).pop();
  console.log('FOUT samen — regel', r, '(' + (uit ? uit[1] : '?') + '):', e.message.split('\n')[0]);
}
const html = fs.readFileSync('beheer.html', 'utf8');
const re = /<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/g;
let m, n = 0;
while ((m = re.exec(html)) !== null) {
  const voor = html.slice(0, m.index + m[0].indexOf(m[1]));
  check('beheer.html script #' + (++n), m[1], voor.split('\n').length - 1);
}
console.log(fouten, 'fout(en)');
process.exit(fouten ? 1 : 0);
