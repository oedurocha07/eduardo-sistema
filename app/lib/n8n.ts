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
