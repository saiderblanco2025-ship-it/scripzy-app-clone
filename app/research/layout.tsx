import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research — Estudio de mercado de tu nicho con IA",
  description:
    "Analiza los 20 videos más relevantes de tu tema con datos reales de YouTube: veredicto, competencia, ángulos, títulos probados, RPM y plan de 30 días.",
};

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
