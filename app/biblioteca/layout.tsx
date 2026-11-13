import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca de Miniaturas — Todas tus miniaturas con IA",
  description:
    "Descarga, copia o elimina las miniaturas que generaste con IA. Tu biblioteca completa, siempre a un clic.",
};

export default function BibliotecaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
