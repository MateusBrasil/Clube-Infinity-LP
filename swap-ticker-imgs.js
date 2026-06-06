// Substitui os srcs dos 2 tickers da seção #modulos pelas imagens novas.
// Forward (cima): 18 slots = (9 imgs) × 2 cópias pro loop seamless. Usamos 4
// imagens novas distribuídas: A,B,C,D,A,B,C,D,A em cada cópia.
// Reverse (baixo): 12 slots = (6 imgs) × 2. Usamos 4 imagens novas:
// E,F,G,H,E,F em cada cópia.
// Rode toda vez que o template for re-extraído (`node extract-template.js`).
const fs = require('fs');
const path = 'lib/template.ts';
let s = fs.readFileSync(path, 'utf8');

const TOP = ['claude-code', 'codigo-extincao', 'automacoes-n8n', 'abc-ia']
  .map((n) => `/modulos/${n}.png`);
const BOTTOM = ['jornada-10x', 'ferramentas-ia', 'vibe-code', 'gpts-personalizados']
  .map((n) => `/modulos/${n}.png`);

// Localiza a seção
const start = s.indexOf('id="modulos"');
if (start < 0) throw new Error('seção #modulos não encontrada');
const end = s.indexOf('</section>', start) + '</section>'.length;
let sec = s.slice(start, end);

// Substitui dentro de cada bloco ticker-inner.
function replaceTicker(blockSrc, cycle) {
  let i = 0;
  return blockSrc.replace(
    /(<img\s+)src="[^"]+"/g,
    (_, prefix) => `${prefix}src="${cycle[i++ % cycle.length]}"`
  );
}

sec = sec.replace(
  /(<div[^>]*class="ticker-inner ticker-forward[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/,
  (_, open, inner, close) => open + replaceTicker(inner, TOP) + close
);
sec = sec.replace(
  /(<div[^>]*class="ticker-inner ticker-reverse[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/,
  (_, open, inner, close) => open + replaceTicker(inner, BOTTOM) + close
);

s = s.slice(0, start) + sec + s.slice(end);
fs.writeFileSync(path, s, 'utf8');

// Sanity
const topRefs = (s.match(/\/modulos\/(claude-code|codigo-extincao|automacoes-n8n|abc-ia)\.png/g) || []).length;
const botRefs = (s.match(/\/modulos\/(jornada-10x|ferramentas-ia|vibe-code|gpts-personalizados)\.png/g) || []).length;
const leftOver = (s.match(/<img[^>]*class="ticker-img"[^>]*src="https:\/\/x0\.at/g) || []).length;
console.log('refs top:', topRefs, '/ esperado 18');
console.log('refs bottom:', botRefs, '/ esperado 12');
console.log('ticker-img ainda apontando pra x0.at (deve ser 0):', leftOver);
