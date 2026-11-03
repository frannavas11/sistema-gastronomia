"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { uploadStoreImage } from "@/app/admin/actions";

interface ImageUploadInputProps {
  storeId: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploadInput({
  storeId,
  value,
  onChange,
  label = "Foto del Producto (opcional)",
}: ImageUploadInputProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("storeId", storeId);
      formData.append("file", file);

      const res = await uploadStoreImage(formData);
      if (!res.success || !res.url) {
        setError(res.error || "No se pudo subir la imagen.");
      } else {
        onChange(res.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-colors ${
              tab === "upload"
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-colors ${
              tab === "url"
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Pegar URL
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 group">
          <Image
            src={value}
            alt="Vista previa"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-xl bg-rose-500/90 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Quitar foto
            </button>
          </div>
        </div>
      ) : tab === "upload" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="store-asset-file-input"
          />
          <label
            htmlFor="store-asset-file-input"
            className={`w-full py-5 px-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              uploading
                ? "border-zinc-700 bg-zinc-900/50 cursor-not-allowed opacity-70"
                : "border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/50"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                <span className="text-xs text-zinc-400 font-medium">
                  Subiendo a Supabase Storage...
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-rose-400 hover:underline">
                    Hacé clic para seleccionar una imagen
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    JPG, PNG o WEBP (hasta 5 MB)
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      ) : (
        <input
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
        />
      )}

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
