#!/usr/bin/env node
// tib-bundle.mjs — decodeer/encodeer de website-bundle in index.html
//
// De React-app van de website zit als gzip+base64 in twee script-tags in
// index.html (__bundler/manifest en __bundler/template). Dit script maakt
// die assets bewerkbaar en bouwt index.html daarna weer op.
//
// Gebruik:
//   node tools/tib-bundle.mjs decode [--file index.html] [--out bundle-src]
//   node tools/tib-bundle.mjs encode [--file index.html] [--src bundle-src]
//
// decode: schrijft alle tekst-assets (js/jsx) + de HTML-template naar --out,
//         plus een meta.json die bestandsnaam ↔ uuid koppelt.
// encode: leest de bestanden uit --src terug, gzipt/base64't ze en vervangt
//         de data in index.html. Fonts/afbeeldingen blijven onaangeraakt.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const NAMES = {
  '175a63c1-863c-43df-8bad-6493b6e387bb': 'vendor-leaflet.js',
  '02ce216d-2048-4b91-a2fa-46de13fc2b99': 'vendor-react.js',
  '4ae0ff2b-a235-4efe-a933-71f036f1dbda': 'vendor-react-dom.js',
  '5e814c90-5a8d-491a-a31d-b694ff89aff2': 'vendor-babel.js',
  'f946b59c-8422-494b-bc71-575fa4e0c168': 'image-slot.js',
  '87fcbd55-f850-4c65-a440-d260bead531a': 'ui.jsx',
  'af3df389-67db-4520-bbc5-043d48ec6291': 'tweaks-panel.jsx',
  '57bfbd7b-1ab7-42c7-99d9-c41feb01a9fc': 'app.jsx',
  'bcb4c1ce-cd83-42c0-abef-bfa49aad2c1e': 'home.jsx',
  '00c48f02-7716-4c37-92f6-3dd85ec94bcd': 'buurtatlas.jsx',
  '0de5d0a5-59cc-4de7-a681-656e8f7a817e': 'clubjes.jsx',
  '2ddf5bd1-b6d6-4c7f-b6d3-ccade2f52fd4': 'detail.jsx',
  '2f45df51-1e46-40c8-b9bc-24f5b1a47c4c': 'boek.jsx',
  '54d205c2-994e-4e8f-9e24-e1e3f7b0d4cf': 'contact.jsx',
  'af4ecc99-9368-4ae9-a831-6aff797d7fd4': 'other.jsx',
};

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const cmd = process.argv[2];
const htmlFile = arg('file', 'index.html');
const srcDir = arg(cmd === 'decode' ? 'out' : 'src', 'bundle-src');

const MANIFEST_RE = /(<script type="__bundler\/manifest">)([\s\S]*?)(<\/script>)/;
const TEMPLATE_RE = /(<script type="__bundler\/template">)([\s\S]*?)(<\/script>)/;

function isText(mime) {
  return /javascript|jsx/.test(mime || '');
}

function readParts(file) {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(MANIFEST_RE);
  const t = html.match(TEMPLATE_RE);
  if (!m || !t) throw new Error('manifest of template script niet gevonden in ' + file);
  return { html, manifest: JSON.parse(m[2]), template: JSON.parse(t[2]) };
}

if (cmd === 'decode') {
  const { manifest, template } = readParts(htmlFile);
  fs.mkdirSync(srcDir, { recursive: true });
  const meta = {};
  for (const [uuid, entry] of Object.entries(manifest)) {
    if (!isText(entry.mime)) continue;
    const name = NAMES[uuid] || uuid + '.js';
    let bytes = Buffer.from(entry.data, 'base64');
    if (entry.compressed) bytes = zlib.gunzipSync(bytes);
    fs.writeFileSync(path.join(srcDir, name), bytes);
    meta[name] = { uuid, compressed: !!entry.compressed, mime: entry.mime };
  }
  if (typeof template !== 'string') throw new Error('template is geen string — formaat gewijzigd?');
  fs.writeFileSync(path.join(srcDir, 'template.html'), template);
  fs.writeFileSync(path.join(srcDir, 'meta.json'), JSON.stringify(meta, null, 2));
  console.log('decoded ' + Object.keys(meta).length + ' tekst-assets + template.html → ' + srcDir + '/');
} else if (cmd === 'encode') {
  const { html, manifest } = readParts(htmlFile);
  const meta = JSON.parse(fs.readFileSync(path.join(srcDir, 'meta.json'), 'utf8'));
  for (const [name, info] of Object.entries(meta)) {
    let bytes = fs.readFileSync(path.join(srcDir, name));
    if (info.compressed) bytes = zlib.gzipSync(bytes, { level: 9 });
    manifest[info.uuid].data = bytes.toString('base64');
  }
  const template = fs.readFileSync(path.join(srcDir, 'template.html'), 'utf8');
  // "</script>" binnen JSON-strings escapen als "<\/script>" (geldige JSON),
  // anders sluit de browser de script-tag te vroeg — het origineel doet dit ook.
  const safe = (s) => s.replace(/<\//g, '<\\/');
  let out = html.replace(MANIFEST_RE, (_, a, __, c) => a + safe(JSON.stringify(manifest)) + c);
  out = out.replace(TEMPLATE_RE, (_, a, __, c) => a + safe(JSON.stringify(template)) + c);
  fs.writeFileSync(htmlFile, out);
  console.log('encoded ' + Object.keys(meta).length + ' assets + template → ' + htmlFile);
} else {
  console.error('gebruik: node tools/tib-bundle.mjs decode|encode [--file index.html] [--out|--src bundle-src]');
  process.exit(1);
}
