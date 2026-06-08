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
  s = s.replace(/R\$ <!-- -->197/g, '€297,00');
  s = s.replace(/€97,00/g, '€297,00');
  s = s.replace(/12x de R\$ <!-- -->19,70/g, '3x €99,00');
  s = s.replace(/3x €32,33/g, '3x €99,00');
  // CTA Stripe
  const stripeUrlNew = 'https://buy.stripe.com/7sY8wOcHL68I7YH1IU9R60v';
  s = s.split(
    'https://pay.cakto.com.br/3bhqma6_888049?utm_source=organic&amp;utm_campaign=&amp;utm_medium=&amp;utm_content=&amp;utm_term='
  ).join(stripeUrlNew);
  s = s.split('https://buy.stripe.com/5kQeVcfTXeFeen5cny9R60r').join(stripeUrlNew);
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

// ===== 2f) Footer brand mark — triquetra + CLUBE INFINITY =====
{
  const old =
    '<div class="w-8 h-8 rounded-full bg-foreground"></div><span class="text-xl font-semibold text-foreground leading-0">Clube Infinity</span>';
  const sym =
    '<svg viewBox="0 0 160 160" class="w-8 h-8 shrink-0 text-foreground" aria-hidden="true">' +
    '<polygon points="80,14 124.7,111 35.3,111" fill="none" stroke="#E65100" stroke-width="3" stroke-linejoin="round"/>' +
    '<g transform="translate(80,80)">' +
    '<ellipse cx="0" cy="-28" rx="17" ry="37" fill="none" stroke="currentColor" stroke-width="3"/>' +
    '<ellipse cx="0" cy="-28" rx="17" ry="37" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(120)"/>' +
    '<ellipse cx="0" cy="-28" rx="17" ry="37" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(240)"/>' +
    '</g>' +
    '<circle cx="80" cy="80" r="6" fill="#E65100"/>' +
    '</svg>';
  const next = sym +
    '<span data-brand-wordmark class="text-base text-foreground leading-0">CLUBE</span>' +
    '<span data-brand-wordmark class="text-base text-foreground leading-0" style="margin-left:10px">INFINITY</span>';
  s = s.split(old).join(next);
}

// ===== 2g) Bônus card — Codex → InfiZap (CRM + ERP omnichannel) =====
{
  const swaps = [
    [
      'Todo comprador ganha 1 mês de Codex no ChatGPT Plus, pago por mim.',
      'Todo comprador ganha 7 dias grátis na InfiZap, a plataforma de atendimento com IA.',
    ],
    [
      'O ChatGPT Plus sozinho custa <span class="font-medium text-foreground">US$20</span>, quase o valor do curso inteiro. Eu pago esse mês pra você porque aposto de verdade no seu aprendizado. Dinheiro real e comprado na sua frente.',
      'InfiZap é o CRM + ERP omnichannel com agentes de IA pra <span class="font-medium text-foreground">WhatsApp, Instagram e Facebook</span>. Mais vendas, operação organizada e seus números claros. Você entra com o time pronto pra escalar — eu pago a primeira semana.',
    ],
    [
      '<img alt="Codex" loading="lazy" width="52" height="52" decoding="async" class="h-[52px] w-[52px] rounded-[1.1rem]" style="color:transparent" src="https://x0.at/76jH.svg">',
      '<img src="/brand/infizap.png" alt="InfiZap" loading="lazy" decoding="async" width="52" height="52" class="h-[52px] w-[52px] rounded-[1.1rem] object-cover">',
    ],
    ['Codex + ChatGPT Plus', 'InfiZap — 7 dias grátis'],
    [
      '1 mês de <span class="text-foreground font-medium">ChatGPT Plus</span>, US$20 pago por mim',
      'InfiZap completo por <span class="text-foreground font-medium">7 dias</span>, pago por mim',
    ],
    [
      'Acesso ao <span class="text-foreground font-medium">Codex</span> incluso no plano',
      'Agentes de IA pra <span class="text-foreground font-medium">WhatsApp, Instagram e Facebook</span>',
    ],
    [
      'Garantido para <span class="text-foreground font-medium">todos os compradores</span>',
      'CRM + ERP unificado, com <span class="text-foreground font-medium">números claros</span>',
    ],
    [
      // Callout: laranja sólido, sem opacidade no texto (sem efeito branco/glow)
      '<div class="mt-6 rounded-xl border border-accent/20 bg-accent/8 px-4 py-3"><p class="text-xs text-muted-foreground"><span class="font-semibold text-foreground">O Plus custa quase o valor do curso.</span> <!-- -->E eu dou de brinde. Tire suas próprias conclusões.</p></div>',
      '<div class="mt-6 rounded-xl bg-accent px-4 py-3"><p class="text-xs text-white"><span class="font-semibold">Meta Business Partner certificada.</span> Operação profissional no seu colo desde o dia 1.</p></div>',
    ],
  ];
  for (const [from, to] of swaps) s = s.split(from).join(to);
}

// ===== 2h) Footer panel — bg-accent (laranja sólido) → bg-card + glow =====
// O painel inferior dos links era um bloco laranja chapado gigante (pt-96 = 384px).
// Trocamos por bg-card (theme-adaptive: branco em light, escuro em dark) com
// borda + glow laranja sutil no topo pra manter brand sem virar muro de cor.
{
  const old =
    '<div class="bg-accent rounded-tr-[3rem] rounded-tl-[3rem] pt-96 pb-16 max-[850px]:pt-72">';
  // pt-[30rem] = 480px desktop, 384px mobile — espaço pro CTA card flutuante
  // não grudar nos links/copyright.
  // pt-[42rem] = 672px desktop: cobre os 160px do top-[10rem] + altura do card
  //               (~480px) + buffer pros links não sobrepor. Mobile proporcional.
  const next =
    '<div class="bg-card rounded-tr-[3rem] rounded-tl-[3rem] pt-[42rem] pb-16 max-[850px]:pt-[34rem] border-t-2 border-accent/40 shadow-[0_-20px_60px_-30px_rgba(230,81,0,0.25)]">';
  s = s.split(old).join(next);
}

// ===== 2k) (form padding mantido em p-1.5 — botão tem mr-1 em 2j pra inset visual) =====

// ===== 2j) Botão "Quero receber acesso" — alinha com a forma =====
// rounded-lg (8px) não bate com a forma rounded-xl (12px) + p-1.5 (6px),
// que pede rounded de ~6px (rounded-md) ou levemente maior pra match visual.
// rounded-[10px] = curva sutilmente menor que a forma, encaixe visual limpo.
// px-4 em vez de px-5 + shrink-0 evita o botão "esticar" e empurrar o input.
s = s.split(
  'flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-lg text-sm font-medium transition-colors whitespace-nowrap max-[850px]:w-full max-[850px]:py-3'
).join(
  'flex items-center justify-center gap-2 px-4 py-2.5 mr-1 bg-foreground hover:bg-foreground/90 text-background rounded-[10px] text-sm font-medium transition-colors whitespace-nowrap shrink-0 max-[850px]:w-full max-[850px]:py-3 max-[850px]:mr-0'
);

// ===== 2i) CTA card (Você já sentiu) — desce pra dentro do painel =====
// top-0 fazia o card flutuar acima da borda laranja do painel. top-[10rem]
// põe ele 160px abaixo, dentro do painel, com a borda visível por cima.
s = s.split('absolute left-1/2 -translate-x-1/2 top-0 w-full max-w-5xl')
     .join('absolute left-1/2 -translate-x-1/2 top-[10rem] max-[850px]:top-[7rem] w-full max-w-5xl');

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

// ===== 6) Footer CTA card — troca BG.jpg prateado por composicao laranja premium =====
// A "caixa prateada" no rodape (Voce ja sentiu que tem potencial...) usava
// BG.jpg com filter:hue-rotate(88deg) saturate(0.42) — desbotava qualquer
// cor pra um cinza-bronze metalico. Substitui o background-image inteiro
// por gradiente em camadas: base diagonal cream -> laranja Clube -> burnt,
// spotlight cream no topo, glow Clube profundo no rodape, 2 soft lights
// laterais. Remove tambem o filter e ajusta opacidade.
const footerCtaBgOld =
  'background-image:url(/BG.jpg);background-size:140%;' +
  'filter:hue-rotate(88deg) saturate(0.42) brightness(1.42) contrast(0.82);' +
  'opacity:0.95';
const footerCtaBgNew =
  'background-image:' +
  'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(255, 240, 220, 0.65), transparent 65%),' +
  'radial-gradient(ellipse 90% 65% at 50% 110%, rgba(180, 60, 0, 0.55), transparent 70%),' +
  'radial-gradient(circle at 18% 30%, rgba(255, 215, 170, 0.40), transparent 42%),' +
  'radial-gradient(circle at 82% 32%, rgba(255, 195, 145, 0.40), transparent 42%),' +
  'linear-gradient(135deg, #FFD2A0 0%, #FFA15A 30%, #E65100 70%, #8B2E00 100%);' +
  'opacity:1';
const footerCtaBgSwaps = s.split(footerCtaBgOld).length - 1;
s = s.split(footerCtaBgOld).join(footerCtaBgNew);

// ===== 6b) Pills da secao InfiZap — contorno laranja pra destacar =====
// O pill "Bonus para todos" (topo da secao) e o pill "Clube Infinity ·
// Criador do 1337" (rodape do texto) usavam border-border (cinza sutil),
// quase invisivel no bg escuro. Troca pra border-accent (laranja Clube
// solido) pra destacar a secao. No pill 1 troca tambem texto pra
// text-accent (uppercase laranja sobre bg escuro = look premium).
let sectionPillsCount = 0;
const sectionPills = [
  ['inline-flex items-center rounded-full border border-border bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground',
   'inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent'],
  ['mt-7 inline-flex items-center gap-3 rounded-2xl border border-border bg-frame px-5 py-4',
   'mt-7 inline-flex items-center gap-3 rounded-2xl border border-accent bg-frame px-5 py-4'],
];
for (const [from, to] of sectionPills) {
  const n = s.split(from).length - 1;
  if (n) {
    s = s.split(from).join(to);
    sectionPillsCount += n;
  }
}

// ===== 6b-2) Pill InfiZap — troca "Criador do 1337" por copy melhor =====
// "Criador do 1337" e jargao que so quem conhece o universo hacker reconhece
// — mas a secao InfiZap fala sobre "eu pago a primeira semana", entao a
// assinatura ali devia reforcar essa garantia, nao referenciar outro projeto.
s = s.split('>Criador do 1337<').join('>Garantia direta<');

// ===== 6b-3) Secao Comunidade — Discord -> Circle =====
// Ja substituimos o card Discord pelo card Circle (patch 2e-pre), mas o
// texto descritivo da secao continuava dizendo "Discord e WhatsApp".
// Atualiza pra refletir o que a comunidade realmente usa.
s = s.split('Discord e WhatsApp').join('Circle e WhatsApp');

// ===== 6c) Marquees de ferramentas — 10 ferramentas curadas Clube Infinity =====
// As 3 marquees (#metodo, secao "Ferramentas necessarias") vinham do template
// Auryon cheias de logos genericos (Antigravity, Stripe, Sentry, Redis...).
// Substituimos pelo set curado que e ensinado no Clube Infinity: AI assistants,
// AI coding/app builders, automacao, deploy e framework.
// Idempotente: cada execucao substitui o conteudo entre <div class="...marquee-N">
// e o primeiro </div> seguinte pelo mesmo HTML — convergente.
{
  const tools = [
    // URLs validadas (HEAD 200) em multiplas fontes — cada brand serve
    // a SVG transparente. Mistura porque nenhuma fonte unica cobre tudo:
    //   - cdn.simpleicons.org: tem cursor, n8n, perplexity, vercel, supabase
    //     mas NAO tem 'chatgpt' nem 'openai' (404)
    //   - lobehub/lobe-icons via jsdelivr: tem Claude (cor + mono), Codex
    //     oficial, e diferencia claude-color (Claude) de claude (Claude Code)
    //   - svgl: cobre Lovable que nao esta em outras fontes
    //   - Wikipedia commons: unica fonte estavel pra logo oficial do ChatGPT
    { name: 'Claude',      src: 'https://cdn.jsdelivr.net/gh/lobehub/lobe-icons@master/packages/static-svg/icons/claude-color.svg' },
    { name: 'ChatGPT',     src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg' },
    { name: 'Cursor',      src: 'https://cdn.simpleicons.org/cursor' },
    { name: 'n8n',         src: 'https://cdn.simpleicons.org/n8n' },
    { name: 'Lovable',     src: 'https://svgl.app/library/lovable.svg' },
    { name: 'Claude Code', src: '/brand-logos/claudecode-color.svg' },
    { name: 'Perplexity',  src: 'https://cdn.simpleicons.org/perplexity' },
    { name: 'Vercel',      src: 'https://cdn.simpleicons.org/vercel' },
    { name: 'Supabase',    src: 'https://cdn.simpleicons.org/supabase' },
    { name: 'Codex',       src: '/brand-logos/codex-color.svg' },
  ];
  const renderItem = (t) =>
    '<span aria-label="' + t.name + '" title="' + t.name + '" class="jsx-424d2fc9e9041c90 tech-button">' +
    '<span class="jsx-424d2fc9e9041c90 tech-logo">' +
    '<img src="' + t.src + '" alt="' + t.name + '" draggable="false" class="jsx-424d2fc9e9041c90">' +
    '</span></span>';
  const rotate = (arr, n) => arr.slice(n).concat(arr.slice(0, n));
  // Cada marquee comeca em uma rotacao diferente pra nao ficar 3 marquees
  // alinhadas exibindo o mesmo logo na mesma coluna em um dado instante.
  const orders = [tools, rotate(tools, 3), rotate(tools, 7)];
  let marqueeSwaps = 0;
  for (let i = 0; i < 3; i++) {
    const marqueeClass = 'tech-basic-marquee tech-basic-marquee-' + (i + 1);
    const openTagFragment = 'class="jsx-424d2fc9e9041c90 ' + marqueeClass + '"';
    // Comeca a busca depois de 1.000.000 chars (depois das regras CSS pre-compiladas)
    const openIdx = s.indexOf(openTagFragment, 1000000);
    if (openIdx >= 0) {
      const tagEnd = s.indexOf('>', openIdx) + 1;
      const closeIdx = s.indexOf('</div>', tagEnd);
      if (closeIdx >= 0 && closeIdx > tagEnd) {
        // 3 cópias pro loop suave (igual ao template original que duplicava 3x)
        const items = orders[i].map(renderItem).join('');
        const newContent = items + items + items;
        s = s.slice(0, tagEnd) + newContent + s.slice(closeIdx);
        marqueeSwaps++;
      }
    }
  }
  console.log('tools marquees substituidas:', marqueeSwaps);
}

// ===== 7) Card InfiZap — remove a borda/glow branco no rodape do card =====
// O gradient do card (2g) terminava em rgba(255,255,255,0.96) — branco quase
// opaco que no dark mode aparece como uma faixa clara/borda branca embaixo,
// chocando com o fundo escuro da pagina. Troca pra rgba(230,81,0,0) (laranja
// totalmente transparente) pra o card fade naturalmente no fundo.
// Aplica nos 3 formatos (HTML class, valor CSS, seletor Tailwind escapado).
const infizapBorderSwaps = [
  // HTML inline (sem espacos)
  ['rgba(230,81,0,0.05)_50%,rgba(255,255,255,0.96)_100%',
   'rgba(230,81,0,0.05)_50%,rgba(230,81,0,0)_100%'],
  // Valor CSS (com espacos)
  ['rgba(230, 81, 0, 0.05) 50%, rgba(255, 255, 255, 0.96)',
   'rgba(230, 81, 0, 0.05) 50%, rgba(230, 81, 0, 0)'],
  // Seletor Tailwind (2 backslashes literais -> \\\\ no JS source)
  ['rgba\\\\(230\\\\,81\\\\,0\\\\,0\\\\.05\\\\)_50\\\\%\\\\,rgba\\\\(255\\\\,255\\\\,255\\\\,0\\\\.96\\\\)_100\\\\%',
   'rgba\\\\(230\\\\,81\\\\,0\\\\,0\\\\.05\\\\)_50\\\\%\\\\,rgba\\\\(230\\\\,81\\\\,0\\\\,0\\\\)_100\\\\%'],
];
let infizapBorderCount = 0;
for (const [from, to] of infizapBorderSwaps) {
  const n = s.split(from).length - 1;
  if (n) {
    s = s.split(from).join(to);
    infizapBorderCount += n;
  }
}

// ===== 8) Nova Copy Clube Infinity v3.0 (Esquadrão Finch + Hormozi) =====
// Substitui a copy Auryon original pela copy oficial v3 (Nova Copy Clube
// Infinity - Pagina de Vendas.md). So toca em textos dentro da estrutura
// HTML existente — secoes novas (Autoridade Fred, Pra Quem É, Encontros
// ao Vivo, Garantia, tabela de ancoragem do pricing) precisam de HTML
// novo e nao foram aplicadas aqui.
let copyV3Count = 0;
const copyV3 = [
  // --- Hero pill (eyebrow) ---
  ['>Inscrições abertas<', '>Inteligência artificial na prática<'],
  // --- Hero H1 (renderizada em 2 spans de bloco) ---
  ['A habilidade mais lucrativa da próxima década não será',
   'Pare de alugar software caro.'],
  ['programar. Será construir.',
   'Aprenda a construir o seu com IA, sem virar técnico.'],
  // --- Hero subhead ---
  ['Uma nova geração de construtores está surgindo. Pessoas que transformam ideias em produtos na mesma velocidade em que pensam, utilizando IA.',
   'O Clube Infinity é a comunidade onde empresário aprende a usar IA pra resolver coisa de verdade do dia a dia: criar o próprio CRM, automatizar o WhatsApp, montar o site do negócio, gerar post pras redes e tirar a tarefa repetitiva das costas. Em linguagem que você entende, com um foco só: transformar IA em dinheiro no seu bolso.'],
  // --- Hero CTA ---
  ['>Quero destravar agora<', '>Quero entrar no Clube Infinity<'],

  // --- Metodo cards (4 cards) ---
  ['Ferramentas necessárias, sem te afogar em inutilidade.',
   'Ferramentas certas, não coleção de nome.'],
  ['As tecnologias certas, no contexto certo, para voce aprender com repertorio real em vez de colecionar nome de ferramenta.',
   'Você aprende a usar IA pra puxar 3 alavancas: economizar, automatizar e vender. Sem novidade chique que não vira resultado.'],
  ['Um preco acessivel que faz parecer mentira.',
   'Pare de alugar software caro. Construa o seu.'],
  ['>Comunidade que<', '>Empresário<'],
  ['>constrói junto<', '>construindo junto<'],
  ['Troca real, feedback honesto e menos ilusão',
   'Empresário de verdade, projeto rolando, troca direta'],
  ['Feito para você vender',
   'Feito para virar caixa'],
  ['Você constrói ativos que geram atenção, autoridade e oportunidade de caixa.',
   'Você cria ativos que geram atenção, autoridade e caixa. IA virando faturamento, não hobby.'],

  // --- Como funciona (3 passos) ---
  // Passos atuais: "1. Escolhe seu ponto de partida ... 2. ... 3. ..."
  // Já estão razoavelmente próximos da nova copy; ajuste fino:
  ['Você escolhe seu ponto de partida.',
   'Você escolhe seu ponto de partida.'],
  ['Você aplica com a comunidade te destravando.',
   'Você aplica com a comunidade te destravando.'],
  ['Você escala.', 'Você escala.'],

  // --- Comunidade ---
  // Já temos "Um lugar para trocar networking em tempo real." — manter.
  // "Discord e WhatsApp..." → "Circle e WhatsApp..." (já feito em 6b-3)

  // --- Pricing ---
  // H2 "O melhor momento para começar era ontem. O segundo melhor é agora."
  // já bate com a nova copy. Manter.
  // CTA: "Quero esse acesso" → "Quero entrar no Clube Infinity"
  ['>Quero esse acesso<', '>Quero entrar no Clube Infinity<'],
  // Lista de benefícios já foi reescrita pelo patch 2d.

  // --- FAQ ---
  ['O que você precisa saber antes de entrar',
   'O que você precisa saber antes de entrar'],
  ['Se ainda existir dúvida, é porque você está perto da decisão. Resolve isso agora.',
   'Se ainda tem dúvida, é porque você está perto da decisão. Vamos lá.'],
  // Q1 + A1
  ['Isso serve para quem ainda trava com código?',
   'Eu não sei nada de IA. Serve pra mim?'],
  ['Serve, desde que você esteja disposto a construir de verdade. A proposta aqui não é transformar você em decorador de sintaxe. É ensinar você a usar IA com lógica, critério e direção para criar entregas reais.',
   'Serve, e foi feito pensando em você. Tem trilha que começa do zero, em linguagem de empresário, sem termo técnico. Você não precisa virar programador pra começar.'],
  // Q2-Q5 (sem resposta no HTML, só pergunta)
  ['Eu preciso já ter experiência com IA?',
   'Eu já sou avançado. Não vai ser raso?'],
  ['O que eu vou conseguir construir com isso?',
   'Preciso saber programar?'],
  ['Isso é só mais conteúdo gravado?',
   'E se eu não puder assistir quarta às 17h?'],
  ['E se eu quiser ajuda no caminho?',
   'Quanto custa e tem mensalidade escondida?'],

  // --- Footer CTA ---
  ['Você já sentiu que tem potencial. Agora falta entrar e construir com método.',
   'Você já sentiu que tem potencial. Agora falta entrar e usar IA pra botar dinheiro no bolso.'],
  ['>Quero receber acesso<', '>Quero entrar no Clube Infinity<'],
];
for (const [from, to] of copyV3) {
  if (from === to) continue;
  const n = s.split(from).length - 1;
  if (n) {
    s = s.split(from).join(to);
    copyV3Count += n;
  }
}

// --- Blur paragraph (#metodo "Se você já cansou...") ---
// Estrutura: <p class="text-3xl ..."><span class="mr-2 inline-block lg:mr-3"
//   style="opacity:0.15;filter:blur(8px);transition:opacity 75ms,filter 75ms;"
// >palavra</span><span...>palavra</span>...</p>
// Reconstroi com nova copy. Idempotente: o regex casa o p inteiro, conteudo
// trocado por novos spans sempre que executar — converge.
const blurPattern = /<p class="text-3xl font-medium text-left leading-snug tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-snug">[\s\S]*?<\/p>/;
const blurNewText = 'Tem muita gente fazendo coisa bonita com IA. Pouca gente botando dinheiro no bolso. Aqui no Clube Infinity é o contrário: a gente fala de resultado, como você usa IA pra vender mais, gastar menos com ferramenta, ganhar tempo e até criar produto novo.';
const blurSpans = blurNewText.split(' ').map(w =>
  '<span class="mr-2 inline-block lg:mr-3" style="opacity: 0.15; filter: blur(8px); transition: opacity 75ms, filter 75ms;">' + w + '</span>'
).join('');
const blurReplacement = '<p class="text-3xl font-medium text-left leading-snug tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-snug">' + blurSpans + '</p>';
const blurSwap = blurPattern.test(s) ? 1 : 0;
s = s.replace(blurPattern, blurReplacement);

// ===== 9) Novas dobras Copy v3 (REDESIGN v2 — SVGs lucide, bordas accent, animações ricas) =====
// REDESIGN: zero emoji (substituidos por SVGs lucide inline), bordas
// border-accent/35 em todas as caixas, hover scale + border-color hover,
// gradient laranja onde faz sentido. Mantem padrao visual das secoes
// originais Auryon (#metodo, InfiZap, pricing) e herda .anim-init via
// IntersectionObserver pelo wrapper style="opacity:1;transform:none".

// --- Cleanup: remove sections v3 antigas (re-injetar com novo design) ---
// Remove <section data-copy-v3="..."> e o <div data-copy-v3="ancoragem-value-stack">
// legacy de versoes anteriores.
s = s.replace(/<section[^>]*data-copy-v3="[^"]*"[^>]*>[\s\S]*?<\/section>/g, '');
{
  const legacy = '<div data-copy-v3="ancoragem-value-stack"';
  const ia = s.indexOf(legacy);
  if (ia >= 0) {
    const eMark = 'Uma vez. Pra sempre.</span></p></div>';
    const ib = s.indexOf(eMark, ia);
    if (ib >= 0) s = s.slice(0, ia) + s.slice(ib + eMark.length);
  }
}

const newSections = {};

// --- Helper: injeta HTML antes do anchor (idempotente — cleanup ja removeu) ---
function injectBefore(anchor, html, key) {
  const i = s.indexOf(anchor);
  if (i < 0) { newSections[key] = 'NO ANCHOR'; return; }
  s = s.slice(0, i) + html + s.slice(i);
  newSections[key] = 'OK';
}

// --- SVG lucide-style helper (currentColor + stroke padrão) ---
const svgIcon = (paths, size) =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';

const I = {
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  dollar: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  replay: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  star: '<polygon fill="currentColor" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  map: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>',
  fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>',
  trendDown: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  trendUp: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
  userCircle: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  graduation: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
};

// Renderiza icon: chave de I[] (lucide SVG) OU 'brand:<url>' (logo real <img>).
// Brand icons preservam cor original do logo (verde WhatsApp, rosa Insta, etc).
const renderIcon = (iconKey, size) => {
  const sz = size || 22;
  if (iconKey && iconKey.startsWith('brand:')) {
    const url = iconKey.slice(6);
    return '<img src="' + url + '" alt="" loading="lazy" decoding="async" style="width:' + sz + 'px;height:' + sz + 'px;object-fit:contain">';
  }
  return svgIcon(I[iconKey], sz);
};

// Pequeno helper pra montar cards "icon + título + descrição"
const featCard = (iconKey, head, body, opts) => {
  const cls = (opts && opts.dark)
    ? 'group relative overflow-hidden rounded-2xl border border-accent/35 bg-[linear-gradient(180deg,rgba(230,81,0,0.10),rgba(230,81,0,0.03)_60%,rgba(230,81,0,0)_100%)] p-6 transition-all duration-500 hover:scale-[1.02] hover:border-accent/60'
    : 'group rounded-2xl border border-accent/35 bg-frame p-6 transition-all duration-500 hover:scale-[1.02] hover:border-accent/60 hover:shadow-[0_8px_24px_-12px_rgba(230,81,0,0.35)]';
  const isBrand = iconKey && iconKey.startsWith('brand:');
  // Brand icons: fundo branco translucido com leve borda accent pra integrar
  // visualmente sem perder a cor real do logo. Lucide: bg-accent/15 + text-accent.
  const iconBoxCls = isBrand
    ? 'inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-accent/20 mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm'
    : 'inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3';
  return '<div class="' + cls + '" style="opacity: 1; transform: none;">' +
    '<div class="' + iconBoxCls + '">' +
      renderIcon(iconKey, 22) +
    '</div>' +
    '<h3 class="text-base font-medium text-foreground mb-1.5 leading-tight">' + head + '</h3>' +
    '<p class="text-sm text-muted-foreground leading-relaxed">' + body + '</p>' +
  '</div>';
};

// --- 9.1) Autoridade · Quem é o Fred (antes de #metodo) ---
{
  const html =
    '<section data-copy-v3="autoridade-fred" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14 lg:items-center">' +
          // LEFT: Photo card placeholder (premium)
          '<div class="relative group" style="opacity: 1; transform: none;">' +
            '<div class="absolute -inset-1 rounded-[2rem] bg-accent/40 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>' +
            '<div class="relative aspect-square rounded-[2rem] border border-accent/40 overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] shadow-[0_20px_60px_-20px_rgba(230,81,0,0.5)]">' +
              // Foto do Fred (cobre o card)
              '<img src="/brand/fred.png" alt="Fred Martins · Especialista em IA" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async">' +
              // Gradient overlay no rodape pra legibilidade do texto
              '<div class="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_100%)]" aria-hidden="true"></div>' +
              // Texto sobre a foto
              '<div class="absolute bottom-6 left-6 right-6">' +
                '<p class="text-xs uppercase tracking-[0.18em] text-white/85 drop-shadow-md mb-1">Especialista em IA</p>' +
                '<p class="text-2xl font-medium text-white drop-shadow-md">Fred Martins</p>' +
              '</div>' +
              // Corner badge animado: Prêmio Atlântico
              '<div class="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_8px_20px_-4px_rgba(230,81,0,0.6)] animate-pulse">' +
                '<span class="inline-flex items-center text-white">' + svgIcon(I.trophy, 12) + '</span>' +
                'Prêmio Atlântico' +
              '</div>' +
            '</div>' +
          '</div>' +
          // RIGHT: Text + marcos
          '<div style="opacity: 1; transform: none;">' +
            '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Quem está do outro lado</div>' +
            '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3rem] leading-[1.05]">Quem te guia já fez o caminho que você quer fazer.</h2>' +
            '<p class="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">Eu sou o <span class="text-foreground font-medium">Fred Martins</span>. Há 8+ anos ajudo empresário a usar tecnologia pra vender mais e trabalhar menos. Eu não sou programador de carteirinha, e é exatamente por isso que sei traduzir IA pra linguagem de quem toca um negócio de verdade.</p>' +
            '<p class="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">O Clube Infinity é onde eu coloco tudo isso num lugar só, e toda quarta eu apareço ao vivo pra olhar o que você está construindo.</p>' +
            // 3 marcos como mini cards horizontais
            '<div class="mt-8 grid gap-3 sm:grid-cols-3">' +
              '<div class="group rounded-2xl border border-accent/35 bg-frame p-4 transition-all duration-500 hover:scale-[1.03] hover:border-accent">' +
                '<div class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent mb-3 transition-transform duration-500 group-hover:rotate-12">' + svgIcon(I.trophy, 18) + '</div>' +
                '<p class="text-sm font-semibold text-foreground leading-tight">Prêmio Atlântico</p>' +
                '<p class="mt-0.5 text-xs text-muted-foreground">Melhor comunidade de IA</p>' +
              '</div>' +
              '<div class="group rounded-2xl border border-accent/35 bg-frame p-4 transition-all duration-500 hover:scale-[1.03] hover:border-accent">' +
                '<div class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent mb-3 transition-transform duration-500 group-hover:rotate-12">' + svgIcon(I.users, 18) + '</div>' +
                '<p class="text-sm font-semibold text-foreground leading-tight">5.000+ empresários</p>' +
                '<p class="mt-0.5 text-xs text-muted-foreground">Formados no método</p>' +
              '</div>' +
              '<div class="group rounded-2xl border border-accent/35 bg-frame p-4 transition-all duration-500 hover:scale-[1.03] hover:border-accent">' +
                '<div class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent mb-3 transition-transform duration-500 group-hover:rotate-12">' + svgIcon(I.calendar, 18) + '</div>' +
                '<p class="text-sm font-semibold text-foreground leading-tight">8+ anos</p>' +
                '<p class="mt-0.5 text-xs text-muted-foreground">Construindo com tech</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="metodo"', html, 'autoridade-fred');
}

// --- 9.2) Pra Quem É + Outcomes (antes de #comunidade) ---
{
  const icp = [
    ['target', 'Quer criar negócio novo', 'Você quer começar do zero usando IA e não sabe por onde começar.'],
    ['rocket', 'Já tem negócio e quer escalar', 'Você quer usar IA pra vender mais operando com menos pessoas.'],
    ['zap', 'Quer solução plug and play', 'Você quer aplicar rápido sem precisar virar técnico.'],
  ];
  const outcomes = [
    ['database', 'Criar o próprio CRM', 'Em vez de pagar mensalidade de plataforma cara.'],
    ['brand:https://cdn.simpleicons.org/whatsapp/25D366', 'Automatizar o WhatsApp', 'Atendimento que não perde cliente, com agente de IA.'],
    ['globe', 'Montar o site do negócio', 'Sem depender de agência ou refém de freelancer.'],
    ['brand:https://cdn.simpleicons.org/instagram/E4405F', 'Gerar post pras redes', 'Quase no piloto automático, mantendo a sua voz.'],
    ['settings', 'Automatizar processo interno', 'Tarefa repetitiva da operação rodando sozinha.'],
    ['dollar', 'Criar novos produtos', 'Ofertas, infoprodutos e serviços novos pra vender mais.'],
  ];
  const icpHtml = icp.map(([icon, head, body]) => featCard(icon, head, body)).join('');
  const outcomesHtml = outcomes.map(([icon, head, body]) => featCard(icon, head, body, { dark: true })).join('');
  const html =
    '<section data-copy-v3="pra-quem-e" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="mb-12 max-w-3xl" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Pra quem é</div>' +
          '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3rem] leading-[1.05]">Isso aqui é pra você se...</h2>' +
        '</div>' +
        '<div class="grid gap-4 sm:grid-cols-3 mb-12">' + icpHtml + '</div>' +
        '<div class="rounded-2xl border border-accent/20 bg-accent/5 p-5 mb-12 max-w-4xl">' +
          '<p class="text-sm leading-relaxed text-foreground"><span class="font-medium">Não importa o nível.</span> <span class="text-muted-foreground">Tem trilha pra quem não sabe nada, pra quem é intermediário e pra quem já é avançado. Cada um entra no ponto certo e evolui no próprio ritmo.</span></p>' +
        '</div>' +
        '<div class="mb-8 max-w-3xl">' +
          '<p class="text-xs font-medium uppercase tracking-[0.18em] text-accent mb-3">O que você sai sabendo fazer</p>' +
          '<h3 class="text-3xl font-medium text-foreground sm:text-4xl leading-tight">Resultado prático, do primeiro dia.</h3>' +
        '</div>' +
        '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' + outcomesHtml + '</div>' +
        '<p class="mt-10 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">Você economiza criando suas próprias ferramentas, automatiza o que é chato, e sobra tempo pra focar no que traz resultado.</p>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="comunidade"', html, 'pra-quem-e');
}

// --- 9.3) Encontros ao Vivo (antes de #modulos) ---
{
  const pillarCard = (iconKey, head, body) =>
    '<div class="group relative overflow-hidden rounded-2xl border border-accent/35 bg-frame p-6 transition-all duration-500 hover:scale-[1.02] hover:border-accent hover:shadow-[0_8px_24px_-12px_rgba(230,81,0,0.35)]" style="opacity: 1; transform: none;">' +
      '<div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">' +
        svgIcon(I[iconKey], 22) +
      '</div>' +
      '<h3 class="text-lg font-medium text-foreground mb-2 leading-tight">' + head + '</h3>' +
      '<p class="text-sm text-muted-foreground leading-relaxed">' + body + '</p>' +
    '</div>';
  const html =
    '<section data-copy-v3="encontros-ao-vivo" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-5xl">' +
        '<div class="mb-12 text-center" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center gap-2 rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">' +
            '<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span></span>' +
            'Toda quarta · 17h Portugal · Ao vivo' +
          '</div>' +
          '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3rem] leading-[1.05]">Conteúdo gravado te ensina. Encontro ao vivo te destrava.</h2>' +
          '<p class="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-muted-foreground sm:text-lg">O que trava o empresário não é falta de aula. É não ter pra quem mostrar o que está construindo agora. Por isso o Clube tem 4 encontros ao vivo todo mês.</p>' +
        '</div>' +
        '<div class="grid gap-5 sm:grid-cols-3 mb-10">' +
          pillarCard('mic', '1 encontro com Fred', 'Você traz a dúvida do seu projeto e sai com o próximo passo concreto.') +
          pillarCard('handshake', '3 encontros com convidados', 'Gente que já está escalando com IA, dividindo o que está funcionando agora.') +
          pillarCard('replay', 'Replay completo', 'Não pôde quarta às 17h? A gravação fica na sua biblioteca pra sempre.') +
        '</div>' +
        // Highlight card grande: 48
        '<div class="relative overflow-hidden rounded-[2rem] border border-accent/40 bg-[linear-gradient(135deg,rgba(230,81,0,0.20),rgba(230,81,0,0.06)_55%,rgba(230,81,0,0)_100%)] p-8 sm:p-12 text-center group hover:scale-[1.01] transition-transform duration-700" style="opacity: 1; transform: none;">' +
          // Decorative SVG corner
          '<div class="absolute -top-6 -right-6 text-accent/10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">' + svgIcon(I.calendar, 160) + '</div>' +
          '<div class="relative">' +
            '<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent mb-3">Acesso completo</p>' +
            '<div class="flex items-end justify-center gap-3 mb-2">' +
              '<span class="text-7xl sm:text-8xl font-bold text-accent leading-none">48</span>' +
              '<span class="text-lg sm:text-xl font-medium text-foreground mb-2">encontros ao vivo</span>' +
            '</div>' +
            '<p class="text-base text-foreground"><span class="font-semibold">por ano.</span> <span class="text-muted-foreground">Toda semana tem alguém de verdade olhando o que você está construindo.</span></p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="modulos"', html, 'encontros-ao-vivo');
}

// --- 9.4) Bônus extras (#2, #3, #4) — depois de InfiZap, antes de pricing ---
{
  const bonuses = [
    ['02', 'map', 'Roadmap dos 7 Primeiros Dias', 'Passo a passo do que fazer na primeira semana pra já subir algo no ar.', '€247'],
    ['03', 'fileText', 'Pacote de Templates e Prompts', 'Prompts e templates prontos por setor, pra copiar, colar e usar no seu negócio.', '€297'],
    ['04', 'video', '48 Encontros Gravados', 'Toda live fica na sua biblioteca, pra sempre. Você nunca perde uma quarta.', 'Incluído'],
  ];
  const cardsHtml = bonuses.map(([num, icon, title, desc, value]) =>
    '<div class="group relative overflow-hidden rounded-[2rem] border border-accent/35 bg-[linear-gradient(180deg,rgba(230,81,0,0.14),rgba(230,81,0,0.05)_50%,rgba(230,81,0,0)_100%)] p-6 sm:p-7 transition-all duration-500 hover:scale-[1.02] hover:border-accent/60 hover:shadow-[0_12px_32px_-12px_rgba(230,81,0,0.45)]" style="opacity: 1; transform: none;">' +
      '<div class="flex items-start justify-between mb-5">' +
        '<div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">' + svgIcon(I[icon], 22) + '</div>' +
        '<span class="text-xs font-medium uppercase tracking-[0.18em] text-accent">Bônus ' + num + '</span>' +
      '</div>' +
      '<h3 class="text-xl font-medium text-foreground mb-2 leading-tight">' + title + '</h3>' +
      '<p class="text-sm text-muted-foreground leading-relaxed mb-5">' + desc + '</p>' +
      '<div class="flex items-center justify-between pt-4 border-t border-accent/20">' +
        '<span class="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Valor</span>' +
        '<span class="text-base font-semibold text-foreground">' + value + '</span>' +
      '</div>' +
    '</div>'
  ).join('');
  const html =
    '<section data-copy-v3="bonus-extras" class="w-full bg-background px-6 pb-20 sm:pb-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="mb-10 max-w-3xl" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Entrando hoje você ainda leva</div>' +
          '<h2 class="mt-5 text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">Mais 3 bônus pra você não ter desculpa.</h2>' +
        '</div>' +
        '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' + cardsHtml + '</div>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="pricing"', html, 'bonus-extras');
}

// --- 9.5) Prova Social (antes de #pricing) ---
{
  const testimonials = [
    ['MC', 'Mariana C.', 'Dona de boutique', 'Antes eu pagava €180/mês de plataforma. No Clube aprendi a montar meu próprio painel em 2 semanas. Economizo isso e ainda atendo no WhatsApp 24h.'],
    ['JL', 'João L.', 'Consultor', 'Eu travava com IA. Em 1 mês de Clube criei meu primeiro infoproduto e fiz 4 vendas usando só ferramenta que aprendi aqui.'],
    ['AS', 'Ana S.', 'Estética avançada', 'Automatizei o agendamento da clínica e o post das redes. Sobrou tempo pra atender mais cliente, dobrei a agenda em 60 dias.'],
  ];
  const cardsHtml = testimonials.map(([initials, name, setor, txt]) =>
    '<div class="group relative rounded-2xl border border-accent/35 bg-frame p-6 transition-all duration-500 hover:scale-[1.02] hover:border-accent hover:shadow-[0_8px_24px_-12px_rgba(230,81,0,0.35)]" style="opacity: 1; transform: none;">' +
      '<div class="absolute top-5 right-5 text-accent/30 transition-transform duration-500 group-hover:scale-110">' + svgIcon(I.quote, 28) + '</div>' +
      '<div class="flex items-center gap-3 mb-4">' +
        '<div class="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center text-base font-semibold text-accent">' + initials + '</div>' +
        '<div>' +
          '<p class="text-sm font-medium text-foreground leading-tight">' + name + '</p>' +
          '<p class="text-xs text-muted-foreground">' + setor + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="flex items-center gap-0.5 mb-3 text-accent">' +
        '<span class="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" style="transition-delay:0ms">' + svgIcon(I.star, 14) + '</span>' +
        '<span class="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" style="transition-delay:50ms">' + svgIcon(I.star, 14) + '</span>' +
        '<span class="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" style="transition-delay:100ms">' + svgIcon(I.star, 14) + '</span>' +
        '<span class="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" style="transition-delay:150ms">' + svgIcon(I.star, 14) + '</span>' +
        '<span class="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" style="transition-delay:200ms">' + svgIcon(I.star, 14) + '</span>' +
      '</div>' +
      '<p class="text-sm leading-relaxed text-foreground">' + txt + '</p>' +
    '</div>'
  ).join('');
  const html =
    '<section data-copy-v3="prova-social" class="w-full bg-background px-6 pb-20 sm:pb-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="mb-10 text-center max-w-3xl mx-auto" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Prova social</div>' +
          '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3rem] leading-[1.05]">Empresário de verdade, resultado de verdade.</h2>' +
        '</div>' +
        '<div class="grid gap-4 sm:grid-cols-3">' + cardsHtml + '</div>' +
        '<p class="mt-6 text-center text-[11px] text-muted-foreground/70">⚠️ Depoimentos ilustrativos. Trocar pelos reais antes de publicar.</p>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="pricing"', html, 'prova-social');
}

// --- 9.6) Ancoragem + Value Stack (antes de #pricing — agora seção própria) ---
{
  const aluga = [
    ['database', 'CRM (plataforma de gestão de clientes)', '€600 a €1.800'],
    ['brand:https://cdn.simpleicons.org/whatsapp/25D366', 'Ferramenta de atendimento no WhatsApp', '€1.200'],
    ['globe', 'Site feito por agência', '€1.500 a €3.000'],
    ['brand:https://cdn.simpleicons.org/instagram/E4405F', 'Gestão de social / criação de conteúdo', '€3.600 a €6.000'],
    ['users', 'Consultor de IA (€150/hora)', 'Incalculável'],
  ];
  const stack = [
    ['mic', '48 encontros ao vivo/ano (12 com Fred + 36 convidados)', '€1.997'],
    ['graduation', 'Cursos e trilhas + aulas novas todo mês', '€1.497'],
    ['zap', 'Biblioteca de ferramentas prontas (plug and play)', '€497'],
    ['users', 'Comunidade ativa + networking', '€497'],
    ['trophy', 'Bônus 1 a 4 (InfiZap, Roadmap, Templates, Gravações)', '€691'],
  ];
  const tableRow = (icon, item, val, dim) => {
    const isBrand = icon && icon.startsWith('brand:');
    const iconBoxCls = isBrand
      ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-accent/20 transition-transform duration-500 group-hover:rotate-12 shadow-sm'
      : 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent transition-transform duration-500 group-hover:rotate-12';
    return '<div class="flex items-center justify-between gap-3 py-3 border-b border-accent/15 last:border-b-0 group transition-colors hover:bg-accent/5 -mx-2 px-2 rounded-md">' +
      '<div class="flex items-center gap-3 min-w-0">' +
        '<span class="' + iconBoxCls + '">' + renderIcon(icon, 16) + '</span>' +
        '<span class="text-sm leading-snug text-foreground">' + item + '</span>' +
      '</div>' +
      '<span class="text-sm font-semibold ' + (dim ? 'text-muted-foreground' : 'text-foreground') + ' whitespace-nowrap">' + val + '</span>' +
    '</div>';
  };
  const alugaHtml = aluga.map(([i, t, v]) => tableRow(i, t, v, true)).join('');
  const stackHtml = stack.map(([i, t, v]) => tableRow(i, t, v, false)).join('');
  const html =
    '<section data-copy-v3="ancoragem-value-stack" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="mb-12 text-center max-w-3xl mx-auto" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Compare o que você paga hoje</div>' +
          '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3rem] leading-[1.05]">A conta dói. A solução fica clara.</h2>' +
        '</div>' +
        '<div class="grid gap-5 lg:grid-cols-2" style="opacity: 1; transform: none;">' +
          // Bloco esquerdo: O que aluga hoje
          '<div class="relative rounded-[2rem] border border-border bg-frame p-6 sm:p-8 transition-all duration-500 hover:border-accent/40">' +
            '<div class="flex items-center gap-3 mb-1">' +
              '<span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">' + svgIcon(I.trendDown, 20) + '</span>' +
              '<p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">O custo de continuar como está</p>' +
            '</div>' +
            '<h3 class="text-2xl font-medium text-foreground mb-5 mt-2">O que você aluga hoje</h3>' +
            alugaHtml +
          '</div>' +
          // Bloco direito: Value stack
          '<div class="relative rounded-[2rem] border border-accent/40 bg-[linear-gradient(180deg,rgba(230,81,0,0.12),rgba(230,81,0,0.03)_60%,rgba(230,81,0,0)_100%)] p-6 sm:p-8 transition-all duration-500 hover:border-accent/60 hover:shadow-[0_16px_40px_-16px_rgba(230,81,0,0.45)]">' +
            '<div class="flex items-center gap-3 mb-1">' +
              '<span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">' + svgIcon(I.trendUp, 20) + '</span>' +
              '<p class="text-xs font-medium uppercase tracking-[0.16em] text-accent">O que entra no acesso</p>' +
            '</div>' +
            '<h3 class="text-2xl font-medium text-foreground mb-5 mt-2">Tudo isso no Clube Infinity</h3>' +
            stackHtml +
            '<div class="flex items-center justify-between pt-5 mt-3 border-t-2 border-accent/40">' +
              '<span class="text-base font-semibold text-foreground">Valor total entregue</span>' +
              '<span class="text-3xl font-bold text-accent">€5.179</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mt-10 text-center max-w-3xl mx-auto">' +
          '<p class="text-base sm:text-lg text-foreground"><span class="font-semibold">No Clube Infinity você aprende a fazer tudo isso você mesmo.</span> <span class="text-muted-foreground">Uma vez. Pra sempre.</span></p>' +
        '</div>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="pricing"', html, 'ancoragem-value-stack');
}

// --- 9.7) Garantia 7 dias (depois de #pricing, antes do FAQ) ---
{
  const html =
    '<section data-copy-v3="garantia-7-dias" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-4xl">' +
        '<div class="relative group" style="opacity: 1; transform: none;">' +
          // Halo blur effect
          '<div class="absolute -inset-2 rounded-[2.5rem] bg-accent/30 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>' +
          '<div class="relative overflow-hidden rounded-[2rem] border border-accent/50 bg-[linear-gradient(135deg,rgba(230,81,0,0.18),rgba(230,81,0,0.05)_55%,rgba(230,81,0,0)_100%)] p-8 sm:p-12 transition-transform duration-500 group-hover:scale-[1.005]">' +
            // Decorative shield in background
            '<div class="absolute -top-8 -right-8 text-accent/8 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110">' + svgIcon(I.shield, 200) + '</div>' +
            '<div class="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">' +
              // Shield medal icon com pulse halo
              '<div class="shrink-0">' +
                '<div class="relative inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center">' +
                  // Halo pulse animado
                  '<span class="absolute inset-0 rounded-2xl bg-accent/40 animate-ping opacity-50"></span>' +
                  '<div class="relative inline-flex h-full w-full items-center justify-center rounded-2xl bg-accent text-white shadow-[0_8px_24px_-8px_rgba(230,81,0,0.6)] transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">' +
                    svgIcon(I.shield, 44) +
                    // Days badge
                    '<div class="absolute -bottom-2 -right-2 inline-flex items-center justify-center rounded-full bg-foreground text-background h-9 w-9 text-xs font-bold border-2 border-background">7d</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              // Text
              '<div class="flex-1">' +
                '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-accent mb-3">Garantia incondicional</div>' +
                '<h2 class="text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] leading-tight">7 dias de garantia. <span class="text-accent">O risco é todo meu.</span></h2>' +
                '<p class="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">Entre, faça os cursos, participe do primeiro encontro ao vivo, use as ferramentas e a comunidade. Se em 7 dias você achar que não valeu, é só pedir: devolvo 100% do seu dinheiro, sem perguntas e sem burocracia.</p>' +
                '<p class="mt-4 text-sm leading-relaxed text-foreground"><span class="font-medium">A única coisa que você arrisca de verdade</span> <span class="text-muted-foreground">é continuar mais um ano pagando ferramenta cara e fazendo tudo no operacional.</span></p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  injectBefore('<section class="w-full px-6 py-20 sm:py-28"><div class="mx-auto max-w-3xl">', html, 'garantia-7-dias');
}


fs.writeFileSync(path, s, 'utf8');
console.log('nav brand mark swaps:', navSwaps);
console.log('hero image swaps:', heroSwaps);
console.log('timeline track bg-accent/30:', timelineTrackBefore);
console.log('arrow boxes bg-accent:', arrowBoxCount);
console.log('footer neutral-900 antes:', footRefsBefore, '/ depois:', footRefsAfter);
console.log('color azul→laranja swaps:', colorSwapCount);
console.log('InfiZap card white edge swaps:', infizapBorderCount);
console.log('copy v3 swaps:', copyV3Count, '/ blur paragraph rebuilt:', blurSwap);
console.log('footer CTA bg premium swaps:', footerCtaBgSwaps);
console.log('section pills border-accent swaps:', sectionPillsCount);
console.log('hero BG premium swaps:', heroBgSwaps);
console.log('novas dobras v3:', JSON.stringify(newSections, null, 0));
