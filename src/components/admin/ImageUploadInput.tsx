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
        <label className="block text-xs font-medium text-slate-700">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-colors ${
              tab === "upload"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-colors ${
              tab === "url"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Pegar URL
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
          <Image
            src={value}
            alt="Vista previa"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
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
            className={`w-full py-5 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              uploading
                ? "border-slate-300 bg-slate-100 cursor-not-allowed opacity-70"
                : "border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/60"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                <span className="text-xs text-slate-500 font-medium">
                  Subiendo imagen...
                </span>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-800 hover:underline">
                    Hacé clic para seleccionar una imagen
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
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
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
        />
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
