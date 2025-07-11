import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: 'House number', required: false })
  @IsOptional()
  @IsString()
  house_number?: string;

  @ApiProperty({ description: 'Street name' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postal_code: string;

  @ApiProperty({ description: 'City name' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'INSEE code', required: false })
  @IsOptional()
  @IsString()
  insee_code?: string;

  @ApiProperty({ description: 'Latitude coordinate', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Whether this address is for delivery only', default: false })
  @IsOptional()
  @IsBoolean()
  onlyDelivery?: boolean;
} 