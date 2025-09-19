import { Body, Controller, Get, Post } from '@nestjs/common';
import { HistoryService } from './services/history.service';
import { QueueWorker } from './wokers/queue.wokers';

@Controller('queue')
export class QueueController {
  constructor(
    private readonly queueWorker: QueueWorker,
    private readonly historyService: HistoryService,
  ) {}

  @Post('add')
  async addToQueue() {
    return this.queueWorker.process();
  }
  @Get('add')
  get() {
    return { message: 'ok' };
  }
  @Get('history')
  async getHistory(@Body() body: { tribunal: string }) {
    console.log(body);

    return this.historyService.execute(body.tribunal);
  }
}
