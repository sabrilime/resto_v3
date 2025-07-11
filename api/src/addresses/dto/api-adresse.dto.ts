import { ApiProperty } from '@nestjs/swagger';

export class ApiAdresseFeatureDto {
  @ApiProperty({ description: 'Address type (housenumber, street, locality, municipality)' })
  type: string;

  @ApiProperty({ description: 'Address geometry' })
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };

  @ApiProperty({ description: 'Address properties' })
  properties: {
    label: string;
    score: number;
    housenumber?: string;
    id: string;
    name: string;
    postcode: string;
    citycode: string;
    x: number;
    y: number;
    city: string;
    district?: string;
    context: string;
    type: string;
    importance: number;
    street?: string;
    house_number?: string;
    locality?: string;
    municipality?: string;
  };
}

export class ApiAdresseSearchResponseDto {
  @ApiProperty({ description: 'List of addresses found' })
  features: ApiAdresseFeatureDto[];

  @ApiProperty({ description: 'Search query used' })
  query: string;

  @ApiProperty({ description: 'Number of results' })
  limit: number;
} 