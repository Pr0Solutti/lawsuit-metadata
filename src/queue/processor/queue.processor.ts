// pje.service.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';

@Injectable()
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    @InjectQueue('lawsuit-database') private readonly pjeQueue: Queue,
  ) {}

  // @Cron(CronExpression.EVERY_10_SECONDS)
  async execute() {
    const trts = [1];
    this.logger.log(`🕒 Agendando consulta para processo`);
    for (const trt of trts) {
      await this.pjeQueue.add(
        'consulta-diaria',
        {
          tribunal: `trt${trt}`,
        },
        {
          jobId: `consulta-diaria-trt${trt}`, // evita jobs duplicados
          attempts: 3, // até 3 tentativas
          backoff: { type: 'fixed', delay: 5000 }, // espera 5s antes de tentar de novo
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    // return { status: 'enfileirado', numero, origem };
  }
}
