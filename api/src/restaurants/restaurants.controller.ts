import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { AuthGuard } from '@nestjs/passport';
import { ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully', type: Restaurant })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @Request() req
  ) {
    console.log('req.user:', req.user);
    console.log('req.user.userId:', req.user?.userId);
    
    // Overwrite postedByUserId with the authenticated user's id
    createRestaurantDto.postedByUserId = req.user.userId; // Changed from req.user.id to req.user.userId
    
    console.log('After setting postedByUserId:', createRestaurantDto.postedByUserId);
    
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiQuery({ name: 'specialityId', description: 'Filter by speciality ID', required: false })
  @ApiResponse({ status: 200, description: 'List of restaurants', type: [Restaurant] })
  findAll(@Query('specialityId') specialityId?: string): Promise<Restaurant[]> {
    if (specialityId) {
      return this.restaurantsService.findBySpeciality(parseInt(specialityId));
    }
    return this.restaurantsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search restaurants by name or description' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results', type: [Restaurant] })
  search(@Query('q') query: string): Promise<Restaurant[]> {
    return this.restaurantsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by ID' })
  @ApiResponse({ status: 200, description: 'Restaurant found', type: Restaurant })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Restaurant> {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a restaurant' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully', type: Restaurant })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    console.log('Controller received update request for restaurant:', id);
    console.log('Update data:', updateRestaurantDto);
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a restaurant (soft delete)' })
  @ApiResponse({ status: 200, description: 'Restaurant deleted successfully', schema: { type: 'object', properties: { message: { type: 'string' } } } })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    console.log('Controller received delete request for restaurant:', id);
    try {
      await this.restaurantsService.remove(id);
      return { message: 'Restaurant deleted successfully' };
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  }
} 