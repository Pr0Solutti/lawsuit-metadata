import { Body, Controller, Get, Post } from '@nestjs/common';
import { HistoryService } from './services/history.service';
import { QueueWorker } from './wokers/queue.wokers';
import { ListService } from './services/list.service';

@Controller('queue')
export class QueueController {
  constructor(
    private readonly queueWorker: QueueWorker,
    private readonly historyService: HistoryService,
    private readonly listService: ListService,
  ) {}

  @Get('teste')
  get() {
    console.log('ola');

    return this.listService.execute();
  }
  @Post('add')
  async addToQueue() {
    return this.queueWorker.process();
  }

  @Get('history')
  async getHistory(@Body() body: { tribunal: string; inicio: string }) {
    return this.historyService.execute(body.tribunal, body.inicio);
  }
}
