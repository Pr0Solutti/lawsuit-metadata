import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Metadata } from 'src/queue/entites/metadate.entity';
import { LawsuitController } from './lawsuit.controller';
import { FindLawsuitService } from './services/find.service';

@Module({
  imports: [TypeOrmModule.forFeature([Metadata])],
  controllers: [LawsuitController],
  providers: [FindLawsuitService],
})
export class LawsuitModule {}
