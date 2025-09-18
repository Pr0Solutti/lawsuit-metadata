import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    QueueModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({ name: 'lawsuit-database' }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL as string),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
