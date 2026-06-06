// Patches mínimos pós extract — re-aplicar sempre que `node extract-template.js` rodar.
// NÃO mexe em botões/cores/animações: a única troca azul→laranja é via CSS var --accent
// (já feita no globals.css e no extract via migração de hex).
//
// Faz só:
//  1) Swap do brand mark no nav (white circle + "Clube Infinity" → SVG + CLUBE INFINITY)
//  2) Hero image (alt="Prévia das entregas") → /capa-modulo.png
//  3) Footer text-neutral-900 / bg-neutral-900 → text-foreground / bg-foreground
//     (assim o footer adapta ao tema)
//
// Rodar: node post-extract-patches.js
const fs = require('fs');
const path = 'lib/template.ts';
let s = fs.readFileSync(path, 'utf8');

// ===== 1) Brand mark no nav =====
const symbolSvg =
  '<svg viewBox="0 0 160 160" class="w-7 h-7 shrink-0 text-foreground" aria-hidden="true">' +
  '<polygon points="80,14 124.7,111 35.3,111" fill="none" stroke="#E65100" stroke-width="3" stroke-linejoin="round"/>' +
  '<g transform="translate(80,80)">' +
  '<ellipse cx="0" cy="-28" rx="17" ry="37" fill="none" stroke="currentColor" stroke-width="3"/>' +
  '<ellipse cx="0" cy="-28" rx="17" ry="37" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(120)"/>' +
  '<ellipse cx="0" cy="-28" rx="17" ry="37" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(240)"/>' +
  '</g>' +
  '<circle cx="80" cy="80" r="6" fill="#E65100"/>' +
  '</svg>';
const wordmarkBlock =
  symbolSvg +
  '</span><span data-brand-wordmark class="text-base text-foreground leading-0 max-[1200px]:hidden">CLUBE</span>' +
  '<span data-brand-wordmark class="text-base text-foreground leading-0 max-[1200px]:hidden max-[850px]:inline" style="margin-left:10px">INFINITY';
const navMarkBefore =
  '<div class="w-6 h-6 rounded-full bg-foreground"></div><span class="text-lg font-semibold text-foreground leading-0 max-[1200px]:hidden max-[850px]:inline">Clube Infinity';
const navMarkAfter = '<span class="flex items-center gap-2">' + wordmarkBlock;
const navSwaps = s.split(navMarkBefore).length - 1;
s = s.split(navMarkBefore).join(navMarkAfter);

// ===== 2) Hero image =====
const heroSwaps =
  (s.match(/(<img[^>]*alt="Prévia das entregas"[^>]*src=")[^"]+(")/g) || []).length;
s = s.replace(
  /(<img[^>]*alt="Prévia das entregas"[^>]*src=")[^"]+(")/g,
  '$1/capa-modulo.png$2'
);
s = s.replace(
  /(<img[^>]*src=")[^"]+("[^>]*alt="Prévia das entregas")/g,
  '$1/capa-modulo.png$2'
);

// ===== 2b) Timeline track preto → laranja (#como-funciona) =====
// A linha vertical de progresso usa bg-black/10 no Auryon. Troca pra bg-accent/30
// pra a track ficar laranja sutil (e o fill bg-accent já é laranja sólido).
const timelineTrackBefore = (s.match(/h-\[calc\(100%-6rem\)\] w-0\.5 -translate-x-1\/2 bg-black\/10/g) || []).length;
s = s.replace(
  /h-\[calc\(100%-6rem\)\] w-0\.5 -translate-x-1\/2 bg-black\/10/g,
  'h-[calc(100%-6rem)] w-0.5 -translate-x-1/2 bg-accent/30'
);

// ===== 2c) Caixa da setinha (Quero começar / Quero destravar) bg-accent =====
// O Auryon não dava bg-accent na caixa da seta (ficava transparente, mostrava
// o bg-accent atrás). Mas o backdrop só cobre 100%-1.5rem, então sobra um
// "vazio" no rightmost 1.5rem onde a caixa fica sem bg. Adicionamos bg-accent
// na caixa pra ser sempre laranja sólido.
const arrowBoxBefore = [
  ['relative -left-px z-10 w-10 h-10 rounded-xl flex items-center justify-center text-black',
   'relative -left-px z-10 w-10 h-10 rounded-xl flex items-center justify-center text-black bg-accent'],
  ['relative -left-px z-10 flex h-11 w-11 items-center justify-center rounded-xl text-black',
   'relative -left-px z-10 flex h-11 w-11 items-center justify-center rounded-xl text-black bg-accent'],
];
let arrowBoxCount = 0;
for (const [from, to] of arrowBoxBefore) {
  const n = s.split(from).length - 1;
  s = s.split(from).join(to);
  arrowBoxCount += n;
}

// ===== 2d) Pricing card — €97 / 3x €32,33, link Stripe, 7 benefícios =====
{
  const checkSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ' +
    'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" ' +
    'stroke-linejoin="round" class="lucide lucide-check h-4 w-4 shrink-0 text-accent">' +
    '<path d="M20 6 9 17l-5-5"></path></svg>';
  const benefits = [
    'Acesso à Plataforma Infinity',
    'Comunidade Exclusiva de Founders',
    'Lives Semanais com Especialistas',
    'Conteúdos Novos Toda Semana',
    'Materiais e Templates Exclusivos',
    'Networking com Empreendedores',
    'Suporte Direto da Comunidade',
  ];
  const items = benefits.map(b =>
    '<li class="flex items-center gap-3">' + checkSvg +
    '<span class="text-sm text-foreground">' + b + '</span></li>'
  ).join('');

  // Preço
  s = s.replace(/R\$ <!-- -->197/g, '€97,00');
  s = s.replace(/12x de R\$ <!-- -->19,70/g, '3x €32,33');
  // CTA Stripe
  s = s.split(
    'https://pay.cakto.com.br/3bhqma6_888049?utm_source=organic&amp;utm_campaign=&amp;utm_medium=&amp;utm_content=&amp;utm_term='
  ).join('https://buy.stripe.com/5kQeVcfTXeFeen5cny9R60r');
  // Lista de benefícios
  const ulStart = 'Você recebe:</p><ul class="mt-4 space-y-3">';
  const ulEnd = '</ul>';
  const start = s.indexOf(ulStart);
  if (start >= 0) {
    const afterStart = start + ulStart.length;
    const end = s.indexOf(ulEnd, afterStart);
    if (end >= 0) {
      s = s.slice(0, afterStart) + items + s.slice(end);
    }
  }
}

// ===== 2e-pre) Discord card → imagem Circle custom =====
// Substitui o card Discord (Building The Next Big Thing) pela imagem
// oficial do grupo Circle do Clube Infinity.
{
  const startTag =
    '<div style="opacity: 1; transform: none;"><div class="rounded-2xl overflow-hidden bg-[#36393f]';
  const start = s.indexOf(startTag);
  if (start >= 0) {
    const btn = s.indexOf('Aceitar convite', start);
    if (btn >= 0) {
      const close = s.indexOf('</div></div></div>', btn) + 18;
      const newCard =
        '<div style="opacity: 1; transform: none;">' +
        '<a href="https://infinitybrclubeinfinity.circle.so/c/comunidade-infinity/" target="_blank" rel="noreferrer" ' +
        'class="block h-full overflow-hidden rounded-2xl shadow-xl shadow-black/30 hover:scale-[1.02] transition-transform">' +
        '<img src="/grupo-circle-comunidade.png" alt="Comunidade Circle Clube Infinity" ' +
        'class="w-full h-full object-cover" loading="lazy" decoding="async">' +
        '</a></div>';
      s = s.slice(0, start) + newCard + s.slice(close);
    }
  }
}

// ===== 2e) WhatsApp card → imagem custom =====
// Substitui o card WhatsApp inteiro do template Auryon (Building The Next Big
// Thing, 248 participantes) pela imagem do Clube Infinity em public/.
{
  const startTag =
    '<div style="opacity: 1; transform: none;"><div class="overflow-hidden rounded-2xl border border-[#d9e0e7] bg-[#f0f2f5]';
  const start = s.indexOf(startTag);
  if (start >= 0) {
    const btn = s.indexOf('Entrar na conversa</button>', start);
    if (btn >= 0) {
      const close = s.indexOf('</div></div></div>', btn) + 18;
      const newCard =
        '<div style="opacity: 1; transform: none;">' +
        '<a href="https://chat.whatsapp.com/" target="_blank" rel="noreferrer" ' +
        'class="block h-full overflow-hidden rounded-2xl shadow-xl shadow-black/30 hover:scale-[1.02] transition-transform">' +
        '<img src="/grupo-wpp-comunidade.png" alt="Grupo WhatsApp Clube Infinity" ' +
        'class="w-full h-full object-cover" loading="lazy" decoding="async">' +
        '</a></div>';
      s = s.slice(0, start) + newCard + s.slice(close);
    }
  }
}

// ===== 3) Footer theme-adaptive =====
const footStart = s.indexOf('<footer');
const footEnd = s.indexOf('</footer>', footStart) + '</footer>'.length;
let foot = s.slice(footStart, footEnd);
const footRefsBefore = (foot.match(/neutral-900/g) || []).length;
foot = foot
  .replace(/text-neutral-900\/50/g, 'text-foreground/50')
  .replace(/text-neutral-900\/70/g, 'text-foreground/70')
  .replace(/text-neutral-900/g, 'text-foreground')
  .replace(/bg-neutral-900/g, 'bg-foreground');
const footRefsAfter = (foot.match(/neutral-900/g) || []).length;
s = s.slice(0, footStart) + foot + s.slice(footEnd);

// ===== 4) Azul → laranja (paleta Clube Infinity) =====
// O template Auryon usa RGBs azuis em gradientes (hero, footer, card Codex,
// chip de checkout). Aqui re-pinta cada triplet azul pra pessego/laranja Clube,
// nos 3 formatos em que aparece no arquivo:
//   - HTML class inline:   "76,114,234"
//   - Valor CSS computado: "76, 114, 234"
//   - Seletor Tailwind:    "76\\,114\\,234" (2 backslashes literal pra escape)
const colorSwaps = [
  [[76, 114, 234],  [230, 81, 0]],
  [[120, 177, 232], [255, 160, 100]],
  [[124, 179, 232], [255, 160, 100]],
  [[183, 214, 245], [255, 205, 165]],
  [[214, 234, 255], [255, 225, 200]],
  [[216, 236, 255], [255, 225, 200]],
  [[244, 250, 255], [255, 247, 240]],
  [[247, 251, 255], [255, 247, 240]],
];
let colorSwapCount = 0;
for (const [[br, bg, bb], [or_, og, ob]] of colorSwaps) {
  const variants = [
    [`${br},${bg},${bb}`,       `${or_},${og},${ob}`],
    [`${br}, ${bg}, ${bb}`,     `${or_}, ${og}, ${ob}`],
    [`${br}\\\\,${bg}\\\\,${bb}`, `${or_}\\\\,${og}\\\\,${ob}`],
  ];
  for (const [from, to] of variants) {
    const before = s.length;
    const parts = s.split(from);
    if (parts.length > 1) {
      colorSwapCount += parts.length - 1;
      s = parts.join(to);
    }
  }
}

// ===== 5) Hero BG: troca BG-new.png cinza por gradiente CSS premium =====
// A BG-new.png renderiza cinza chapado e briga com texto preto do hero
// (section tem color-scheme:light). Substitui por gradiente em camadas:
// spotlight quente no topo + glow laranja Clube no rodape + 2 soft lights
// laterais + base cream com fade pra pessego.
const heroBgOld = 'background-image: url(&quot;/BG-new.png&quot;); transform: none;';
const heroBgNew =
  'background-image: ' +
  'radial-gradient(ellipse 60% 45% at 50% 0%, rgba(255, 209, 168, 0.55), transparent 65%), ' +
  'radial-gradient(ellipse 90% 60% at 50% 115%, rgba(230, 81, 0, 0.28), transparent 70%), ' +
  'radial-gradient(circle at 18% 28%, rgba(255, 255, 255, 0.6), transparent 45%), ' +
  'radial-gradient(circle at 82% 32%, rgba(255, 235, 215, 0.5), transparent 45%), ' +
  'linear-gradient(180deg, #FAF6F1 0%, #F5EFE7 50%, #ECD9C2 100%); ' +
  'transform: none;';
const heroBgSwaps = s.split(heroBgOld).length - 1;
s = s.split(heroBgOld).join(heroBgNew);

fs.writeFileSync(path, s, 'utf8');
console.log('nav brand mark swaps:', navSwaps);
console.log('hero image swaps:', heroSwaps);
console.log('timeline track bg-accent/30:', timelineTrackBefore);
console.log('arrow boxes bg-accent:', arrowBoxCount);
console.log('footer neutral-900 antes:', footRefsBefore, '/ depois:', footRefsAfter);
console.log('color azul→laranja swaps:', colorSwapCount);
console.log('hero BG premium swaps:', heroBgSwaps);
