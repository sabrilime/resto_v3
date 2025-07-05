import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUrl, Min, Max } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'The name of the restaurant' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the restaurant', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The address of the restaurant' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Phone number of the restaurant', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Website URL of the restaurant', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Latitude coordinate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ description: 'Average rating of the restaurant', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
} 