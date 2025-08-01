import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min, Max } from 'class-validator';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  restaurantId: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rate?: number;
} 