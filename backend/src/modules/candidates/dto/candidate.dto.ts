import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'María' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'González' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'maria@gmail.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiPropertyOptional({ example: '+54 11 1234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsUUID()
  campaignId: string;
}

export class CandidateDecisionDto {
  @ApiProperty({ enum: ['recommended', 'review', 'not_recommended'] })
  @IsString()
  decision: 'recommended' | 'review' | 'not_recommended';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
