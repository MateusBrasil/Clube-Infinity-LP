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

// ===== 9) Novas dobras Copy v3 (Fred / Pra Quem É / Lives / Bônus / Prova / Ancoragem / Garantia) =====
// Cada dobra injeta HTML usando o padrao visual ja validado (section
// boilerplate + eyebrow pill border-accent + h2 + cards com gradient laranja).
// Idempotente via marcador data-copy-v3 — re-execucoes nao duplicam.
const newSections = {};

// --- helper: injeta HTML antes do anchor, so se ainda nao existe ---
function injectBefore(anchor, html, key) {
  if (s.indexOf('data-copy-v3="' + key + '"') >= 0) {
    newSections[key] = 'skip (já existe)';
    return;
  }
  const i = s.indexOf(anchor);
  if (i < 0) {
    newSections[key] = 'NO ANCHOR';
    return;
  }
  s = s.slice(0, i) + html + s.slice(i);
  newSections[key] = 'OK';
}

// --- 9.1) Autoridade · Quem é o Fred (antes de #metodo) ---
{
  const html =
    '<section data-copy-v3="autoridade-fred" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:items-center">' +
          '<div style="opacity: 1; transform: none;">' +
            '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Quem está do outro lado</div>' +
            '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">Quem te guia já fez o caminho que você quer fazer.</h2>' +
            '<p class="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">Eu sou o Fred Martins. Há 8+ anos eu ajudo empresário a usar tecnologia pra vender mais e trabalhar menos. Já passei por construção de negócio, agência, infoprodutos e operação com IA. Eu não sou programador de carteirinha, e é exatamente por isso que eu sei traduzir IA pra linguagem de quem toca um negócio de verdade.</p>' +
            '<p class="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">O Clube Infinity é onde eu coloco tudo isso num lugar só, e onde toda quarta eu apareço ao vivo pra olhar o que você está construindo.</p>' +
          '</div>' +
          '<div class="relative overflow-hidden rounded-[2rem] border border-accent/35 bg-[linear-gradient(180deg,rgba(230,81,0,0.14),rgba(230,81,0,0.05)_50%,rgba(230,81,0,0)_100%)] p-7 sm:p-8" style="opacity: 1; transform: none;">' +
            '<p class="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Marcos de autoridade</p>' +
            '<div class="mt-6 space-y-4">' +
              '<div class="flex items-start gap-3"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">01</span><p class="text-sm text-foreground"><span class="font-medium text-foreground">5.000+ empresários</span> formados no método</p></div>' +
              '<div class="flex items-start gap-3"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">02</span><p class="text-sm text-foreground"><span class="font-medium text-foreground">8+ anos</span> construindo negócios com tecnologia</p></div>' +
              '<div class="flex items-start gap-3"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">03</span><p class="text-sm text-foreground">Alunos saindo do zero a <span class="font-medium text-foreground">6 dígitos em faturamento</span></p></div>' +
            '</div>' +
            '<div class="mt-7 rounded-xl bg-accent/8 border border-accent/20 px-4 py-3">' +
              '<p class="text-xs text-muted-foreground"><span class="font-semibold text-foreground">⚠️ Placeholder:</span> trocar pelos números reais do Fred antes de publicar.</p>' +
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
    'Você quer criar um negócio novo usando IA e não sabe por onde começar.',
    'Você já tem negócio e quer usar IA pra escalar: vender mais operando com menos.',
    'Você quer solução pronta, plug and play, pra aplicar rápido sem ficar técnico.',
  ];
  const outcomes = [
    ['📇', 'Criar o próprio CRM', 'Em vez de pagar mensalidade de plataforma cara.'],
    ['💬', 'Automatizar o WhatsApp', 'Atendimento que não perde cliente, com agente de IA.'],
    ['🌐', 'Montar o site do negócio', 'Sem depender de agência ou ficar refém de freelancer.'],
    ['📱', 'Gerar post pras redes', 'Quase no piloto automático, mantendo a sua voz.'],
    ['⚙️', 'Automatizar processo interno', 'Tarefa repetitiva da operação rodando sozinha.'],
    ['💰', 'Criar novos produtos', 'Ofertas, infoprodutos e serviços novos pra vender mais.'],
  ];
  const icpHtml = icp.map(t =>
    '<div class="rounded-2xl border border-accent/35 bg-frame p-5 transition-transform duration-500 hover:scale-[1.02]"><div class="flex items-start gap-3"><span class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent">✓</span><p class="text-sm leading-relaxed text-foreground">' + t + '</p></div></div>'
  ).join('');
  const outcomesHtml = outcomes.map(([emoji, head, body]) =>
    '<div class="group rounded-2xl border border-border bg-frame p-5 transition-all duration-500 hover:border-accent/50 hover:scale-[1.02]"><div class="text-3xl mb-3 transition-transform duration-500 group-hover:scale-110">' + emoji + '</div><h3 class="text-base font-medium text-foreground mb-1">' + head + '</h3><p class="text-sm text-muted-foreground leading-relaxed">' + body + '</p></div>'
  ).join('');
  const html =
    '<section data-copy-v3="pra-quem-e" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="mb-12 max-w-3xl" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Pra quem é</div>' +
          '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">Isso aqui é pra você se...</h2>' +
        '</div>' +
        '<div class="grid gap-4 sm:grid-cols-3 mb-10" style="opacity: 1; transform: none;">' + icpHtml + '</div>' +
        '<p class="mb-12 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">E não importa o nível. Tem trilha pra quem não sabe nada, pra quem é intermediário e pra quem já é avançado. Cada um entra no ponto certo e evolui no próprio ritmo.</p>' +
        '<div class="mb-8 max-w-3xl">' +
          '<p class="text-sm font-medium uppercase tracking-[0.16em] text-accent mb-3">O que você sai sabendo fazer</p>' +
          '<h3 class="text-2xl font-medium text-foreground sm:text-3xl">Resultado prático, do primeiro dia.</h3>' +
        '</div>' +
        '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style="opacity: 1; transform: none;">' + outcomesHtml + '</div>' +
        '<p class="mt-10 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">Você economiza criando suas próprias ferramentas, automatiza o que é chato, e sobra tempo pra focar no que traz resultado.</p>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="comunidade"', html, 'pra-quem-e');
}

// --- 9.3) Encontros ao Vivo (antes de #modulos) ---
{
  const html =
    '<section data-copy-v3="encontros-ao-vivo" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-5xl">' +
        '<div class="mb-12 text-center" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Toda quarta · 17h Portugal · Ao vivo</div>' +
          '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">Conteúdo gravado te ensina. Encontro ao vivo te destrava.</h2>' +
          '<p class="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-muted-foreground sm:text-lg">O que trava o empresário não é falta de aula. É não ter pra quem mostrar o que está construindo agora. Por isso o Clube tem 4 encontros ao vivo todo mês.</p>' +
        '</div>' +
        '<div class="grid gap-5 sm:grid-cols-3 mb-10" style="opacity: 1; transform: none;">' +
          '<div class="group rounded-2xl border border-accent/35 bg-frame p-6 transition-all duration-500 hover:scale-[1.02]"><div class="text-3xl mb-3 transition-transform duration-500 group-hover:scale-110">🎙️</div><h3 class="text-lg font-medium text-foreground mb-2">1 encontro com Fred</h3><p class="text-sm text-muted-foreground leading-relaxed">Você traz a dúvida do seu projeto e sai com o próximo passo concreto.</p></div>' +
          '<div class="group rounded-2xl border border-accent/35 bg-frame p-6 transition-all duration-500 hover:scale-[1.02]"><div class="text-3xl mb-3 transition-transform duration-500 group-hover:scale-110">🤝</div><h3 class="text-lg font-medium text-foreground mb-2">3 encontros com convidados</h3><p class="text-sm text-muted-foreground leading-relaxed">Gente que já está escalando com IA, dividindo o que está funcionando agora.</p></div>' +
          '<div class="group rounded-2xl border border-accent/35 bg-frame p-6 transition-all duration-500 hover:scale-[1.02]"><div class="text-3xl mb-3 transition-transform duration-500 group-hover:scale-110">🔁</div><h3 class="text-lg font-medium text-foreground mb-2">Replay completo</h3><p class="text-sm text-muted-foreground leading-relaxed">Não pôde quarta às 17h? A gravação fica na sua biblioteca pra sempre.</p></div>' +
        '</div>' +
        '<div class="relative overflow-hidden rounded-[2rem] border border-accent/35 bg-[linear-gradient(135deg,rgba(230,81,0,0.18),rgba(230,81,0,0.06)_60%,rgba(230,81,0,0)_100%)] p-8 sm:p-10 text-center" style="opacity: 1; transform: none;">' +
          '<div class="text-6xl sm:text-7xl font-bold text-accent mb-2">48</div>' +
          '<p class="text-lg font-medium text-foreground">encontros ao vivo por ano</p>' +
          '<p class="mt-3 text-sm text-muted-foreground max-w-md mx-auto">Toda semana tem alguém de verdade olhando o que você está construindo.</p>' +
        '</div>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="modulos"', html, 'encontros-ao-vivo');
}

// --- 9.4) Bônus extras (#2, #3, #4) — injetado APÓS a seção InfiZap ---
// A seção InfiZap atual fica como está; abaixo dela injetamos 3 cards
// com os outros bônus, num grid 3 colunas.
{
  const bonuses = [
    ['02', 'Roadmap dos 7 Primeiros Dias', 'Passo a passo do que fazer na primeira semana pra já subir algo no ar.', '€247'],
    ['03', 'Pacote de Templates e Prompts', 'Prompts e templates prontos por setor, pra copiar, colar e usar no seu negócio.', '€297'],
    ['04', '48 Encontros Gravados', 'Toda live fica na sua biblioteca, pra sempre. Você nunca perde uma quarta.', 'Incluído'],
  ];
  const cardsHtml = bonuses.map(([num, title, desc, value]) =>
    '<div class="relative overflow-hidden rounded-[2rem] border border-accent/35 bg-[linear-gradient(180deg,rgba(230,81,0,0.14),rgba(230,81,0,0.05)_50%,rgba(230,81,0,0)_100%)] p-6 sm:p-7 transition-all duration-500 hover:scale-[1.02]" style="opacity: 1; transform: none;">' +
      '<div class="flex items-center justify-between mb-5">' +
        '<span class="text-xs font-medium uppercase tracking-[0.18em] text-accent">Bônus ' + num + '</span>' +
        '<span class="text-xs font-medium text-muted-foreground">Valor: <span class="text-foreground">' + value + '</span></span>' +
      '</div>' +
      '<h3 class="text-xl font-medium text-foreground mb-2 leading-tight">' + title + '</h3>' +
      '<p class="text-sm text-muted-foreground leading-relaxed">' + desc + '</p>' +
    '</div>'
  ).join('');
  const html =
    '<section data-copy-v3="bonus-extras" class="w-full bg-background px-6 pb-20 sm:pb-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="mb-10 max-w-3xl" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Entrando hoje você ainda leva</div>' +
          '<h2 class="mt-5 text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">Mais 3 bônus pra você não ter desculpa.</h2>' +
        '</div>' +
        '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' + cardsHtml + '</div>' +
      '</div>' +
    '</section>';
  // Anchor: inject right before #pricing (depois da seção InfiZap).
  injectBefore('<section id="pricing"', html, 'bonus-extras');
}

// --- 9.5) Prova Social (depois de bônus extras, antes de #pricing) ---
{
  const testimonials = [
    ['Trocar', 'setor pessoal', 'Trocar texto: problema X → o que fez no Clube → resultado em N dias.'],
    ['Trocar', 'setor pessoal', 'Trocar texto: problema Y → o que fez no Clube → resultado em N dias.'],
    ['Trocar', 'setor pessoal', 'Trocar texto: problema Z → o que fez no Clube → resultado em N dias.'],
  ];
  const cardsHtml = testimonials.map(([name, setor, txt]) =>
    '<div class="rounded-2xl border border-border bg-frame p-6 transition-all duration-500 hover:border-accent/50 hover:scale-[1.02]" style="opacity: 1; transform: none;">' +
      '<div class="flex items-center gap-3 mb-4"><div class="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center text-lg font-semibold text-accent">' + name.charAt(0) + '</div><div><p class="text-sm font-medium text-foreground">' + name + '</p><p class="text-xs text-muted-foreground">' + setor + '</p></div></div>' +
      '<p class="text-sm leading-relaxed text-muted-foreground italic">⚠️ ' + txt + '</p>' +
    '</div>'
  ).join('');
  const html =
    '<section data-copy-v3="prova-social" class="w-full bg-background px-6 pb-20 sm:pb-28">' +
      '<div class="mx-auto max-w-6xl">' +
        '<div class="mb-10 text-center" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex items-center rounded-full border border-accent bg-frame px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Prova social</div>' +
          '<h2 class="mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">Empresário de verdade, resultado de verdade.</h2>' +
        '</div>' +
        '<div class="grid gap-4 sm:grid-cols-3">' + cardsHtml + '</div>' +
        '<p class="mt-6 text-center text-xs text-muted-foreground">⚠️ Placeholders: trocar pelos depoimentos reais antes de publicar.</p>' +
      '</div>' +
    '</section>';
  injectBefore('<section id="pricing"', html, 'prova-social');
}

// --- 9.6) Ancoragem + Value Stack (DENTRO de #pricing, antes do card €297) ---
{
  const aluga = [
    ['CRM (plataforma de gestão de clientes)', '€600 a €1.800'],
    ['Ferramenta de atendimento/automação no WhatsApp', '€1.200'],
    ['Site feito por agência', '€1.500 a €3.000'],
    ['Gestão de social / criação de conteúdo', '€3.600 a €6.000'],
    ['Consultor de IA (€150/hora)', 'Incalculável'],
  ];
  const stack = [
    ['48 encontros ao vivo/ano (12 com Fred + 36 convidados)', '€1.997'],
    ['Cursos e trilhas completas + aulas novas todo mês', '€1.497'],
    ['Biblioteca de ferramentas prontas (plug and play)', '€497'],
    ['Comunidade ativa + networking', '€497'],
    ['Bônus 1 a 4 (InfiZap, Roadmap, Templates, Gravações)', '€691'],
  ];
  const alugaHtml = aluga.map(([item, val]) =>
    '<div class="flex items-center justify-between py-3 border-b border-border last:border-b-0"><span class="text-sm text-foreground">' + item + '</span><span class="text-sm font-medium text-muted-foreground whitespace-nowrap ml-3">' + val + '</span></div>'
  ).join('');
  const stackHtml = stack.map(([item, val]) =>
    '<div class="flex items-center justify-between py-3 border-b border-border last:border-b-0"><span class="text-sm text-foreground">' + item + '</span><span class="text-sm font-medium text-foreground whitespace-nowrap ml-3">' + val + '</span></div>'
  ).join('');
  const html =
    '<div data-copy-v3="ancoragem-value-stack" class="mx-auto max-w-5xl mb-12 sm:mb-16">' +
      '<div class="grid gap-5 lg:grid-cols-2" style="opacity: 1; transform: none;">' +
        '<div class="rounded-2xl border border-border bg-frame p-6 sm:p-7">' +
          '<p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">O custo de continuar como está</p>' +
          '<h3 class="text-xl font-medium text-foreground mb-5">O que você aluga hoje</h3>' +
          alugaHtml +
        '</div>' +
        '<div class="rounded-2xl border border-accent/35 bg-[linear-gradient(180deg,rgba(230,81,0,0.10),rgba(230,81,0,0.03)_60%,rgba(230,81,0,0)_100%)] p-6 sm:p-7">' +
          '<p class="text-xs font-medium uppercase tracking-[0.16em] text-accent mb-1">O que entra no acesso</p>' +
          '<h3 class="text-xl font-medium text-foreground mb-5">Tudo isso no Clube Infinity</h3>' +
          stackHtml +
          '<div class="flex items-center justify-between pt-4 mt-2 border-t-2 border-accent/30"><span class="text-base font-semibold text-foreground">Valor total</span><span class="text-2xl font-bold text-accent">€5.179</span></div>' +
        '</div>' +
      '</div>' +
      '<p class="mt-8 text-center text-base sm:text-lg text-foreground"><span class="font-semibold">No Clube Infinity você aprende a fazer tudo isso você mesmo.</span> <span class="text-muted-foreground">Uma vez. Pra sempre.</span></p>' +
    '</div>';
  // Anchor: dentro de #pricing, antes do mb-12 text-center do card de preço.
  // Procura o div externo do pricing-section.
  const pricingAnchor = '<section id="pricing" class="w-full bg-background px-6 py-20 sm:py-28 scroll-mt-24"><div class="mx-auto max-w-5xl">';
  if (s.indexOf('data-copy-v3="ancoragem-value-stack"') >= 0) {
    newSections['ancoragem-value-stack'] = 'skip (já existe)';
  } else {
    const i = s.indexOf(pricingAnchor);
    if (i < 0) {
      newSections['ancoragem-value-stack'] = 'NO ANCHOR';
    } else {
      const inject = i + pricingAnchor.length;
      s = s.slice(0, inject) + html + s.slice(inject);
      newSections['ancoragem-value-stack'] = 'OK';
    }
  }
}

// --- 9.7) Garantia 7 dias (depois de #pricing, antes do FAQ) ---
{
  const html =
    '<section data-copy-v3="garantia-7-dias" class="w-full bg-background px-6 py-20 sm:py-28">' +
      '<div class="mx-auto max-w-3xl">' +
        '<div class="relative overflow-hidden rounded-[2rem] border border-accent/40 bg-[linear-gradient(135deg,rgba(230,81,0,0.16),rgba(230,81,0,0.04)_60%,rgba(230,81,0,0)_100%)] p-8 sm:p-10 text-center" style="opacity: 1; transform: none;">' +
          '<div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 mb-5">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E65100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>' +
          '</div>' +
          '<h2 class="text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">7 dias de garantia. O risco é todo meu.</h2>' +
          '<p class="mt-5 max-w-xl mx-auto text-base leading-relaxed text-muted-foreground sm:text-lg">Entre, faça os cursos, participe do primeiro encontro ao vivo, use as ferramentas e a comunidade. Se em 7 dias você achar que não valeu, é só pedir: devolvo 100% do seu dinheiro, sem perguntas e sem burocracia.</p>' +
          '<p class="mt-5 max-w-xl mx-auto text-sm leading-relaxed text-foreground"><span class="font-medium">A única coisa que você arrisca de verdade</span> é continuar mais um ano pagando ferramenta cara e fazendo tudo no operacional.</p>' +
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
