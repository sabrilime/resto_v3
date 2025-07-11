import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ApiAdresseFeatureDto, ApiAdresseSearchResponseDto } from './dto/api-adresse.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class ApiAdresseService {
  private readonly baseUrl = 'https://api-adresse.data.gouv.fr';

  async searchAddresses(query: string, limit: number = 10): Promise<ApiAdresseFeatureDto[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/?q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new HttpException(
          `API Adresse error: ${response.status} ${response.statusText}`,
          HttpStatus.BAD_REQUEST
        );
      }

      const data: ApiAdresseSearchResponseDto = await response.json();
      return data.features || [];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to search addresses',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAddressById(id: string): Promise<ApiAdresseFeatureDto> {
    try {
      // Since we can't directly get by ID, we'll search using the ID as a query
      // This is a fallback approach - ideally we should pass the full address data
      const response = await fetch(`${this.baseUrl}/search/?q=${encodeURIComponent(id)}&limit=1`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new HttpException(
          `API Adresse error: ${response.status} ${response.statusText}`,
          HttpStatus.BAD_REQUEST
        );
      }

      const data: ApiAdresseSearchResponseDto = await response.json();
      if (data.features.length === 0) {
        throw new HttpException('Address not found', HttpStatus.NOT_FOUND);
      }

      return data.features[0];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get address details',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // New method to create address directly from feature data
  createAddressFromFeature(feature: ApiAdresseFeatureDto): CreateAddressDto {
    return this.convertToCreateAddressDto(feature);
  }

  convertToCreateAddressDto(apiAdresseFeature: ApiAdresseFeatureDto): CreateAddressDto {
    const props = apiAdresseFeature.properties;
    const [longitude, latitude] = apiAdresseFeature.geometry.coordinates;

    console.log('[convertToCreateAddressDto] Raw coordinates:', apiAdresseFeature.geometry.coordinates);
    console.log('[convertToCreateAddressDto] Latitude:', latitude, 'type:', typeof latitude);
    console.log('[convertToCreateAddressDto] Longitude:', longitude, 'type:', typeof longitude);

    // Ensure coordinates are numbers
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : Number(latitude);
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : Number(longitude);

    console.log('[convertToCreateAddressDto] Converted lat:', lat, 'lng:', lng);

    return {
      house_number: props.house_number || props.housenumber,
      street: props.street || props.name,
      postal_code: props.postcode,
      city: props.city,
      insee_code: props.citycode,
      latitude: lat,
      longitude: lng,
      onlyDelivery: false,
    };
  }

  async searchByCoordinates(lat: number, lon: number, limit: number = 10): Promise<ApiAdresseFeatureDto[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/reverse/?lat=${lat}&lon=${lon}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new HttpException(
          `API Adresse error: ${response.status} ${response.statusText}`,
          HttpStatus.BAD_REQUEST
        );
      }

      const data: ApiAdresseSearchResponseDto = await response.json();
      return data.features || [];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to search addresses by coordinates',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 