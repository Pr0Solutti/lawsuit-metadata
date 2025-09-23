import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Metadata } from '../entites/metadate.entity';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(Metadata)
    private readonly metadataRepo: Repository<Metadata>,
  ) {}
  async execute() {
    const results = await this.metadataRepo.find({
      order: { dataAjuizamento: 'ASC' },
    });

    return results;
  }
}
