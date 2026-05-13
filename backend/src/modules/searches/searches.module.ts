import { Module } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { SearchesController } from './searches.controller';

@Module({
  providers: [SearchesService],
  controllers: [SearchesController],
  exports: [SearchesService],
})
export class SearchesModule {}
