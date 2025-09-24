import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Metadata } from 'src/queue/entites/metadate.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FindLawsuitService {
  constructor(
    @InjectRepository(Metadata)
    private readonly metadataRepository: Repository<Metadata>,
  ) {}

  async execute(numero: string) {
    return await this.metadataRepository.findOne({ where: { numero } });
  }
}
