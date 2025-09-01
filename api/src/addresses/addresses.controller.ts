import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { SearchAddressDto } from './dto/search-address.dto';
import { ApiAdresseFeatureDto } from './dto/api-adresse.dto';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully', type: Address })
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({ status: 200, description: 'List of addresses', type: [Address] })
  findAll() {
    return this.addressesService.findAll();
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get all unique cities from addresses' })
  @ApiResponse({ status: 200, description: 'List of unique cities', type: [String] })
  getAllCities() {
    return this.addressesService.getAllCities();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an address by id' })
  @ApiResponse({ status: 200, description: 'Address found', type: Address })
  findOne(@Param('id') id: string) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new BadRequestException('Invalid address ID');
    }
    return this.addressesService.findOne(numId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressesService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  remove(@Param('id') id: string) {
    return this.addressesService.remove(+id);
  }

  @Get('search/api-adresse')
  @ApiOperation({ summary: 'Search addresses using API Adresse (French government)' })
  @ApiResponse({ status: 200, description: 'Addresses found', type: [ApiAdresseFeatureDto] })
  searchApiAdresse(@Query() searchDto: SearchAddressDto) {
    return this.addressesService.searchAddresses(searchDto.query, searchDto.limit);
  }

  @Get('api-adresse/:id')
  @ApiOperation({ summary: 'Get address details from API Adresse' })
  @ApiResponse({ status: 200, description: 'Address details found', type: ApiAdresseFeatureDto })
  getApiAdresseAddress(@Param('id') id: string) {
    return this.addressesService.getAddressFromApiAdresse(id);
  }

  @Post('api-adresse/:id')
  @ApiOperation({ summary: 'Create address from API Adresse data' })
  @ApiResponse({ status: 201, description: 'Address created from API Adresse data', type: Address })
  createFromApiAdresse(@Param('id') id: string) {
    return this.addressesService.createFromApiAdresse(id);
  }

  @Post('from-feature')
  @ApiOperation({ summary: 'Create address from API Adresse feature data' })
  @ApiResponse({ status: 201, description: 'Address created from feature data', type: Address })
  createFromFeature(@Body() feature: any) {
    console.log('[AddressesController.createFromFeature] Received feature:', feature);
    console.log('[AddressesController.createFromFeature] Coordinates:', feature.geometry?.coordinates);
    return this.addressesService.createFromFeature(feature);
  }

  @Get('search/coordinates')
  @ApiOperation({ summary: 'Search addresses by coordinates (reverse geocoding)' })
  @ApiResponse({ status: 200, description: 'Addresses found by coordinates', type: [ApiAdresseFeatureDto] })
  searchByCoordinates(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('limit') limit: string = '10'
  ) {
    return this.addressesService.searchByCoordinates(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(limit)
    );
  }
} 