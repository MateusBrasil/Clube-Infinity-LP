import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clube Infinity",
  description:
    "Comunidade exclusiva para construtores que querem transformar ideias em produtos reais com IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="__variable_f367f3 __variable_6d200a antialiased"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
