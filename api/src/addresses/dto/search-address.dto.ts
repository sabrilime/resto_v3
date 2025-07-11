import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class SearchAddressDto {
  @ApiProperty({ description: 'Search query for address (postal code, city, street)', example: '75001 Paris' })
  @IsString()
  @MinLength(3)
  query: string;

  @ApiProperty({ description: 'Maximum number of results to return', required: false, default: 10 })
  @IsOptional()
  limit?: number = 10;
} 