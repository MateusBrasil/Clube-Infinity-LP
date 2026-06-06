// Extrai body limpo de clone/index.html, troca marca, salva como JS string.
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/mateu/Documents/Projetos/Clube Infinity Lp/auryonacademy_com-02-06-26-umbrella-mirror.html';
const OUT = path.join(__dirname, 'lib', 'template.ts');

let html = fs.readFileSync(SRC, 'utf8');

// 1. Pega só o body. O clone do Umbrella Mirror embrulha o HTML real dentro
// de outro <html><body>, então o primeiro <body> contém um header de comentário
// + o HTML mirrored. Pegamos do primeiro <body>, removemos o comentário do
// Umbrella (que ficou sem o <!-- de abertura e renderiza como texto solto) e
// re-extraímos o body interno do site clonado.
let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (!bodyMatch) throw new Error('Body not found');
let body = bodyMatch[1];

// Strip do header comentário do Umbrella Mirror (texto leak):
// tudo até o `-->` que fecha o comentário (seguido do <html> mirrored).
body = body.replace(/^[\s\S]*?-->\s*/, '');

// O clone tem nesting mal-formado (3 <body> abertos, 1 fechado), então
// usar regex de fechamento não funciona. Tiramos <html><head>...</head><body>
// do começo e qualquer </html> trailing — sobra só o conteúdo interno.
// Mas o head do clone interno contém <style> tags com CSS styled-jsx que
// estilizam widgets internos (checkout-demo, tech-button, etc) — sem eles
// elementos viram caixas brancas. Preservamos esses styles prependando.
const headMatch = body.match(/^<html[\s\S]*?<head[^>]*>([\s\S]*?)<\/head><body[^>]*>/);
let preservedStyles = '';
if (headMatch) {
  const headInner = headMatch[1];
  preservedStyles = (headInner.match(/<style[\s\S]*?<\/style>/g) || []).join('\n');
}
body = body.replace(/^<html[\s\S]*?<body[^>]*>/, preservedStyles);
body = body.replace(/<\/html>\s*$/, '');

// 2. Strip ruído de hidratação / scripts / templates
body = body
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<noscript[\s\S]*?<\/noscript>/g, '')
  .replace(/<template[\s\S]*?<\/template>/g, '')
  .replace(/<link[^>]*>/g, '')
  // Remove a <section> de notificações (aria-label="Notifications alt+T")
  .replace(/<section aria-label="Notifications[\s\S]*?<\/section>/g, '')
  // Remove atributos de hidratação React/Next
  .replace(/\s(data-next-mark-loading|data-nimg|data-sentry-[a-z-]+|data-rsc[\w-]*)="[^"]*"/g, '')
  // Remove o "next-route-announcer" e wrappers vazios de roteador
  .replace(/<next-route-announcer[\s\S]*?<\/next-route-announcer>/g, '')
  // Marcadores de SSR streaming do React/Next.js: sem os scripts originais
  // o conteúdo dentro de <div hidden id="S:N"> nunca é destravado e a página
  // renderiza totalmente vazia.
  .replace(/<div hidden id="S:\d+">/g, '<div>')
  .replace(/<div hidden(?:="")?><!--\$--><!--\/\$--><\/div>/g, '')
  .replace(/<!--\$[?!]?-->/g, '')
  .replace(/<!--\/\$-->/g, '')
  // Estados iniciais de animação (framer-motion) — preservamos o estado
  // inicial e adicionamos `data-anim` + transition CSS. Um IntersectionObserver
  // no LandingInteractivity ativa cada um quando entra na viewport (seta
  // opacity:1; transform:none; filter:none na inline style).
  // Preserva opacity:0.15 etc. (não casa com opacity:0[^.\d]).
  .replace(
    /style="(opacity:0(?![.\d])[^"]*)"/g,
    'data-anim="" style="$1;transition:opacity 700ms cubic-bezier(0.16,1,0.3,1),transform 700ms cubic-bezier(0.16,1,0.3,1),filter 700ms cubic-bezier(0.16,1,0.3,1)"'
  )
  .replace(
    /style="(transform:translateY\(-\d+px\))"/g,
    'data-anim="" style="$1;transition:transform 800ms cubic-bezier(0.16,1,0.3,1)"'
  );

// 3. Auto-rebranding básico: Auryon Academy → Clube Infinity
const rebrand = [
  [/Auryon Academy/g, 'Clube Infinity'],
  [/AURYON ACADEMY/g, 'CLUBE INFINITY'],
  [/auryon academy/gi, 'clube infinity'],
  [/auryonacademy\.com/g, 'clubeinfinity.com.br'],
  [/Davi Xavier, the Best/g, 'Equipe Clube Infinity'],
  [/Davi Xavier/g, 'Clube Infinity'],
  [/Auryon/g, 'Clube Infinity'],
  [/vibecoders/gi, 'construtores'],
  [/Vibecodes/g, 'Clube Infinity'],
];
for (const [re, to] of rebrand) body = body.replace(re, to);

// 3a-bis. Migração de cores: o clone tem inline `style="--accent:#4c72ea;..."`
// num wrapper de tema que sobrescreve nossos tokens CSS. Troca pra paleta
// laranja oficial do Clube Infinity (ver Identidade Visual/logo-spec.md).
const brandColorMigration = [
  [/#4c72ea/gi, '#E65100'],   // accent / card-primary -> Clube orange
  [/#d6e2ff/gi, '#FEE9DC'],   // card-secondary tint
  [/#3d63da/gi, '#E65100'],   // ring/focus
  [/#e8efff/gi, '#FFF3EA'],   // phone-screen tint
];
for (const [re, to] of brandColorMigration) body = body.replace(re, to);

// 3a-ter. Remove o wrapper de tema com style inline (`style="--background:#f5f5f5;
// ...color-scheme:light"`) — ele força light mode e sobrescreve nossos tokens
// CSS inclusive quando o usuário clica em "dark mode". Sem o style, o controle
// fica 100% com globals.css.
body = body.replace(/\s*style="--background:[^"]+"/g, '');

// 3b. Converte URLs absolutas do próprio site em paths relativos.
// O rebrand acima trocou auryonacademy.com -> clubeinfinity.com.br, mas esse
// domínio não existe ainda — links absolutos viram 404. Tratamos só HTTPS
// próprio (assets locais e nav interna).
body = body
  .replace(/https?:\/\/clubeinfinity\.com\.br\//g, '/')
  // Limpa CSS externos do build do Auryon (já temos auryon-2.css local)
  .replace(/<link[^>]*\/_next\/static\/css\/[^>]*>/g, '');

// 4. Escape pra TS template literal: backticks, ${
body = body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const out = `// Auto-gerado por extract-template.js. NÃO edite à mão.
// Pra trocar textos, edite este arquivo via find/replace ou rode extract-template.js de novo.
export const TEMPLATE_HTML = \`${body}\`;
`;

fs.writeFileSync(OUT, out, 'utf8');
console.log(`Template salvo em ${OUT} (${body.length} chars)`);
