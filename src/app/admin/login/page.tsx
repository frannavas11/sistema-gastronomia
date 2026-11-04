"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Por favor completá tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Correo o contraseña incorrectos. Verificalos e intentá de nuevo.");
        } else {
          setErrorMessage(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Error inesperado en login:", err);
      setErrorMessage("Ocurrió un error inesperado al intentar iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5EF] flex flex-col justify-center items-center px-4 py-12">
      {/* Botón para volver a la carta */}
      <div className="w-full max-w-sm mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#74645E] hover:text-[#211B19] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Tarjeta de Login */}
      <div className="w-full max-w-sm bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Cabecera */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#541923] mx-auto flex items-center justify-center text-white mb-3 shadow-xs">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-normal tracking-tight text-[#211B19]">
            Panel de Administración
          </h1>
          <p className="text-xs text-[#74645E] mt-1">
            Ingresá con tu cuenta para gestionar tu comercio
          </p>
        </div>

        {/* Mensaje de error si falla */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDE8E7] border border-[#FAC5C2] text-[#C74742] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#C74742] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-[#74645E] mb-1"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A18A81]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@comercio.com"
                className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#74645E]"
              >
                Contraseña
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A18A81]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[44px] pl-9 pr-10 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A18A81] hover:text-[#211B19] transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 min-h-[48px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#78232F] hover:bg-[#541923] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F] focus-visible:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Ingresar al Panel</span>
            )}
          </button>
        </form>

        {/* Footer con info */}
        <div className="mt-6 pt-4 border-t border-[#E9DAD2] text-center">
          <p className="text-xs text-[#74645E]">
            Plataforma de cartas y pedidos gastronómicos
          </p>
        </div>
      </div>
    </div>
  );
}
