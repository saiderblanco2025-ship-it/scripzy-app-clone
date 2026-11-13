import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://scripzy-app-clone-rwg9.vercel.app"),
  title: {
    default: "Scripzy — Tu Guionista de YouTube 24/7 · AI Powered",
    template: "%s · Scripzy",
  },
  description:
    "Genera guiones largos de YouTube con IA que retienen, miniaturas de alto CTR y encuentra nichos rentables con datos reales. Para creadores faceless y canales que crecen.",
  keywords: [
    "guiones youtube ia",
    "generador de guiones",
    "miniaturas con ia",
    "buscador de nichos youtube",
    "canal faceless",
    "scripzy",
  ],
  openGraph: {
    title: "Scripzy — Tu Guionista de YouTube 24/7 · AI Powered",
    description:
      "Guiones largos con IA, miniaturas de alto CTR y nichos rentables con datos reales de YouTube.",
    type: "website",
    locale: "es_ES",
    siteName: "Scripzy",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scripzy — Tu Guionista de YouTube 24/7",
    description:
      "Guiones largos con IA, miniaturas de alto CTR y nichos rentables con datos reales de YouTube.",
    images: ["/og.png"],
  },
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
