import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = this.restaurantRepository.create(createRestaurantDto);
    return await this.restaurantRepository.save(restaurant);
  }

  async findAll(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, status: 'active' },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    Object.assign(restaurant, updateRestaurantDto);
    return await this.restaurantRepository.save(restaurant);
  }

  async remove(id: number): Promise<void> {
    const restaurant = await this.findOne(id);
    restaurant.status = 'inactive';
    await this.restaurantRepository.save(restaurant);
  }

  async search(query: string): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .where('restaurant.name ILIKE :query', { query: `%${query}%` })
      .orWhere('restaurant.description ILIKE :query', { query: `%${query}%` })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }

  async findBySpeciality(specialityId: number): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.specialities', 'speciality')
      .where('speciality.id = :specialityId', { specialityId })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }
} 