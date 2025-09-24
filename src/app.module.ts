import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from './queue/queue.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_MYSQL_HOST,
      port: Number(process.env.DATABASE_MYSQL_PORT),
      username: process.env.DATABASE_MYSQL_USER,
      password: process.env.DATABASE_MYSQL_PASSWORD,
      database: process.env.DATABASE_MYSQL_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: true,
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
