import { IsString, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Campaña Atención al Cliente Q1' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobPositionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  linkExpiryDays?: number;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: ['active', 'paused', 'closed'] })
  @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(30) linkExpiryDays?: number;
}
