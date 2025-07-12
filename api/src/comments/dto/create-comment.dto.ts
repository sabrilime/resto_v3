import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsNumber, IsPositive, IsOptional, Min, Max } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ 
    description: 'The content of the comment',
    example: 'Great food and excellent service!',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @ApiProperty({ 
    description: 'The ID of the restaurant the comment is about',
    example: 1
  })
  @IsNumber()
  @IsPositive()
  restaurantId: number;

  @ApiProperty({ 
    description: 'The rating given by the user (1-5)',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rate?: number;
} 