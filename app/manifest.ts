import type { MetadataRoute } from "next";
import { getConfiguracao } from "@/app/lib/configuracao";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const nomeProdutora = await getConfiguracao()
    .then((c) => c.nomeProdutora ?? "Avra Produtora LTDA")
    .catch(() => "Avra Produtora LTDA");

  return {
    name: nomeProdutora,
    short_name: nomeProdutora,
    description: "Sistema interno de gestão",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0d",
    theme_color: "#0a0a0d",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
