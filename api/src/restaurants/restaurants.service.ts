import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Speciality } from '../specialities/entities/speciality.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Speciality)
    private specialityRepository: Repository<Speciality>,
  ) {}

  private readonly logger = new Logger(RestaurantsService.name);

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const { specialityIds, ...restaurantData } = createRestaurantDto;
    
    this.logger.log(`Creating restaurant (postedByUserId=${restaurantData.postedByUserId ?? 'unknown'})`);
    
    const restaurant = this.restaurantRepository.create(restaurantData);
    
    // entity created
    
    // Handle specialities if provided
    if (specialityIds && specialityIds.length > 0) {
      const specialities = await this.specialityRepository.find({
        where: specialityIds.map(id => ({ id }))
      });
      restaurant.specialities = specialities;
    }
    
    return await this.restaurantRepository.save(restaurant);
  }

  async findAll(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      where: { status: 'active' },
      relations: ['postedBy', 'address', 'specialities'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, status: 'active' },
      relations: ['postedBy', 'address', 'specialities'],
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    
    if (restaurant.address) {
      // Convert decimal strings to numbers if needed
      if (typeof restaurant.address.latitude === 'string') {
        restaurant.address.latitude = parseFloat(restaurant.address.latitude);
      }
      if (typeof restaurant.address.longitude === 'string') {
        restaurant.address.longitude = parseFloat(restaurant.address.longitude);
      }
    }
    
    return restaurant;
  }

  async findOneById(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['postedBy', 'address', 'specialities'],
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    this.logger.log(`Updating restaurant ${id}`);
    
    const restaurant = await this.findOne(id);
    
    // Handle specialities separately
    const { specialityIds, ...restaurantData } = updateRestaurantDto;
    
    // Update basic restaurant properties
    Object.assign(restaurant, restaurantData);
    
    // Handle specialities if provided
    if (specialityIds !== undefined) {
      if (specialityIds && specialityIds.length > 0) {
        const specialities = await this.specialityRepository.find({
          where: specialityIds.map(id => ({ id }))
        });
        restaurant.specialities = specialities;
        this.logger.log(`Updated specialities count: ${specialities.length}`);
      } else {
        restaurant.specialities = [];
        this.logger.log('Cleared specialities');
      }
    }
    
    // Handle address if provided
    if (restaurantData.addressId !== undefined) {
      this.logger.log(`Updating address ID to: ${restaurantData.addressId}`);
      restaurant.addressId = restaurantData.addressId;
    }
    
    const updatedRestaurant = await this.restaurantRepository.save(restaurant);
    this.logger.log('Restaurant saved');
    
    // Return the updated restaurant with all relations loaded
    const finalRestaurant = await this.findOne(id);
    // final entity loaded
    return finalRestaurant;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting restaurant with ID: ${id}`);
    
    // Find restaurant regardless of status for deletion
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['postedBy', 'address', 'specialities'],
    });
    
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    
    this.logger.log(`Found restaurant to delete: ${restaurant.name} (status=${restaurant.status})`);
    
    // Check if already deleted
    if (restaurant.status === 'inactive') {
      this.logger.log('Restaurant is already deleted');
      return;
    }
    
    restaurant.status = 'inactive';
    await this.restaurantRepository.save(restaurant);
    this.logger.log('Restaurant deleted successfully (soft delete)');
  }

  async search(query: string): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.postedBy', 'postedBy')
      .leftJoinAndSelect('restaurant.address', 'address')
      .leftJoinAndSelect('restaurant.specialities', 'specialities')
      .where('restaurant.name ILIKE :query', { query: `%${query}%` })
      .orWhere('restaurant.description ILIKE :query', { query: `%${query}%` })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }

  async findBySpeciality(specialityId: number): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.postedBy', 'postedBy')
      .leftJoinAndSelect('restaurant.address', 'address')
      .leftJoinAndSelect('restaurant.specialities', 'speciality')
      .where('speciality.id = :specialityId', { specialityId })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }

  async findByCity(city: string): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.postedBy', 'postedBy')
      .leftJoinAndSelect('restaurant.address', 'address')
      .leftJoinAndSelect('restaurant.specialities', 'specialities')
      .where('LOWER(address.city) = LOWER(:city)', { city })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }
} 
