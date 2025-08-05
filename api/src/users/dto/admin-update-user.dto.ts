import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum, IsBoolean } from 'class-validator';

export class AdminUpdateUserDto {
  @ApiProperty({ description: 'The first name of the user', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'The last name of the user', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'The email address of the user', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'The password of the user', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'Role of the user', enum: ['user', 'admin'], required: false })
  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin';

  @ApiProperty({ description: 'Whether the user account is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 