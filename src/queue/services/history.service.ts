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
  async execute(tribunal: string) {
    const inicio = dayjs('2025-01-01');
    const fim = dayjs();
    let cursor = inicio;
    let totalJobs = 0;
    while (cursor.isBefore(fim)) {
      const start = cursor.startOf('month').toISOString();
      const end = cursor.endOf('month').toISOString();

      await this.pjeQueue.add('consulta-historico', {
        tribunal,
        start,
        end,
      });
      totalJobs++;
      cursor = cursor.add(1, 'month');
    }
    return { message: `Enfileirados ${totalJobs} meses de histórico.` };
  }
}
