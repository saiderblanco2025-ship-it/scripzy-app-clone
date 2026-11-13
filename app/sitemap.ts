import type { MetadataRoute } from "next";

const BASE = "https://scripzy-app-clone-rwg9.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Solo rutas públicas indexables (las páginas de la app client-side redirigen anónimos a /login)
  const routes = ["", "/recursos", "/terminos", "/privacidad"];
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
