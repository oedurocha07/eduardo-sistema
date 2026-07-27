import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getConfiguracao } from "@/app/lib/configuracao";
import { BRAND_COLORS, DEFAULT_BRAND_COLOR, isBrandColorKey } from "@/app/lib/brandColors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0d",
};

export async function generateMetadata(): Promise<Metadata> {
  const nomeProdutora = await getConfiguracao()
    .then((c) => c.nomeProdutora ?? "Avra Produtora LTDA")
    .catch(() => "Avra Produtora LTDA");

  return {
    title: nomeProdutora,
    description: "Sistema interno de gestão",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: nomeProdutora,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const corDestaque = await getConfiguracao()
    .then((c) => c.corDestaque)
    .catch(() => null);
  const corChave = corDestaque && isBrandColorKey(corDestaque) ? corDestaque : DEFAULT_BRAND_COLOR;
  const cor = BRAND_COLORS[corChave];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style>{`:root { --accent: ${cor.accent}; --accent-hover: ${cor.hover}; --accent-foreground: ${cor.foreground}; }`}</style>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
