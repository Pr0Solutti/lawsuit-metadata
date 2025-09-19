import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { IDATAJUD, Processo } from '../interfaces';
import { Lawsuit } from '../schema/metadata.shcmea';

@Processor('lawsuit-database', { concurrency: 1, lockDuration: 600000 }) // paralelo
export class QueueWorker extends WorkerHost {
  private readonly logger = new Logger(QueueWorker.name);
  constructor(
    @InjectModel(Lawsuit.name)
    private readonly metadataModel: Model<Lawsuit>,
  ) {
    super();
  }
  async process(
    job?: Job<{ tribunal?: string; start?: string; end?: string }>,
  ) {
    this.logger.log(
      `📄 Consultando processos de ${job?.data.start} até ${job?.data.end}`,
    );

    let pagination: any[] | null = [];
    let count = 0;

    while (pagination !== null) {
      count++;
      this.logger.debug(`🚀 Loop ${count}`);

      const delayMs = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
      await new Promise((r) => setTimeout(r, delayMs));

      const response = await axios.post<IDATAJUD>(
        `${process.env.BASE_URL_DATAJUD}/api_publica_${job?.data.tribunal}/_search`,
        {
          size: 100,
          query: {
            bool: {
              must: [
                {
                  range: {
                    dataAjuizamento: {
                      gte: job?.data.start,
                      lte: job?.data.end,
                    },
                  },
                },
              ],
            },
          },
          sort: [{ dataAjuizamento: { order: 'asc' } }],
          ...(pagination.length > 0 && { search_after: pagination }),
        },
        { headers: { Authorization: process.env.TOKEN_DATAJUD } },
      );

      const data: Processo[] = response.data.hits.hits;
      if (!data.length) {
        pagination = null;
        break;
      }

      const listProcess = data.map((item) => ({
        numero: this.formatCNJ(item._source.numeroProcesso),
        classe: item._source.classe.nome,
        tribunal: item._source.tribunal,
        dataAjuizamento: item._source.dataAjuizamento,
        sigilo: item._source.nivelSigilo,
        assuntos: item._source.assuntos.map((assunto) => assunto.nome),
        orgaojulgador: item._source.orgaoJulgador.nome,
      }));

      const bulkOps = listProcess.map((processo) => ({
        updateOne: {
          filter: { numero: processo.numero },
          update: { $set: processo },
          upsert: true,
        },
      }));
      await this.metadataModel.bulkWrite(bulkOps);

      pagination = data.at(-1)?.sort || null;
    }
  }

  formatCNJ(numero: string): string {
    // garantir que só tenha dígitos
    numero = numero.replace(/\D/g, '');

    if (numero.length !== 20) {
      throw new Error('O número do processo deve ter exatamente 20 dígitos.');
    }

    const sequencial = numero.substring(0, 7);
    const digito = numero.substring(7, 9);
    const ano = numero.substring(9, 13);
    const justica = numero.substring(13, 14);
    const tribunal = numero.substring(14, 16);
    const origem = numero.substring(16, 20);

    return `${sequencial}-${digito}.${ano}.${justica}.${tribunal}.${origem}`;
  }
}
