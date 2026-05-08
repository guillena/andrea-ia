import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompetencyDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: ['cognitiva', 'conductual', 'comunicacion'] })
  @IsString() dimension: string;
  @ApiProperty() @IsNumber() @Min(0.5) @Max(2) weight: number;
  @ApiProperty() @IsBoolean() isActive: boolean;
}

export class UpdateCompetenciesDto {
  @ApiProperty({ type: [CompetencyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetencyDto)
  competencies: CompetencyDto[];
}
