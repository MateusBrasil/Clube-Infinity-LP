import { TEMPLATE_HTML } from "@/lib/template";
import { LandingInteractivity } from "@/components/LandingInteractivity";

/**
 * RENDERIZA O HTML 1:1 DO AURYON ACADEMY, MAS COM A MARCA TROCADA PRO CLUBE INFINITY.
 *
 * Pra mudar textos: edite `lib/template.ts` (Ctrl+F o texto, troca, salva).
 * Pra mudar cores : edite as variáveis CSS no topo de `app/auryon-2.css`.
 * Pra mudar img   : substitua arquivos em `public/_next/static/media/` mantendo nome
 *                   OU substitua o atributo src no template.
 */
export default function HomePage() {
  return (
    <>
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: TEMPLATE_HTML }} />
      <LandingInteractivity />
    </>
  );
}
