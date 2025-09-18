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
  async process(job?: Job<{ tribunal?: string }>) {
    this.logger.log(`📄 Consultando processo`);
    let pagination: any[] | null = []; // inicia vazio
    let count = 0;
    while (pagination) {
      count++;
      console.log(`🚀 Loop ${count}`);

      const delayMs = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000; // 1 a 3s
      this.logger.debug(`⏱ Delay de ${delayMs}ms antes de dar inicio`);
      const response = await axios.post<IDATAJUD>(
        `${process.env.BASE_URL_DATAJUD}/api_publica_trt1/_search`,
        {
          size: 10,
          query: {
            bool: {
              must: [
                {
                  range: {
                    dataAjuizamento: {
                      gte: '2025-01-22T00:00:00.000Z',
                      lte: '2025-01-22T23:59:59.999Z',
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
      const listProcess = data.map((item) => {
        return {
          numero: this.formatCNJ(item._source.numeroProcesso),
          classe: item._source.classe.nome,
          tribunal: item._source.tribunal,
          dataAjuizamento: item._source.dataAjuizamento,
          sigilo: item._source.nivelSigilo,
          assuntos: item._source.assuntos.map((assunto) => assunto.nome),
          orgaojulgador: item._source.orgaoJulgador.nome,
        };
      });
      await this.metadataModel.create(listProcess);
      // console.log('listProcess', listProcess);

      if (data.length !== 0) {
        pagination = null; // encerra loop
        break;
      }

      // pega o último sort para próxima paginação
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
