import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FavouritesService } from './favourites.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { Favourite } from './entities/favourite.entity';

@ApiTags('favourites')
@ApiBearerAuth()
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a restaurant to favourites' })
  @ApiResponse({ status: 201, description: 'Restaurant added to favourites', type: Favourite })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiResponse({ status: 409, description: 'Restaurant is already in favourites' })
  create(@Request() req, @Body() createFavouriteDto: CreateFavouriteDto): Promise<Favourite> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.favouritesService.create(userId, createFavouriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all favourites for the current user' })
  @ApiResponse({ status: 200, description: 'List of user favourites', type: [Favourite] })
  findAll(@Request() req): Promise<Favourite[]> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.favouritesService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific favourite by ID' })
  @ApiParam({ name: 'id', description: 'Favourite ID' })
  @ApiResponse({ status: 200, description: 'Favourite found', type: Favourite })
  @ApiResponse({ status: 404, description: 'Favourite not found' })
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<Favourite> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.favouritesService.findOne(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a restaurant from favourites' })
  @ApiParam({ name: 'id', description: 'Favourite ID' })
  @ApiResponse({ status: 200, description: 'Favourite removed successfully' })
  @ApiResponse({ status: 404, description: 'Favourite not found' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.favouritesService.remove(id, userId);
  }

  @Delete('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Remove a restaurant from favourites by restaurant ID' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Favourite removed successfully' })
  @ApiResponse({ status: 404, description: 'Favourite not found' })
  removeByRestaurant(@Request() req, @Param('restaurantId', ParseIntPipe) restaurantId: number): Promise<void> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.favouritesService.removeByRestaurant(userId, restaurantId);
  }

  @Get('check/:restaurantId')
  @ApiOperation({ summary: 'Check if a restaurant is favourited by the current user' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Favourite status', schema: { type: 'boolean' } })
  checkFavourite(@Request() req, @Param('restaurantId', ParseIntPipe) restaurantId: number): Promise<boolean> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.favouritesService.isFavourited(userId, restaurantId);
  }
} 