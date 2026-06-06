"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h2 className="text-3xl font-semibold mb-3">Algo deu errado</h2>
      <p className="text-[var(--color-fg-muted)] mb-6 max-w-md">
        {error.message || "Erro inesperado."}
      </p>
      <button
        onClick={reset}
        className="bg-[var(--color-brand)] text-[var(--color-bg)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-brand-strong)] hover:text-white transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
