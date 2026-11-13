import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voces IA — Narra tus guiones con voz natural",
  description:
    "Convierte tus guiones en narraciones MP3 de calidad profesional con voces naturales en español. 6 voces, un clic, sin grabar nada.",
};

export default function VocesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
