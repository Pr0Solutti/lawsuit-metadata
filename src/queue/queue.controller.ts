import { Controller, Post, Body, Get } from '@nestjs/common';
import { QueueWorker } from './wokers/queue.wokers';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueWorker: QueueWorker) {}

  @Post('add')
  async addToQueue() {
    return this.queueWorker.process();
  }
  @Get('add')
  get() {
    return { message: 'ok' };
  }
}
