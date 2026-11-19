import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { ThemedToaster } from "@/components/theme/ThemedToaster";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
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
    // suppressHydrationWarning: el script de tema agrega la clase `dark` antes de hidratar
    <html
      lang="es"
      className={`h-full ${dmSans.variable} ${dmSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Se ejecuta durante el parseo del HTML, antes del primer pintado (sin parpadeo).
            En el cliente se marca text/plain para que React no advierta ni lo re-ejecute. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-text-primary antialiased selection:bg-brand-tint selection:text-brand-fg">
        {children}
        <ThemedToaster />
      </body>
    </html>
  );
}
