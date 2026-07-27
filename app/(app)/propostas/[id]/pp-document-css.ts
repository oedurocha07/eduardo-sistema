export const PP_DOCUMENT_CSS = `
.pp-root {
  --pp-bg: #060606;
  --pp-surface: rgba(255, 255, 255, 0.035);
  --pp-surface-2: rgba(255, 255, 255, 0.055);
  --pp-fg: #f7f7f5;
  --pp-muted: rgba(247, 247, 245, 0.6);
  --pp-faint: rgba(247, 247, 245, 0.38);
  --pp-border: rgba(255, 255, 255, 0.14);
  --pp-border-soft: rgba(255, 255, 255, 0.08);
}

.pp-shell {
  position: relative;
  max-width: 860px;
  margin: 0 auto;
  padding: 56px 48px 72px;
  background: var(--pp-bg);
  color: var(--pp-fg);
  border-radius: 28px;
  border: 1px solid var(--pp-border);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.55;
}

.pp-heading {
  font-family: "Chillax", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.pp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--pp-faint);
}

.pp-eyebrow::before {
  content: "";
  width: 28px;
  height: 1px;
  background: var(--pp-muted);
}

.pp-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 28px;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--pp-border-soft);
}

.pp-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pp-brand-name {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.pp-brand-sub {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pp-faint);
}

.pp-meta {
  text-align: right;
  font-size: 0.72rem;
  color: var(--pp-muted);
  line-height: 1.6;
}

.pp-capa {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(240px, 0.8fr);
  gap: 32px;
  align-items: stretch;
  margin-bottom: 56px;
}

.pp-hero {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pp-title {
  margin-top: 22px;
  font-size: clamp(2rem, 4.2vw, 3.1rem);
  line-height: 1.05;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.pp-cliente {
  margin-top: 12px;
  font-size: 0.95rem;
  color: var(--pp-muted);
}

.pp-stats {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 36px;
}

.pp-stat {
  min-width: 100px;
  padding-left: 14px;
  border-left: 1px solid var(--pp-border);
}

.pp-stat-val {
  display: block;
  margin-bottom: 5px;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.pp-stat-label {
  display: block;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--pp-faint);
}

.pp-client-card {
  display: flex;
  flex-direction: column;
  padding: 26px;
  border-radius: 20px;
  border: 1px solid var(--pp-border);
  background: var(--pp-surface);
}

.pp-client-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--pp-border-soft);
}

.pp-numero-pill {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--pp-border);
  color: var(--pp-muted);
  white-space: nowrap;
}

.pp-client-info {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.pp-client-info .pp-field-label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--pp-faint);
}

.pp-client-info .pp-field-val {
  font-size: 0.95rem;
  font-weight: 700;
}

.pp-client-footer {
  margin-top: auto;
  padding-top: 20px;
  font-size: 0.72rem;
  line-height: 1.6;
  color: var(--pp-faint);
}

.pp-bloco {
  padding: 40px 0;
  border-top: 1px solid var(--pp-border-soft);
}

.pp-bloco:first-of-type {
  border-top: none;
}

.pp-section-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 24px;
}

.pp-section-num {
  font-size: 0.7rem;
  color: var(--pp-faint);
  letter-spacing: 0.1em;
}

.pp-section-title {
  font-size: 1.15rem;
  text-transform: uppercase;
}

.pp-section-desc {
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--pp-muted);
}

.pp-contexto {
  max-width: 68ch;
  white-space: pre-line;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--pp-fg);
}

.pp-contexto-abertura {
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 1.1rem;
}

.pp-itens {
  list-style: none;
  overflow: hidden;
  border: 1px solid var(--pp-border);
  border-radius: 20px;
  margin: 0;
  padding: 0;
}

.pp-item {
  padding: 18px 22px;
  border-bottom: 1px solid var(--pp-border-soft);
}

.pp-item:last-child {
  border-bottom: none;
}

.pp-item .desc {
  font-weight: 700;
  font-size: 0.95rem;
}

.pp-item .detalhe {
  display: block;
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--pp-muted);
}

.pp-investimento {
  margin-top: 20px;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid var(--pp-border);
  background: var(--pp-surface-2);
}

.pp-investimento .label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pp-faint);
}

.pp-investimento .num-total {
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.pp-investimento .num-total .por-mes {
  font-size: 1rem;
  font-weight: 400;
  color: var(--pp-muted);
}

.pp-investimento .parc,
.pp-investimento .cond {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--pp-muted);
  white-space: pre-line;
}

.pp-timeline {
  position: relative;
  list-style: none;
  display: grid;
  gap: 10px;
  padding-left: 22px;
  margin: 0;
}

.pp-timeline::before {
  content: "";
  position: absolute;
  left: 3px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--pp-border);
}

.pp-etapa {
  position: relative;
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  padding: 16px 20px;
  border: 1px solid var(--pp-border);
  border-radius: 16px;
  background: var(--pp-surface);
}

.pp-etapa::before {
  content: "";
  position: absolute;
  left: -22px;
  top: 22px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--pp-fg);
}

.pp-etapa .prazo {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pp-faint);
}

.pp-etapa .nome {
  font-weight: 700;
  font-size: 0.92rem;
}

.pp-rodape {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  padding-top: 36px;
  margin-top: 8px;
  border-top: 1px solid var(--pp-border-soft);
}

.pp-rodape .validade {
  max-width: 420px;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--pp-faint);
}

.pp-rodape .assinatura {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: right;
}

@media (max-width: 720px) {
  .pp-shell {
    padding: 36px 22px 48px;
    border-radius: 20px;
  }
  .pp-capa {
    grid-template-columns: 1fr;
  }
  .pp-etapa {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .pp-rodape {
    flex-direction: column;
    align-items: flex-start;
  }
  .pp-rodape .assinatura {
    text-align: left;
  }
}
`;
