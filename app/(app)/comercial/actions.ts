"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";
import { parseDataHoraLocal } from "@/app/lib/parseDataHoraLocal";
import { Temperatura, EtapaLead, TipoAtividade } from "@/app/generated/prisma/client";
import { ETAPAS } from "./constants";

const TEMP_LABEL: Record<string, string> = { FRIO: "Frio", MORNO: "Morno", QUENTE: "Quente" };

async function registrarAtividade(leadId: string, tipo: TipoAtividade, descricao: string) {
  const usuario = await getCurrentUser();
  await prisma.atividadeLead.create({
    data: { leadId, tipo, descricao, autor: usuario?.nome ?? null },
  });
}

export async function createLead(formData: FormData) {
  const empresaNome = String(formData.get("empresa") ?? "").trim();
  const contatoNome = String(formData.get("contato") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const telefone = String(formData.get("telefone") ?? "").trim() || null;
  const valorEstimadoRaw = String(formData.get("valorEstimado") ?? "").trim();
  const origem = String(formData.get("origem") ?? "").trim() || null;
  const cidade = String(formData.get("cidade") ?? "").trim() || null;
  const segmento = String(formData.get("segmento") ?? "").trim() || null;
  const temperatura = String(formData.get("temperatura") ?? "MORNO") as Temperatura;
  const proximaAcao = String(formData.get("proximaAcao") ?? "").trim() || null;
  const proximaAcaoEmRaw = String(formData.get("proximaAcaoEm") ?? "").trim();

  if (!empresaNome || !contatoNome) {
    throw new Error("Empresa e contato são obrigatórios");
  }

  const empresa = await prisma.empresa.findFirst({ where: { nome: empresaNome } });
  const empresaFinal =
    empresa ?? (await prisma.empresa.create({ data: { nome: empresaNome, cidade, segmento } }));

  const contato = await prisma.contato.create({
    data: { nome: contatoNome, email, telefone, empresaId: empresaFinal.id },
  });

  const lead = await prisma.lead.create({
    data: {
      empresaId: empresaFinal.id,
      contatoId: contato.id,
      valorEstimado: valorEstimadoRaw ? Number(valorEstimadoRaw) : null,
      origem,
      temperatura,
      proximaAcao,
      proximaAcaoEm: proximaAcaoEmRaw ? parseDataHoraLocal(proximaAcaoEmRaw) : null,
    },
  });

  await registrarAtividade(lead.id, "CRIACAO", `Lead criado (${empresaNome})`);

  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
  revalidatePath("/comercial/empresas");
  revalidatePath("/comercial/contatos");
  revalidatePath("/comercial/followups");
}

export async function updateLeadEtapa(leadId: string, etapa: EtapaLead) {
  const lead = await prisma.lead.update({ where: { id: leadId }, data: { etapa } });

  if (etapa === "FECHADO") {
    await prisma.cliente.upsert({
      where: { empresaId: lead.empresaId },
      update: { ativo: true },
      create: { empresaId: lead.empresaId, ativo: true },
    });
  }

  const label = ETAPAS.find((e) => e.value === etapa)?.label ?? etapa;
  await registrarAtividade(leadId, "MUDANCA_ETAPA", `Etapa alterada para "${label}"`);

  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
  revalidatePath(`/comercial/leads/${leadId}`);
  revalidatePath("/projetos");
}

export async function updateLeadTemperatura(leadId: string, temperatura: Temperatura) {
  await prisma.lead.update({ where: { id: leadId }, data: { temperatura } });
  await registrarAtividade(leadId, "TEMPERATURA", `Temperatura alterada para ${TEMP_LABEL[temperatura] ?? temperatura}`);
  revalidatePath("/comercial");
  revalidatePath(`/comercial/leads/${leadId}`);
}

export async function updateProximaAcao(leadId: string, formData: FormData) {
  const proximaAcao = String(formData.get("proximaAcao") ?? "").trim() || null;
  const data = String(formData.get("data") ?? "").trim();
  const hora = String(formData.get("hora") ?? "").trim();
  const proximaAcaoEm = data ? parseDataHoraLocal(`${data}T${hora || "09:00"}`) : null;

  await prisma.lead.update({ where: { id: leadId }, data: { proximaAcao, proximaAcaoEm } });

  if (proximaAcao) {
    await registrarAtividade(leadId, "PROXIMA_ACAO", `Próxima ação: ${proximaAcao}`);
  }

  revalidatePath("/comercial");
  revalidatePath("/comercial/followups");
  revalidatePath("/comercial/agenda");
  revalidatePath(`/comercial/leads/${leadId}`);
}

export async function addNotaLead(leadId: string, formData: FormData) {
  const nota = String(formData.get("nota") ?? "").trim();
  if (!nota) return;
  await registrarAtividade(leadId, "NOTA", nota);
  revalidatePath(`/comercial/leads/${leadId}`);
}

export async function updateLeadDetalhes(leadId: string, formData: FormData) {
  const empresaNome = String(formData.get("empresaNome") ?? "").trim();
  const valorEstimadoRaw = String(formData.get("valorEstimado") ?? "").trim();
  const origem = String(formData.get("origem") ?? "").trim() || null;
  const responsavelId = String(formData.get("responsavelId") ?? "").trim() || null;

  if (!empresaNome) throw new Error("Nome da empresa é obrigatório");

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      valorEstimado: valorEstimadoRaw ? Number(valorEstimadoRaw) : null,
      origem,
      responsavelId,
    },
  });

  await prisma.empresa.update({ where: { id: lead.empresaId }, data: { nome: empresaNome } });

  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
  revalidatePath("/comercial/empresas");
  revalidatePath(`/comercial/leads/${leadId}`);
}

export async function getLeadResumo(leadId: string) {
  const [lead, usuarios] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        empresa: true,
        contato: true,
        atividades: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    }),
    prisma.usuario.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!lead) return null;

  return {
    id: lead.id,
    empresaNome: lead.empresa.nome,
    contatoNome: lead.contato.nome,
    contatoCargo: lead.contato.cargo,
    contatoEmail: lead.contato.email,
    contatoTelefone: lead.contato.telefone,
    valorEstimado: lead.valorEstimado ? lead.valorEstimado.toString() : null,
    origem: lead.origem,
    responsavelId: lead.responsavelId,
    etapa: lead.etapa,
    temperatura: lead.temperatura,
    proximaAcao: lead.proximaAcao,
    proximaAcaoEm: lead.proximaAcaoEm,
    atividades: lead.atividades.map((a) => ({
      id: a.id,
      tipo: a.tipo,
      descricao: a.descricao,
      autor: a.autor,
      createdAtISO: a.createdAt.toISOString(),
    })),
    usuarios: usuarios.map((u) => ({ id: u.id, nome: u.nome })),
  };
}

export async function arquivarEmpresa(id: string, arquivada: boolean) {
  await prisma.empresa.update({ where: { id }, data: { arquivada } });
  revalidatePath("/comercial/empresas");
}

export async function updateContato(id: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const telefone = String(formData.get("telefone") ?? "").trim() || null;

  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.contato.update({ where: { id }, data: { nome, cargo, email, telefone } });

  revalidatePath("/comercial/contatos");
  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
}
