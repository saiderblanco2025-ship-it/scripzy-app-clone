import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scripzy.app - AI YouTube Creator CRM",
  description:
    "Genera guiones largos de YouTube con IA, miniaturas automáticas y búsqueda de nichos rentables.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}