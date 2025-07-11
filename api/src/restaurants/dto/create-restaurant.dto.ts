import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUrl, Min, Max, IsBoolean, IsArray } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'The name of the restaurant' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the restaurant', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Image URL of the restaurant', required: false })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({ description: 'Instagram handle of the restaurant', required: false })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ description: 'Whether the restaurant is halal', default: false })
  @IsOptional()
  @IsBoolean()
  halal?: boolean;

  @ApiProperty({ description: 'Whether the restaurant is delivery only', default: false })
  @IsOptional()
  @IsBoolean()
  onlyDelivery?: boolean;

  @ApiProperty({ description: 'Average rating of the restaurant', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'ID of the user who posted the restaurant', required: false })
  @IsOptional()
  @IsNumber()
  postedByUserId?: number;

  @ApiProperty({ description: 'ID of the restaurant address', required: false })
  @IsOptional()
  @IsNumber()
  addressId?: number;

  @ApiProperty({ description: 'Array of speciality IDs', type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  specialityIds?: number[];
} 