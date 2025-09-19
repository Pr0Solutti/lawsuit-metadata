// pje.service.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import * as dayjs from 'dayjs';
dayjs().format();

@Injectable()
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    @InjectQueue('lawsuit-database') private readonly pjeQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async execute() {
    const ontem = dayjs().subtract(1, 'day');
    const start = ontem.startOf('day').toISOString();
    const end = ontem.endOf('day').toISOString();

    const trts = [1];
    this.logger.log(`🕒 Agendando consulta de ${start} até ${end}`);

    for (const trt of trts) {
      await this.pjeQueue.add(
        'consulta-diaria',
        { tribunal: `trt${trt}`, start, end },
        {
          jobId: `consulta-diaria-trt${trt}-${ontem.format('YYYY-MM-DD')}`,
          attempts: 3,
          backoff: { type: 'fixed', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }
  }
}
