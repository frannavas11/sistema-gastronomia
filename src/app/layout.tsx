import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema Gastronómico",
  description: "Plataforma de cartas y pedidos para gastronomía",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`h-full ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-[#fafafa] text-zinc-900 antialiased selection:bg-zinc-200">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
