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

// ===== 6c) Marquees de ferramentas — 10 ferramentas curadas Clube Infinity =====
// As 3 marquees (#metodo, secao "Ferramentas necessarias") vinham do template
// Auryon cheias de logos genericos (Antigravity, Stripe, Sentry, Redis...).
// Substituimos pelo set curado que e ensinado no Clube Infinity: AI assistants,
// AI coding/app builders, automacao, deploy e framework.
// Idempotente: cada execucao substitui o conteudo entre <div class="...marquee-N">
// e o primeiro </div> seguinte pelo mesmo HTML — convergente.
{
  const tools = [
    // Todos via cdn.simpleicons.org (SVGs oficiais com fundo transparente,
    // cor da marca). Bolt usa o slug stackblitz porque foi criado pela
    // StackBlitz. Lovable nao tem icone no Simple Icons — usa svgl mirror.
    { name: 'Claude',     src: 'https://cdn.simpleicons.org/claude' },
    { name: 'ChatGPT',    src: 'https://cdn.simpleicons.org/chatgpt' },
    { name: 'Cursor',     src: 'https://cdn.simpleicons.org/cursor' },
    { name: 'n8n',        src: 'https://cdn.simpleicons.org/n8n' },
    { name: 'Lovable',    src: 'https://svgl.app/library/lovable.svg' },
    { name: 'Bolt',       src: 'https://cdn.simpleicons.org/stackblitz' },
    { name: 'Perplexity', src: 'https://cdn.simpleicons.org/perplexity' },
    { name: 'Vercel',     src: 'https://cdn.simpleicons.org/vercel' },
    { name: 'Supabase',   src: 'https://cdn.simpleicons.org/supabase' },
    { name: 'Next.js',    src: 'https://cdn.simpleicons.org/nextdotjs' },
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

fs.writeFileSync(path, s, 'utf8');
console.log('nav brand mark swaps:', navSwaps);
console.log('hero image swaps:', heroSwaps);
console.log('timeline track bg-accent/30:', timelineTrackBefore);
console.log('arrow boxes bg-accent:', arrowBoxCount);
console.log('footer neutral-900 antes:', footRefsBefore, '/ depois:', footRefsAfter);
console.log('color azul→laranja swaps:', colorSwapCount);
console.log('InfiZap card white edge swaps:', infizapBorderCount);
console.log('footer CTA bg premium swaps:', footerCtaBgSwaps);
console.log('section pills border-accent swaps:', sectionPillsCount);
console.log('hero BG premium swaps:', heroBgSwaps);
