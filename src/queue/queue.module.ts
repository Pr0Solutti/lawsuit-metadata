import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueProcessor } from './processor/queue.processor';
import { QueueController } from './queue.controller';
import { Lawsuit, LawsuitSchema } from './schema/metadata.shcmea';
import { QueueWorker } from './wokers/queue.wokers';
import { HistoryService } from './services/history.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'lawsuit-database' }),
    MongooseModule.forFeature([
      {
        name: Lawsuit.name,
        schema: LawsuitSchema,
      },
    ]),
  ],
  controllers: [QueueController],
  providers: [QueueWorker, QueueProcessor, HistoryService],
})
export class QueueModule {}
