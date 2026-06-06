# Clube Infinity — Landing Page

Landing page da comunidade Clube Infinity, inspirada visualmente em auryonacademy.com.
Construída em **Next.js 15 + TypeScript + Tailwind v4 + Framer Motion**.

---

## Rodando localmente

```bash
npm run dev
```

Abre em http://localhost:3000

---

## Editando a landing — 3 lugares só

### 1. Textos (TUDO)
Arquivo: [`lib/content.ts`](./lib/content.ts)

Todos os textos da página (header, hero, bento, processo, preço, FAQ, footer) estão centralizados aqui. Mude e salva, a página atualiza sozinha.

```ts
export const hero = {
  badge: "Inscrições abertas",
  title: ["Seu título aqui", "destaque colorido"],
  subtitle: "Seu subtítulo aqui",
  // ...
};
```

### 2. Cores e tema
Arquivo: [`app/globals.css`](./app/globals.css)

As cores são variáveis CSS. Pra trocar o accent (violeta atual) por verde, por exemplo:

```css
--color-brand:        #4ade80;   /* novo accent */
--color-brand-strong: #16a34a;
--color-brand-glow:   rgba(74,222,128,0.18);
```

Tudo (botões, glows, gradientes) atualiza junto.

### 3. Imagens
Coloque arquivos em [`public/images/`](./public) e use no JSX:

```tsx
<img src="/images/sua-foto.png" />
```

---

## Estrutura

```
clube-infinity-lp/
├── app/
│   ├── globals.css      ← TEMA (cores, fontes)
│   ├── layout.tsx       ← Meta tags, fontes
│   └── page.tsx         ← Monta todas as seções na ordem
├── components/
│   ├── sections/        ← 10 seções, uma por arquivo
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── BentoGrid.tsx
│   │   ├── Community.tsx
│   │   ├── Process.tsx
│   │   ├── Bonus.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   ├── FinalCTA.tsx
│   │   └── Footer.tsx
│   └── ui/              ← componentes reutilizáveis (Button, Container, Badge)
├── lib/
│   ├── content.ts       ← COPY (TODOS os textos aqui)
│   └── utils.ts
└── public/              ← imagens, favicon, etc.
```

---

## Deploy no Vercel (grátis)

### Opção A — pelo CLI (1 minuto)
```bash
npm i -g vercel
vercel
```
Segue os prompts. Primeiro deploy gera URL `https://clube-infinity-lp-xxxxx.vercel.app`.

### Opção B — pelo painel do Vercel
1. Cria conta em https://vercel.com (login com GitHub)
2. Sobe esse projeto pro GitHub: `git init`, `git add .`, `git commit`, `gh repo create`, `git push`
3. No painel Vercel: "Add New Project" → escolhe o repo → Deploy
4. Cada `git push` faz redeploy automático

### Domínio próprio
No painel do projeto Vercel: **Settings → Domains → Add** → digita `clubeinfinity.com.br` → Vercel mostra os DNS pra configurar.

---

## Próximos passos

- [ ] Trocar copy em `lib/content.ts` pelo seu definitivo
- [ ] Ajustar cores em `app/globals.css` se quiser outra paleta
- [ ] Adicionar suas imagens em `public/images/`
- [ ] Plugar Stripe/Hotmart no botão de checkout (`Button` em Pricing/Hero)
- [ ] Conectar Discord/WhatsApp reais (URLs em `lib/content.ts` → `community`)
- [ ] Adicionar analytics (Vercel Analytics: `npm i @vercel/analytics`)
- [ ] Deploy
