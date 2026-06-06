"use client";

import { useEffect } from "react";

/**
 * Liga interatividade no HTML injetado via dangerouslySetInnerHTML.
 * Detecta padrões comuns (FAQ accordion, header sticky on scroll) e attacha handlers
 * sem precisar de hidratação React.
 */
export function LandingInteractivity() {
  useEffect(() => {
    // ===== Theme toggle (light/dark) =====
    // O template tem um <button aria-label="Switch to light theme"> fixed
    // no canto inferior-direito. O JS original do Auryon não foi clonado;
    // ligamos aqui: alterna .dark no <html>, persiste em localStorage e
    // troca o ícone (sun <-> moon) + aria-label/pressed.
    const root = document.documentElement;
    const themeBtn = document.querySelector<HTMLButtonElement>(
      'button[aria-label*="theme"]'
    );
    const SUN_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun w-5 h-5" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>';
    const MOON_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon w-5 h-5" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    const applyTheme = (mode: "dark" | "light") => {
      if (mode === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      if (themeBtn) {
        const isDark = mode === "dark";
        themeBtn.setAttribute(
          "aria-label",
          isDark ? "Switch to light theme" : "Switch to dark theme"
        );
        themeBtn.setAttribute("aria-pressed", String(isDark));
        themeBtn.innerHTML = isDark ? SUN_SVG : MOON_SVG;
      }
    };
    const saved =
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("theme") as "dark" | "light" | null)) ||
      null;
    applyTheme(saved ?? "dark");
    const onThemeClick = () => {
      const next = root.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
    };
    themeBtn?.addEventListener("click", onThemeClick);

    // ===== Header sticky com blur ao rolar =====
    const header = document.querySelector("header");
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 8) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ===== FAQ accordion =====
    // Detecta botões que parecem ser FAQ triggers (estão dentro de section "perguntas frequentes")
    // e toggla o sibling/conteúdo seguinte.
    const faqButtons = document.querySelectorAll<HTMLButtonElement>(
      'section button[aria-expanded], details > summary, [data-faq-trigger]'
    );
    const handlers: Array<{ el: Element; fn: EventListener }> = [];
    faqButtons.forEach((btn) => {
      const fn = () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        // Tenta achar o painel: próximo sibling, ou aria-controls
        const id = btn.getAttribute("aria-controls");
        const panel = id ? document.getElementById(id) : btn.nextElementSibling;
        if (panel && panel instanceof HTMLElement) {
          panel.hidden = expanded;
        }
      };
      btn.addEventListener("click", fn);
      handlers.push({ el: btn, fn });
    });

    // ===== Intro animada (fade-up) nas sections principais via IntersectionObserver =====
    // O clone original do Auryon Academy capturou DOM no estado pós-animação
    // (opacity:1, transform:none), perdendo as intros do framer-motion. Aplicamos
    // uma intro sutil custom: marca sections com .anim-init e revela conforme
    // entram na viewport. Conservador — só <section> + <footer>, não toca no header.
    const animTargets = document.querySelectorAll<HTMLElement>('main section, footer');
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('anim-in');
                  observer?.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
          )
        : null;
    animTargets.forEach((el) => {
      el.classList.add('anim-init');
      observer?.observe(el);
    });

    // ===== Text reveal (blur->clear) scroll-driven, palavra por palavra =====
    // O template tem ~37 spans com style="opacity:0.15;filter:blur(8px);
    // transition:opacity 75ms, filter 75ms;" — cada palavra de um headline.
    // Cada palavra revela conforme você rola: progresso 0 quando o topo do
    // headline entra na viewport por baixo, 1 quando atinge ~30% do topo.
    // Cada palavra tem sua "fatia" desse progresso (i/N → (i+1)/N).
    // Tira a transition CSS de 75ms — o scroll é a fonte de verdade da timeline,
    // a transition cria delay e faz parecer que "passa rápido demais".
    const blurredSpans = Array.from(
      document.querySelectorAll<HTMLElement>('[style*="blur(8px)"]')
    ).filter((el) => /opacity:\s*0\.15/i.test(el.getAttribute('style') || ''));
    const spansByParent = new Map<Element, HTMLElement[]>();
    blurredSpans.forEach((el) => {
      el.style.transition = 'none';
      const parent = el.parentElement;
      if (!parent) return;
      if (!spansByParent.has(parent)) spansByParent.set(parent, []);
      spansByParent.get(parent)!.push(el);
    });

    let revealRaf = 0;
    const updateReveal = () => {
      revealRaf = 0;
      const vh = window.innerHeight;
      spansByParent.forEach((children, parent) => {
        const rect = (parent as HTMLElement).getBoundingClientRect();
        // Start: topo do bloco bate o fundo da viewport (vh).
        // End:   topo do bloco bate 30% do topo da viewport.
        const startY = vh;
        const endY = vh * 0.3;
        let progress = (startY - rect.top) / (startY - endY);
        if (progress < 0) progress = 0;
        else if (progress > 1) progress = 1;
        const n = children.length;
        children.forEach((el, i) => {
          const sliceStart = i / n;
          const sliceEnd = (i + 1) / n;
          let wp = (progress - sliceStart) / (sliceEnd - sliceStart);
          if (wp < 0) wp = 0;
          else if (wp > 1) wp = 1;
          // 0.15 -> 1 em opacidade, 8px -> 0px em blur
          el.style.opacity = String(0.15 + wp * 0.85);
          el.style.filter = wp >= 1 ? 'none' : `blur(${(8 - wp * 8).toFixed(2)}px)`;
        });
      });
    };
    const onScrollReveal = () => {
      if (revealRaf) return;
      revealRaf = window.requestAnimationFrame(updateReveal);
    };
    updateReveal();
    window.addEventListener('scroll', onScrollReveal, { passive: true });
    window.addEventListener('resize', onScrollReveal);

    // ===== Linha de progresso vertical (timeline #como-funciona) =====
    // O template tem <div class="bg-accent" style="will-change: height; height: 0%;">
    // dentro de uma linha cinza. O JS original animava o height pra preencher
    // de azul conforme o scroll. Religamos isso: progress = 0 quando o topo da
    // linha cinza bate o centro da viewport, 1 quando o fundo bate o centro.
    const progressFills = Array.from(
      document.querySelectorAll<HTMLElement>('[style*="will-change: height"]')
    );
    const updateProgressLines = () => {
      const center = window.innerHeight / 2;
      progressFills.forEach((fill) => {
        const track = fill.parentElement;
        if (!track) return;
        const rect = track.getBoundingClientRect();
        if (rect.height <= 0) return;
        let p = (center - rect.top) / rect.height;
        if (p < 0) p = 0;
        else if (p > 1) p = 1;
        fill.style.height = `${(p * 100).toFixed(2)}%`;
      });
    };
    let progressRaf = 0;
    const onProgressScroll = () => {
      if (progressRaf) return;
      progressRaf = window.requestAnimationFrame(() => {
        progressRaf = 0;
        updateProgressLines();
      });
    };
    updateProgressLines();
    window.addEventListener('scroll', onProgressScroll, { passive: true });
    window.addEventListener('resize', onProgressScroll);

    // ===== Smooth scroll em âncoras =====
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const anchorHandlers: Array<{ el: Element; fn: EventListener }> = [];
    anchors.forEach((a) => {
      const fn = ((e: Event) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }) as EventListener;
      a.addEventListener("click", fn);
      anchorHandlers.push({ el: a, fn });
    });

    return () => {
      themeBtn?.removeEventListener("click", onThemeClick);
      window.removeEventListener("scroll", onScroll);
      handlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
      anchorHandlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
      observer?.disconnect();
      window.removeEventListener('scroll', onScrollReveal);
      window.removeEventListener('resize', onScrollReveal);
      if (revealRaf) cancelAnimationFrame(revealRaf);
      window.removeEventListener('scroll', onProgressScroll);
      window.removeEventListener('resize', onProgressScroll);
      if (progressRaf) cancelAnimationFrame(progressRaf);
    };
  }, []);

  return null;
}
