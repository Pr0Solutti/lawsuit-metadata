import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { Metadata } from '../entites/metadate.entity';
import { IDATAJUD, Processo } from '../interfaces';

@Processor('lawsuit-database', { lockDuration: 600000 }) // paralelo
export class QueueWorker extends WorkerHost {
  private readonly logger = new Logger(QueueWorker.name);
  constructor(
    @InjectRepository(Metadata)
    private readonly metadataRepo: Repository<Metadata>,
  ) {
    super();
  }
  async process(
    job?: Job<{ tribunal?: string; start?: string; end?: string }>,
  ) {
    this.logger.log(
      `📄 Consultando processos no tribunal ${job?.data.tribunal} de ${job?.data.start} até ${job?.data.end}`,
    );

    let pagination: any[] | null = [];
    let count = 0;

    while (pagination !== null) {
      count++;
      this.logger.debug(`🚀 Loop ${count}`);
      this.logger.debug(
        `Consultando de ${job?.data.start} até ${job?.data.end}`,
      );
      try {
        const delayMs = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
        await new Promise((r) => setTimeout(r, delayMs));

        const response = await axios.post<IDATAJUD>(
          `${process.env.BASE_URL_DATAJUD}/api_publica_${job?.data.tribunal}/_search`,
          {
            size: 5000,
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
          orgaoJulgador: item._source.orgaoJulgador?.nome || undefined,
        }));

        // Salvar ou atualizar processos usando TypeORM (SQL)
        if (listProcess.length > 0) {
          await this.metadataRepo.upsert(listProcess, ['numero']);
        }

        // The line below was commented out, causing the infinite loop.
        // It must be uncommented to update the pagination and prevent the loop.
        pagination = data.at(-1)?.sort || null;
      } catch (error) {
        this.logger.error(`Erro na consulta: ${error}`);
        pagination = null;
      }
    }
    this.logger.debug('Consulta finalizada.');
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
