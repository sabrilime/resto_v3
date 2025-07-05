import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateFavouriteDto {
  @ApiProperty({ 
    description: 'The ID of the restaurant to favourite',
    example: 1
  })
  @IsNumber()
  @IsPositive()
  restaurantId: number;
} 