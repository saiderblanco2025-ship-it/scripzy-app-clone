import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "De cero a tu primer video — El Método Scripzy en 8 pasos",
  description:
    "La secuencia exacta: nichos que pagan, research, patrones virales, guion IA, voz IA, miniatura de alto CTR y publicación. Checklist interactivo de 8 pasos.",
};

export default function EmpezandoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
