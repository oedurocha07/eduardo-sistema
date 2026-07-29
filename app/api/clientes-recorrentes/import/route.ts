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
  // Campo legado: quando enviado, é tratado como CEP (era o único dado real que esse
  // campo continha nas importações antigas do Notion).
  endereco?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
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
    const endereco = {
      cep: c.cep ?? c.endereco ?? null,
      logradouro: c.logradouro ?? null,
      numero: c.numero ?? null,
      complemento: c.complemento ?? null,
      bairro: c.bairro ?? null,
      cidade: c.cidade ?? null,
      uf: c.uf ?? null,
    };

    const cliente = await prisma.clienteRecorrente.upsert({
      where: { notionId: c.notionId },
      update: {
        nome: c.nome,
        cnpjCpf: c.cnpjCpf,
        email: c.email,
        ...endereco,
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
        ...endereco,
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
