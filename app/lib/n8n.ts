export async function enviarEmailResetSenha({ email, nome, link }: { email: string; nome: string; link: string }) {
  const url = process.env.RESET_SENHA_WEBHOOK_URL;
  const key = process.env.RESET_SENHA_WEBHOOK_KEY;
  if (!url || !key) {
    console.error("RESET_SENHA_WEBHOOK_URL/KEY não configurados");
    return;
  }

  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key },
    body: JSON.stringify({ email, nome, link }),
  });
}

export type ClienteAsaasCriado = {
  id: string;
  name: string;
  email: string | null;
  cpfCnpj: string | null;
};

export async function criarClienteAsaas({
  nome,
  cnpjCpf,
  email,
}: {
  nome: string;
  cnpjCpf?: string | null;
  email?: string | null;
}): Promise<ClienteAsaasCriado | null> {
  const url = process.env.ASAAS_CRIAR_CLIENTE_WEBHOOK_URL;
  const key = process.env.ASAAS_CRIAR_CLIENTE_WEBHOOK_KEY;
  if (!url || !key) {
    console.error("ASAAS_CRIAR_CLIENTE_WEBHOOK_URL/KEY não configurados");
    return null;
  }

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "X-Chat-Token": key },
      body: JSON.stringify({ nome, cnpjCpf: cnpjCpf ?? "", email: email ?? "" }),
    });
    if (!resp.ok) {
      console.error("Falha ao criar cliente no Asaas:", resp.status, await resp.text());
      return null;
    }
    const data = await resp.json();
    if (!data?.id) {
      console.error("Resposta do Asaas sem id:", data);
      return null;
    }
    return { id: data.id, name: data.name ?? nome, email: data.email ?? null, cpfCnpj: data.cpfCnpj ?? null };
  } catch (e) {
    console.error("Erro ao chamar webhook de criação de cliente Asaas:", e);
    return null;
  }
}
