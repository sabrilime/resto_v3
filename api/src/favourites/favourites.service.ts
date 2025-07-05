import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favourite } from './entities/favourite.entity';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(Favourite)
    private favouriteRepository: Repository<Favourite>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(userId: number, createFavouriteDto: CreateFavouriteDto): Promise<Favourite> {
    // Check if restaurant exists
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: createFavouriteDto.restaurantId }
    });
    
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${createFavouriteDto.restaurantId} not found`);
    }

    // Check if favourite already exists
    const existingFavourite = await this.favouriteRepository.findOne({
      where: { userId, restaurantId: createFavouriteDto.restaurantId }
    });

    if (existingFavourite) {
      throw new ConflictException('Restaurant is already in favourites');
    }

    const favourite = this.favouriteRepository.create({
      userId,
      restaurantId: createFavouriteDto.restaurantId,
    });

    return await this.favouriteRepository.save(favourite);
  }

  async findAllByUser(userId: number): Promise<Favourite[]> {
    return await this.favouriteRepository.find({
      where: { userId },
      relations: ['restaurant'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number, userId: number): Promise<Favourite> {
    const favourite = await this.favouriteRepository.findOne({
      where: { id, userId },
      relations: ['restaurant']
    });
    
    if (!favourite) {
      throw new NotFoundException(`Favourite with ID ${id} not found`);
    }
    
    return favourite;
  }

  async remove(id: number, userId: number): Promise<void> {
    const favourite = await this.findOne(id, userId);
    await this.favouriteRepository.remove(favourite);
  }

  async removeByRestaurant(userId: number, restaurantId: number): Promise<void> {
    const favourite = await this.favouriteRepository.findOne({
      where: { userId, restaurantId }
    });
    
    if (!favourite) {
      throw new NotFoundException('Favourite not found');
    }
    
    await this.favouriteRepository.remove(favourite);
  }

  async isFavourited(userId: number, restaurantId: number): Promise<boolean> {
    const favourite = await this.favouriteRepository.findOne({
      where: { userId, restaurantId }
    });
    
    return !!favourite;
  }
} 