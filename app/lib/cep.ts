"use server";

export type EnderecoCep = {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
};

// ViaCEP (viacep.com.br/ws/{cep}/json/) — serviço público gratuito de consulta de CEP.
export async function buscarEnderecoPorCep(cepRaw: string): Promise<EnderecoCep | null> {
  const cep = cepRaw.replace(/\D/g, "");
  if (cep.length !== 8) return null;

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.erro) return null;

    return {
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      uf: data.uf ?? "",
    };
  } catch (e) {
    console.error("Erro ao consultar CEP:", e);
    return null;
  }
}
