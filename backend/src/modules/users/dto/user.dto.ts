import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsEmail() email: string;

  @ApiProperty({ enum: [UserRole.recruiter, UserRole.viewer, UserRole.admin_empresa] })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ default: 'Temp1234!' })
  @IsOptional() @IsString() @MinLength(8)
  temporaryPassword?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional() @IsString() status?: string;
}

export class ChangePasswordDto {
  @ApiProperty() @IsString() @MinLength(6) currentPassword: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword: string;
}
