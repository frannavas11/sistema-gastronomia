"use client";

import { useState, useRef, useId } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { uploadStoreImage } from "@/app/admin/actions";

interface ImageUploadInputProps {
  storeId: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewVariant?: "rectangle" | "circle";
}

export function ImageUploadInput({
  storeId,
  value,
  onChange,
  label = "Foto del Producto (opcional)",
  previewVariant = "rectangle",
}: ImageUploadInputProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

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
      if (res.success) {
        onChange(res.url);
      } else {
        setError(res.error || "No se pudo subir la imagen.");
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
        <label className="block text-xs font-medium text-text-primary">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-border text-xs">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-colors ${
              tab === "upload"
                ? "bg-surface text-text-primary shadow-2xs"
                : "text-text-secondary hover:text-text-primary"
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
                ? "bg-surface text-text-primary shadow-2xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Pegar URL
          </button>
        </div>
      </div>

      {value ? (
        <div
          className={`relative overflow-hidden bg-surface-2 border border-border group ${
            previewVariant === "circle"
              ? "w-24 h-24 rounded-full mx-auto"
              : "w-full h-32 rounded-xl"
          }`}
        >
          <Image
            src={value}
            alt="Vista previa"
            fill
            className="object-cover"
            sizes={previewVariant === "circle" ? "96px" : "(max-width: 768px) 100vw, 300px"}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
            <button
              type="button"
              onClick={handleRemove}
              className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-text-primary text-xs font-medium flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Quitar</span>
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
            id={inputId}
          />
          <label
            htmlFor={inputId}
            className={`w-full py-5 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              uploading
                ? "border-border-strong bg-surface-2 cursor-not-allowed opacity-70"
                : "border-border-strong hover:border-text-tertiary bg-background hover:bg-surface-2/60"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
                <span className="text-xs text-text-secondary font-medium">
                  Subiendo imagen...
                </span>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary shadow-2xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-text-primary hover:underline">
                    Hacé clic para seleccionar una imagen
                  </span>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
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
          className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
        />
      )}

      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
}
