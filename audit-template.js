// Auditoria rapida: URLs absolutas problemáticas no template.
const fs = require('fs');
const s = fs.readFileSync('lib/template.ts', 'utf8');

const refs = s.match(/https?:\/\/clubeinfinity\.com\.br\/[^"')\s]+/g) || [];
const unique = [...new Set(refs)];
console.log('clubeinfinity.com.br refs:', refs.length, '/ unique:', unique.length);
unique.slice(0, 30).forEach(u => console.log(' ', u));

console.log('---');
const ex = s.match(/https?:\/\/(?!clubeinfinity)[^/\s"']+\/[^"')\s]+\.(png|jpg|jpeg|svg|webp|gif|ico)/gi) || [];
console.log('outras URLs externas de img:', ex.length);
[...new Set(ex)].slice(0, 20).forEach(u => console.log(' ', u));
