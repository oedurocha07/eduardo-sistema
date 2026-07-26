import { getConfiguracao } from "@/app/lib/configuracao";
import { BrandHeader } from "@/app/components/BrandHeader";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const config = await getConfiguracao();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="card w-full max-w-sm flex-col gap-4 p-8 shadow-2xl">
        <BrandHeader nomeProdutora={config.nomeProdutora ?? "Avra Produtora LTDA"} logoUrl={config.logoUrl} className="mb-2" />
        <LoginForm />
      </div>
    </main>
  );
}
