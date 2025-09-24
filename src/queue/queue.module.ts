import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metadata } from './entites/metadate.entity';
import { QueueProcessor } from './processor/queue.processor';
import { QueueController } from './queue.controller';
import { HistoryService } from './services/history.service';
import { ListService } from './services/list.service';
import { QueueWorker } from './wokers/queue.wokers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Metadata]),
    BullModule.registerQueue({ name: 'lawsuit-database' }),
  ],
  controllers: [QueueController],
  providers: [QueueWorker, QueueProcessor, HistoryService, ListService],
})
export class QueueModule {}
