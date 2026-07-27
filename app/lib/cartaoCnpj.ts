export type DadosCartaoCnpj = {
  nome: string | null;
  cnpj: string | null;
  endereco: string | null;
};

function limparEspacos(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function acharIndiceLabel(linhas: string[], labels: string[], apartirDe = 0): number {
  for (let i = apartirDe; i < linhas.length; i++) {
    const upper = linhas[i].toUpperCase();
    if (labels.some((label) => upper.includes(label))) return i;
  }
  return -1;
}

function valorAposLabel(linhas: string[], labels: string[], apartirDe = 0, ateAntes = linhas.length): string | null {
  const idx = acharIndiceLabel(linhas, labels, apartirDe);
  if (idx === -1 || idx >= ateAntes) return null;

  const label = labels.find((l) => linhas[idx].toUpperCase().includes(l))!;
  const restoMesmaLinha = linhas[idx].toUpperCase().indexOf(label) + label.length;
  const sobra = linhas[idx].slice(restoMesmaLinha).replace(/^[:\-–]+/, "").trim();
  // Ignora sobra entre parênteses (ex: "TÍTULO DO ESTABELECIMENTO (NOME DE FANTASIA)")
  // — é parte do rótulo, não um valor inline.
  if (sobra && !/^\(.*\)$/.test(sobra)) return limparEspacos(sobra);

  for (let i = idx + 1; i < ateAntes; i++) {
    if (linhas[i].trim()) return limparEspacos(linhas[i]);
  }
  return null;
}

// Comprovante de Inscrição e de Situação Cadastral (Cartão CNPJ) da Receita Federal.
// Layout padronizado, mas a extração de texto de PDF pode variar a ordem de leitura —
// os valores retornados são sempre mostrados num formulário editável antes de salvar,
// nunca gravados direto.
export async function extrairDadosCartaoCnpj(buffer: Buffer): Promise<DadosCartaoCnpj> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const resultado = await parser.getText();
  const texto = resultado.text;
  const linhas = texto.split("\n").map((l) => l.trim());

  const cnpjMatch = texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
  const cnpj = cnpjMatch ? cnpjMatch[0] : null;

  // Nome fantasia costuma vir mascarado com asteriscos quando não está registrado —
  // nesse caso ignora e usa a razão social, que é sempre preenchida.
  const nomeFantasiaBruto = valorAposLabel(linhas, ["TÍTULO DO ESTABELECIMENTO", "TITULO DO ESTABELECIMENTO"]);
  const nomeFantasia = nomeFantasiaBruto && !/^\*+$/.test(nomeFantasiaBruto) ? nomeFantasiaBruto : null;
  const razaoSocial = valorAposLabel(linhas, ["NOME EMPRESARIAL"]);
  const nome = nomeFantasia || razaoSocial;

  // Bloco de endereço: tudo entre "LOGRADOURO" e o próximo campo fora do endereço
  // (evita casar "NÚMERO" com "NÚMERO DE INSCRIÇÃO", que aparece antes no documento).
  const inicioEndereco = acharIndiceLabel(linhas, ["LOGRADOURO"]);
  const fimEndereco =
    inicioEndereco === -1
      ? linhas.length
      : (() => {
          const fim = acharIndiceLabel(linhas, ["ENDEREÇO ELETRÔNICO", "ENDERECO ELETRONICO", "TELEFONE", "ENTE FEDERATIVO"], inicioEndereco + 1);
          return fim === -1 ? linhas.length : fim;
        })();

  const logradouro = inicioEndereco === -1 ? null : valorAposLabel(linhas, ["LOGRADOURO"], inicioEndereco, fimEndereco);
  const numero = inicioEndereco === -1 ? null : valorAposLabel(linhas, ["NÚMERO", "NUMERO"], inicioEndereco, fimEndereco);
  const complemento = inicioEndereco === -1 ? null : valorAposLabel(linhas, ["COMPLEMENTO"], inicioEndereco, fimEndereco);
  const bairro = inicioEndereco === -1 ? null : valorAposLabel(linhas, ["BAIRRO/DISTRITO", "BAIRRO"], inicioEndereco, fimEndereco);
  const municipio = inicioEndereco === -1 ? null : valorAposLabel(linhas, ["MUNICÍPIO", "MUNICIPIO"], inicioEndereco, fimEndereco);
  const uf = inicioEndereco === -1 ? null : valorAposLabel(linhas, ["UF"], inicioEndereco, fimEndereco);

  const cepBlocoTexto = inicioEndereco === -1 ? texto : linhas.slice(inicioEndereco, fimEndereco).join(" ");
  const cepMatch = cepBlocoTexto.match(/\d{2}\.?\d{3}-\d{3}/);
  const cep = cepMatch ? cepMatch[0] : null;

  const partesEndereco = [
    [logradouro, numero].filter(Boolean).join(", "),
    complemento,
    bairro,
    municipio && uf ? `${municipio}/${uf}` : municipio,
    cep ? `CEP ${cep}` : null,
  ].filter((p): p is string => Boolean(p));

  return {
    nome: nome ? limparEspacos(nome) : null,
    cnpj,
    endereco: partesEndereco.length ? partesEndereco.join(" - ") : null,
  };
}
