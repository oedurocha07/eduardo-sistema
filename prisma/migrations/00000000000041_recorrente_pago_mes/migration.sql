CREATE TABLE "RecorrentePagoMes" (
    "id" TEXT NOT NULL,
    "clienteRecorrenteId" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecorrentePagoMes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RecorrentePagoMes_clienteRecorrenteId_mes_key" ON "RecorrentePagoMes"("clienteRecorrenteId", "mes");

ALTER TABLE "RecorrentePagoMes" ADD CONSTRAINT "RecorrentePagoMes_clienteRecorrenteId_fkey" FOREIGN KEY ("clienteRecorrenteId") REFERENCES "ClienteRecorrente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
