import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";
import { getConfiguracao } from "@/app/lib/configuracao";
import { updateNome, updateMetas } from "./actions";
import { NewMembroForm } from "./NewMembroForm";
import { AlterarSenhaForm } from "./AlterarSenhaForm";
import { BrandKitPicker } from "./BrandKitPicker";
import { DEFAULT_BRAND_COLOR, isBrandColorKey } from "@/app/lib/brandColors";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Badge } from "@/app/components/ui/Badge";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const [membros, config] = await Promise.all([
    prisma.usuario.findMany({ orderBy: { createdAt: "asc" } }),
    getConfiguracao(),
  ]);

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Configurações" />

      <section className="card mb-8 max-w-md">
        <h2 className="mb-3 font-semibold text-foreground">Meu Perfil</h2>
        <form action={updateNome} className="flex flex-col gap-2">
          <input type="hidden" name="usuarioId" value={usuario.id} />
          <label className="text-sm text-muted">Nome completo</label>
          <input name="nome" defaultValue={usuario.nome} className="input" />
          <label className="text-sm text-muted">Cargo / função</label>
          <input name="cargo" defaultValue={usuario.cargo ?? ""} placeholder="Ex: Diretor" className="input" />
          <label className="text-sm text-muted">E-mail</label>
          <input value={usuario.email} disabled className="input opacity-60" />
          <button type="submit" className="btn-primary mt-2 w-fit">
            Salvar perfil
          </button>
        </form>
      </section>

      <section className="card mb-8 max-w-md">
        <h2 className="mb-3 font-semibold text-foreground">Alterar Senha</h2>
        <AlterarSenhaForm usuarioId={usuario.id} />
      </section>

      <section className="card mb-8 max-w-md">
        <h2 className="mb-1 font-semibold text-foreground">Brand Kit</h2>
        <p className="mb-3 text-sm text-muted">Cor de destaque usada em botões, badges e gráficos.</p>
        <BrandKitPicker corAtual={config.corDestaque && isBrandColorKey(config.corDestaque) ? config.corDestaque : DEFAULT_BRAND_COLOR} />
      </section>

      <section className="card mb-8 max-w-md">
        <h2 className="mb-1 font-semibold text-foreground">Metas Mensais</h2>
        <p className="mb-3 text-sm text-muted">Alimentam o progresso do mês no Dashboard.</p>
        <form action={updateMetas} className="flex flex-col gap-2">
          <label className="text-sm text-muted">Meta mensal (R$)</label>
          <input
            name="metaMensal"
            type="number"
            step="0.01"
            defaultValue={config.metaMensal ? Number(config.metaMensal) : ""}
            className="input"
          />
          <label className="text-sm text-muted">Super meta mensal (R$)</label>
          <input
            name="superMetaMensal"
            type="number"
            step="0.01"
            defaultValue={config.superMetaMensal ? Number(config.superMetaMensal) : ""}
            className="input"
          />
          <button type="submit" className="btn-primary mt-2 w-fit">
            Salvar metas
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-foreground">Equipe</h2>
        <div className="flex flex-col gap-2">
          {membros.map((m) => (
            <div key={m.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{m.nome}</div>
                <div className="text-sm text-muted">{m.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={m.papel === "ADMIN" ? "accent" : "neutral"}>
                  {m.papel === "ADMIN" ? "Admin" : "Membro"}
                </Badge>
                {m.id === usuario.id && <span className="text-xs text-muted">você</span>}
              </div>
            </div>
          ))}
        </div>
        <NewMembroForm />
      </section>
    </div>
  );
}
