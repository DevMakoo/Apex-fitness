import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { Preloader } from "@/components/preloader/preloader";

const displayFont = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APEX — Estúdio de Treinamento de Performance",
  description:
    "A APEX é um estúdio premium de treinamento de performance para atletas que se recusam a estagnar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", displayFont.variable, bodyFont.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SmoothScrollProvider>
          <Preloader>{children}</Preloader>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
