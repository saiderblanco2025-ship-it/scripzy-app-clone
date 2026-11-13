"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Images,
  Download,
  Link2,
  Trash2,
  Check,
  ImageIcon,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { supabase, useUser } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

type ThumbnailJob = {
  id: string;
  prompt_used: string;
  generated_image_urls: string[] | null;
  created_at: string;
};

export default function BibliotecaPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const [items, setItems] = useState<ThumbnailJob[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ThumbnailJob | null>(null);
  const [preview, setPreview] = useState<ThumbnailJob | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/thumbnails", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error cargando la biblioteca");
      setItems(data.thumbnails ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyUrl(t: ThumbnailJob) {
    const url = t.generated_image_urls?.[0];
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* sin permiso */
    }
  }

  async function downloadImage(t: ThumbnailJob) {
    const url = t.generated_image_urls?.[0];
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `miniatura-scripzy-${t.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  }

  async function deleteItem() {
    if (!confirmDelete) return;
    const t = confirmDelete;
    setConfirmDelete(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      await fetch("/api/thumbnails", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ id: t.id }),
      });
      setItems((prev) => prev.filter((x) => x.id !== t.id));
    } catch {
      /* ignorar */
    }
  }

  const count = items.filter((t) => t.generated_image_urls?.[0]).length;

  return (
    <AppShell active="biblioteca">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Images className="h-7 w-7 text-fuchsia-400" />
              Biblioteca de Miniaturas
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Todas tus miniaturas generadas con IA — descarga, copia la URL
              pública o elimina las que no uses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300">
              {count} miniaturas
            </span>
            <Button variant="outline" size="sm" onClick={load} disabled={loadingData}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Cargando tu biblioteca…
          </div>
        ) : items.length === 0 || count === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-16 text-center text-slate-400">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            Aún no hay miniaturas.{" "}
            <a href="/miniaturas" className="text-fuchsia-400 underline hover:text-fuchsia-300">
              Genera la primera
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => {
              const url = t.generated_image_urls?.[0];
              if (!url) return null;
              return (
                <div
                  key={t.id}
                  className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-colors hover:border-fuchsia-500/40"
                >
                  <button
                    onClick={() => setPreview(t)}
                    className="relative block w-full"
                    title="Ver en grande"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={t.prompt_used}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      Ampliar
                    </span>
                  </button>
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-[2.5rem] text-xs text-slate-400">
                      {t.prompt_used}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {new Date(t.created_at).toLocaleString("es", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => downloadImage(t)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-fuchsia-600 px-2 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-fuchsia-700"
                        title="Descargar PNG"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Descargar
                      </button>
                      <button
                        onClick={() => copyUrl(t)}
                        className="rounded-md border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                        title="Copiar URL pública"
                      >
                        {copiedId === t.id ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(t)}
                        className="rounded-md border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-rose-500/60 hover:text-rose-400"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal: previsualización grande */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute -right-3 -top-3 rounded-full bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.generated_image_urls?.[0]}
              alt={preview.prompt_used}
              className="max-h-[90vh] max-w-full rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Modal: confirmar borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h3 className="font-bold">¿Eliminar esta miniatura?</h3>
            <p className="mt-2 text-sm text-slate-400">
              Se borrará de tu biblioteca y del almacenamiento. Esta acción no
              se puede deshacer.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={deleteItem}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
