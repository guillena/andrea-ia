import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { EmailService } from '../../services/email.service';

@Module({
  providers: [CandidatesService, EmailService],
  controllers: [CandidatesController],
  exports: [CandidatesService],
})
export class CandidatesModule {}
