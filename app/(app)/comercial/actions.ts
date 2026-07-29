"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";
import { parseDataHoraLocal } from "@/app/lib/parseDataHoraLocal";
import { criarClienteAsaas } from "@/app/lib/n8n";
import { Temperatura, EtapaLead, TipoAtividade, StatusClienteRecorrente } from "@/app/generated/prisma/client";
import { ETAPAS } from "./constants";

const TEMP_LABEL: Record<string, string> = { FRIO: "Frio", MORNO: "Morno", QUENTE: "Quente" };

async function registrarAtividade(leadId: string, tipo: TipoAtividade, descricao: string) {
  const usuario = await getCurrentUser();
  await prisma.atividadeLead.create({
    data: { leadId, tipo, descricao, autor: usuario?.nome ?? null },
  });
}

function parseNum(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  return s ? Number(s) : null;
}

function parseStr(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

export async function createLead(formData: FormData) {
  const empresaNome = parseStr(formData.get("nome"));
  const contatoNome = parseStr(formData.get("contato"));
  const email = parseStr(formData.get("email"));
  const telefone = parseStr(formData.get("telefone"));
  const origem = parseStr(formData.get("origem"));
  const cidade = parseStr(formData.get("cidade"));
  const segmento = parseStr(formData.get("segmento"));
  const temperatura = (formData.get("temperatura") as Temperatura) ?? "MORNO";
  const proximaAcao = parseStr(formData.get("proximaAcao"));
  const proximaAcaoEmRaw = parseStr(formData.get("proximaAcaoEm"));

  if (!empresaNome || !contatoNome) {
    throw new Error("Nome do cliente e contato são obrigatórios");
  }

  const recorrente = formData.get("recorrente") === "on";
  const cnpjCpf = parseStr(formData.get("cnpjCpf"));
  const cep = parseStr(formData.get("cep"));
  const logradouro = parseStr(formData.get("logradouro"));
  const numero = parseStr(formData.get("numero"));
  const complemento = parseStr(formData.get("complemento"));
  const bairro = parseStr(formData.get("bairro"));
  const uf = parseStr(formData.get("uf"));
  const status = (formData.get("status") as StatusClienteRecorrente) ?? "ATIVO";
  const valorMensal = parseNum(formData.get("valorMensal"));
  const diaVencimento = parseNum(formData.get("diaVencimento"));
  const valorTrabalho = parseNum(formData.get("valorTrabalho"));
  const formaPagamento = parseStr(formData.get("formaPagamento"));
  const descricaoServico = parseStr(formData.get("descricaoServico"));
  const descricaoNbs = parseStr(formData.get("descricaoNbs"));
  const codigoServicoMunicipal = parseStr(formData.get("codigoServicoMunicipal"));
  const codigoTributacaoNacional = parseStr(formData.get("codigoTributacaoNacional"));
  const enviarFaturaLocacao = formData.get("enviarFaturaLocacao") === "on";
  const observacoes = parseStr(formData.get("observacoes"));

  const empresa = await prisma.empresa.findFirst({ where: { nome: empresaNome } });
  const empresaFinal =
    empresa ?? (await prisma.empresa.create({ data: { nome: empresaNome, cidade, segmento } }));

  const contato = await prisma.contato.create({
    data: { nome: contatoNome, email, telefone, empresaId: empresaFinal.id },
  });

  const valorEstimado = recorrente ? valorMensal : valorTrabalho;

  const lead = await prisma.lead.create({
    data: {
      empresaId: empresaFinal.id,
      contatoId: contato.id,
      valorEstimado,
      origem,
      temperatura,
      proximaAcao,
      proximaAcaoEm: proximaAcaoEmRaw ? parseDataHoraLocal(proximaAcaoEmRaw) : null,
    },
  });

  await registrarAtividade(lead.id, "CRIACAO", `Lead criado (${empresaNome})`);

  const dadosCobranca = {
    nome: empresaNome,
    cnpjCpf,
    email,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    uf,
    status,
    recorrente,
    valorMensal,
    diaVencimento,
    valorTrabalho,
    formaPagamento,
    descricaoServico,
    descricaoNbs,
    codigoServicoMunicipal,
    codigoTributacaoNacional,
    enviarFaturaLocacao,
    observacoes,
  };

  const clienteRecorrente = await prisma.clienteRecorrente.upsert({
    where: { empresaId: empresaFinal.id },
    update: dadosCobranca,
    create: { empresaId: empresaFinal.id, ...dadosCobranca },
  });

  const itensRaw = parseStr(formData.get("itensLocadosJson"));
  if (itensRaw) {
    try {
      const itens = JSON.parse(itensRaw) as { item: string; quantidade: string; valorUnitario: string }[];
      const validos = itens.filter((i) => i.item?.trim());
      if (validos.length > 0) {
        await prisma.itemLocado.createMany({
          data: validos.map((i) => ({
            clienteRecorrenteId: clienteRecorrente.id,
            item: i.item.trim(),
            quantidade: Number(i.quantidade) || 1,
            valorUnitario: Number(i.valorUnitario) || 0,
          })),
        });
      }
    } catch (e) {
      console.error("Erro ao processar itens locados:", e);
    }
  }

  if (!clienteRecorrente.idClienteAsaas) {
    const criado = await criarClienteAsaas({ nome: empresaNome, cnpjCpf, email });
    if (criado) {
      await prisma.clienteRecorrente.update({ where: { id: clienteRecorrente.id }, data: { idClienteAsaas: criado.id } });
    }
  }

  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
  revalidatePath("/comercial/empresas");
  revalidatePath("/comercial/contatos");
  revalidatePath("/comercial/followups");
  revalidatePath("/clientes");
}

export async function updateLeadEtapa(leadId: string, etapa: EtapaLead) {
  const lead = await prisma.lead.update({ where: { id: leadId }, data: { etapa } });

  if (etapa === "FECHADO") {
    await prisma.cliente.upsert({
      where: { empresaId: lead.empresaId },
      update: { ativo: true },
      create: { empresaId: lead.empresaId, ativo: true },
    });
  } else {
    // Só desativa se nenhum outro lead dessa empresa ainda estiver fechado
    // (uma empresa pode ter mais de um lead ao longo do tempo — repeat business).
    const outroLeadFechado = await prisma.lead.findFirst({
      where: { empresaId: lead.empresaId, etapa: "FECHADO", id: { not: leadId } },
    });
    if (!outroLeadFechado) {
      await prisma.cliente.updateMany({ where: { empresaId: lead.empresaId }, data: { ativo: false } });
    }
  }

  const label = ETAPAS.find((e) => e.value === etapa)?.label ?? etapa;
  await registrarAtividade(leadId, "MUDANCA_ETAPA", `Etapa alterada para "${label}"`);

  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
  revalidatePath(`/comercial/leads/${leadId}`);
  revalidatePath("/projetos");
}

export async function deleteLead(leadId: string) {
  const [propostas, orcamentos, documentos] = await Promise.all([
    prisma.proposta.count({ where: { leadId } }),
    prisma.orcamento.count({ where: { leadId } }),
    prisma.documento.count({ where: { leadId } }),
  ]);

  if (propostas > 0 || orcamentos > 0 || documentos > 0) {
    throw new Error("Não é possível excluir: existem propostas, orçamentos ou contratos vinculados a este lead.");
  }

  await prisma.lead.delete({ where: { id: leadId } });

  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
  revalidatePath("/comercial/empresas");
  revalidatePath("/comercial/contatos");
  revalidatePath("/comercial/followups");
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

export async function updateEmpresa(id: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const cidade = String(formData.get("cidade") ?? "").trim() || null;
  const segmento = String(formData.get("segmento") ?? "").trim() || null;

  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.empresa.update({ where: { id }, data: { nome, cidade, segmento } });

  revalidatePath("/comercial/empresas");
  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
}

export async function deleteEmpresa(id: string) {
  const [leadComVinculo, cliente, clienteRecorrente] = await Promise.all([
    prisma.lead.findFirst({
      where: {
        empresaId: id,
        OR: [{ propostas: { some: {} } }, { orcamentos: { some: {} } }, { documentos: { some: {} } }],
      },
    }),
    prisma.cliente.findUnique({
      where: { empresaId: id },
      include: {
        _count: {
          select: { projetos: true, lancamentos: true, propostas: true, orcamentos: true, documentos: true, eventos: true },
        },
      },
    }),
    prisma.clienteRecorrente.findUnique({
      where: { empresaId: id },
      include: { _count: { select: { lancamentos: true, propostas: true, orcamentos: true } } },
    }),
  ]);

  if (leadComVinculo) {
    throw new Error("Não é possível excluir: existem propostas, orçamentos ou contratos vinculados a um lead dessa empresa.");
  }
  if (cliente) {
    const total = Object.values(cliente._count).reduce((s, n) => s + n, 0);
    if (total > 0) {
      throw new Error("Não é possível excluir: essa empresa já é cliente com projetos, financeiro, propostas ou documentos vinculados.");
    }
  }
  if (clienteRecorrente) {
    const totalCobranca = Object.values(clienteRecorrente._count).reduce((s, n) => s + n, 0);
    if (totalCobranca > 0) {
      throw new Error("Não é possível excluir: essa empresa tem lançamentos, propostas ou orçamentos vinculados na Base de Clientes.");
    }
  }

  await prisma.contato.deleteMany({ where: { empresaId: id } });
  await prisma.lead.deleteMany({ where: { empresaId: id } });
  if (cliente) await prisma.cliente.delete({ where: { id: cliente.id } });
  if (clienteRecorrente) await prisma.clienteRecorrente.delete({ where: { id: clienteRecorrente.id } });
  await prisma.empresa.delete({ where: { id } });

  revalidatePath("/comercial/empresas");
  revalidatePath("/comercial");
  revalidatePath("/comercial/leads");
  revalidatePath("/comercial/contatos");
  revalidatePath("/clientes");
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

export async function deleteContato(id: string) {
  const leadsVinculados = await prisma.lead.count({ where: { contatoId: id } });
  if (leadsVinculados > 0) {
    throw new Error("Não é possível excluir: este contato está vinculado a um ou mais leads.");
  }

  await prisma.contato.delete({ where: { id } });
  revalidatePath("/comercial/contatos");
}

export async function limparProximaAcao(leadId: string) {
  await prisma.lead.update({ where: { id: leadId }, data: { proximaAcao: null, proximaAcaoEm: null } });
  await registrarAtividade(leadId, "PROXIMA_ACAO", "Próxima ação removida");

  revalidatePath("/comercial/followups");
  revalidatePath("/comercial/agenda");
  revalidatePath(`/comercial/leads/${leadId}`);
}
