import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
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
    <html
      lang="es"
      className={`h-full ${dmSans.variable} ${dmSerif.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FBF5EF] text-[#211B19] antialiased selection:bg-[#F4E3E0] selection:text-[#541923]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
