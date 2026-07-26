import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.CLIENTES_API_KEY) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const clientes = await prisma.clienteRecorrente.findMany({
    where: status ? { status: status.toUpperCase() as "ATIVO" | "PAUSADO" | "ENCERRADO" } : undefined,
    include: { itensLocados: true },
    orderBy: { nome: "asc" },
  });

  const payload = clientes.map((c) => ({
    id: c.id,
    nome: c.nome,
    cnpjCpf: c.cnpjCpf,
    email: c.email,
    endereco: c.endereco,
    status: c.status,
    valorMensal: c.valorMensal ? Number(c.valorMensal) : null,
    diaVencimento: c.diaVencimento,
    descricaoServico: c.descricaoServico,
    descricaoNbs: c.descricaoNbs,
    codigoServicoMunicipal: c.codigoServicoMunicipal,
    idClienteAsaas: c.idClienteAsaas,
    enviarFaturaLocacao: c.enviarFaturaLocacao,
    observacoes: c.observacoes,
    itensLocados: c.itensLocados.map((i) => ({
      item: i.item,
      quantidade: i.quantidade,
      valorUnitario: Number(i.valorUnitario),
    })),
  }));

  return Response.json(payload);
}
