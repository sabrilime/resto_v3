import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsNumber, IsPositive, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  restaurantId: number;

  @ApiProperty({ 
    description: 'The rating given by the user (1-5)',
    example: 5,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rate?: number;

  @ApiProperty({ 
    description: 'URL or path to the comment image',
    example: 'https://example.com/image.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  image?: string;
} 