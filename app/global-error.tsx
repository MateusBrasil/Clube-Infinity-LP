"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: "#0a0a0a", color: "#fafafa", fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>Algo deu errado</h1>
          <p style={{ color: "#a3a3a3", marginBottom: "1.5rem" }}>{error.message || "Erro inesperado."}</p>
          <button
            onClick={reset}
            style={{ background: "#a78bfa", color: "#0a0a0a", padding: "0.75rem 1.5rem", borderRadius: "9999px", border: "none", fontWeight: 500, cursor: "pointer" }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
