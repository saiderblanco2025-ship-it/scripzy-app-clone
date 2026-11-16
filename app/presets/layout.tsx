import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presets IA — El estilo de los canales que ya ganan",
  description:
    "Pega la URL de un canal fuerte: la IA extrae su estilo (ganchos, tono, pacing, palabras firma) y lo guarda como preset para escribir guiones que funcionan.",
};

export default function PresetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
