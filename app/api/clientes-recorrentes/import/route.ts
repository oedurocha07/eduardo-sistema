import { prisma } from "@/app/lib/prisma";

type ItemPayload = {
  notionId: string;
  item: string;
  quantidade: number;
  valorUnitario: number;
};

type ClientePayload = {
  notionId: string;
  nome: string;
  cnpjCpf?: string | null;
  email?: string | null;
  endereco?: string | null;
  status: "ATIVO" | "PAUSADO" | "ENCERRADO";
  valorMensal?: number | null;
  diaVencimento?: number | null;
  descricaoServico?: string | null;
  descricaoNbs?: string | null;
  codigoServicoMunicipal?: string | null;
  idClienteAsaas?: string | null;
  enviarFaturaLocacao: boolean;
  observacoes?: string | null;
  itens: ItemPayload[];
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const clientes: ClientePayload[] = await request.json();

  for (const c of clientes) {
    const cliente = await prisma.clienteRecorrente.upsert({
      where: { notionId: c.notionId },
      update: {
        nome: c.nome,
        cnpjCpf: c.cnpjCpf,
        email: c.email,
        endereco: c.endereco,
        status: c.status,
        valorMensal: c.valorMensal,
        diaVencimento: c.diaVencimento,
        descricaoServico: c.descricaoServico,
        descricaoNbs: c.descricaoNbs,
        codigoServicoMunicipal: c.codigoServicoMunicipal,
        idClienteAsaas: c.idClienteAsaas,
        enviarFaturaLocacao: c.enviarFaturaLocacao,
        observacoes: c.observacoes,
        sincronizadoEm: new Date(),
      },
      create: {
        notionId: c.notionId,
        nome: c.nome,
        cnpjCpf: c.cnpjCpf,
        email: c.email,
        endereco: c.endereco,
        status: c.status,
        valorMensal: c.valorMensal,
        diaVencimento: c.diaVencimento,
        descricaoServico: c.descricaoServico,
        descricaoNbs: c.descricaoNbs,
        codigoServicoMunicipal: c.codigoServicoMunicipal,
        idClienteAsaas: c.idClienteAsaas,
        enviarFaturaLocacao: c.enviarFaturaLocacao,
        observacoes: c.observacoes,
      },
    });

    for (const item of c.itens) {
      await prisma.itemLocado.upsert({
        where: { notionId: item.notionId },
        update: {
          item: item.item,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          clienteRecorrenteId: cliente.id,
        },
        create: {
          notionId: item.notionId,
          item: item.item,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          clienteRecorrenteId: cliente.id,
        },
      });
    }
  }

  return Response.json({ ok: true, importados: clientes.length });
}
