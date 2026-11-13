import type { MetadataRoute } from "next";

const BASE = "https://scripzy-app-clone-rwg9.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/pricing",
    "/script-lab",
    "/nichos",
    "/miniaturas",
    "/patrones",
    "/research",
    "/voces",
    "/biblioteca",
    "/recursos",
    "/terminos",
    "/privacidad",
  ];
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/pricing" ? 0.9 : 0.7,
  }));
}
