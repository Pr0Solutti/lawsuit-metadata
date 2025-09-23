import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import * as dayjs from 'dayjs';
dayjs().format();

@Injectable()
export class HistoryService {
  constructor(
    @InjectQueue('lawsuit-database') private readonly pjeQueue: Queue,
  ) {}

  async execute(tribunal: string, start?: string) {
    const inicio = dayjs(start);
    const fim = dayjs();

    // Calcula o número total de meses entre inicio e fim
    const totalMonths = fim.diff(inicio, 'month') + 1;

    // Gera um array de meses e cria os jobs em paralelo
    const jobs = Array.from({ length: totalMonths }, (_, i) => {
      const month = inicio.add(i, 'month');
      const start = month.startOf('month').toISOString();
      const end = month.endOf('month').toISOString();

      return this.pjeQueue.add('consulta-historico', { tribunal, start, end });
    });

    await Promise.all(jobs);

    return { message: `Enfileirados ${jobs.length} meses de histórico.` };
  }
}
