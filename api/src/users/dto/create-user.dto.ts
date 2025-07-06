import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The first name of the user' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'The email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'The Google ID of the user' })
  @IsOptional()
  readonly googleId?: string;

  @ApiProperty({ description: 'The provider of the user' })
  @IsOptional()
  readonly provider?: string;
} 