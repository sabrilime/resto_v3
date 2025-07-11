import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiAdresseService } from './api-adresse.service';
import { ApiAdresseFeatureDto } from './dto/api-adresse.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
    private apiAdresseService: ApiAdresseService,
  ) {}

  create(createAddressDto: CreateAddressDto) {
    console.log('[AddressesService.create] DTO:', createAddressDto);
    const address = this.addressesRepository.create(createAddressDto);
    console.log('[AddressesService.create] Created entity:', address);
    return this.addressesRepository.save(address);
  }

  findAll() {
    return this.addressesRepository.find();
  }

  findOne(id: number) {
    return this.addressesRepository.findOne({ where: { id } });
  }

  update(id: number, updateAddressDto: UpdateAddressDto) {
    return this.addressesRepository.update(id, updateAddressDto);
  }

  remove(id: number) {
    return this.addressesRepository.delete(id);
  }

  async searchAddresses(query: string, limit: number = 10): Promise<ApiAdresseFeatureDto[]> {
    return await this.apiAdresseService.searchAddresses(query, limit);
  }

  async getAddressFromApiAdresse(id: string): Promise<ApiAdresseFeatureDto> {
    return await this.apiAdresseService.getAddressById(id);
  }

  async createFromApiAdresse(apiAdresseId: string): Promise<Address> {
    console.log('[createFromApiAdresse] Start', { apiAdresseId });
    try {
      const apiAdresseFeature = await this.apiAdresseService.getAddressById(apiAdresseId);
      console.log('[createFromApiAdresse] API Adresse feature:', apiAdresseFeature);
      const createAddressDto = this.apiAdresseService.convertToCreateAddressDto(apiAdresseFeature);
      console.log('[createFromApiAdresse] Converted DTO:', createAddressDto);
      const address = await this.create(createAddressDto);
      console.log('[createFromApiAdresse] Saved address:', address);
      return address;
    } catch (error) {
      console.error('[createFromApiAdresse] Error:', error);
      throw error;
    }
  }

  // New method to create address directly from feature data
  async createFromFeature(feature: any): Promise<Address> {
    console.log('[createFromFeature] Start', { feature });
    try {
      const createAddressDto = this.apiAdresseService.convertToCreateAddressDto(feature);
      console.log('[createFromFeature] Converted DTO:', createAddressDto);
      const address = await this.create(createAddressDto);
      console.log('[createFromFeature] Saved address:', address);
      return address;
    } catch (error) {
      console.error('[createFromFeature] Error:', error);
      throw error;
    }
  }

  async searchByCoordinates(lat: number, lon: number, limit: number = 10): Promise<ApiAdresseFeatureDto[]> {
    return await this.apiAdresseService.searchByCoordinates(lat, lon, limit);
  }
} 