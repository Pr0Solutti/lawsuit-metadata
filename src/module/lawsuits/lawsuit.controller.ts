import { Controller, Get, Param } from '@nestjs/common';
import { FindLawsuitService } from './services/find.service';

@Controller('lawsuits')
export class LawsuitController {
  constructor(private readonly findLawsuitService: FindLawsuitService) {}

  @Get(':numero')
  findOne(@Param('numero') numero: string) {
    return this.findLawsuitService.execute(numero);
  }
}
