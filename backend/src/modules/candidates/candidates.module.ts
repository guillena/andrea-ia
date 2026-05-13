import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { EmailService } from '../../services/email.service';
import { PdfService } from './pdf.service';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [EvaluationModule],
  providers: [CandidatesService, EmailService, PdfService],
  controllers: [CandidatesController],
  exports: [CandidatesService],
})
export class CandidatesModule {}
