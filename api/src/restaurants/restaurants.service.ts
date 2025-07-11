import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const { specialityIds, ...restaurantData } = createRestaurantDto;
    
    console.log('createRestaurantDto:', createRestaurantDto);
    console.log('restaurantData:', restaurantData);
    console.log('postedByUserId:', restaurantData.postedByUserId);
    
    const restaurant = this.restaurantRepository.create(restaurantData);
    
    console.log('Created restaurant entity:', restaurant);
    
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
    
    console.log('Restaurant found:', restaurant);
    console.log('Restaurant address:', restaurant.address);
    if (restaurant.address) {
      console.log('Address latitude:', restaurant.address.latitude, 'type:', typeof restaurant.address.latitude);
      console.log('Address longitude:', restaurant.address.longitude, 'type:', typeof restaurant.address.longitude);
      
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

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    console.log('Updating restaurant:', id, 'with data:', updateRestaurantDto);
    
    const restaurant = await this.findOne(id);
    console.log('Found restaurant:', restaurant);
    
    // Handle specialities separately
    const { specialityIds, ...restaurantData } = updateRestaurantDto;
    console.log('Restaurant data to update:', restaurantData);
    console.log('Speciality IDs:', specialityIds);
    
    // Update basic restaurant properties
    Object.assign(restaurant, restaurantData);
    
    // Handle specialities if provided
    if (specialityIds !== undefined) {
      if (specialityIds && specialityIds.length > 0) {
        const specialities = await this.specialityRepository.find({
          where: specialityIds.map(id => ({ id }))
        });
        restaurant.specialities = specialities;
        console.log('Updated specialities:', specialities);
      } else {
        restaurant.specialities = [];
        console.log('Cleared specialities');
      }
    }
    
    // Handle address if provided
    if (restaurantData.addressId !== undefined) {
      console.log('Updating address ID to:', restaurantData.addressId);
      restaurant.addressId = restaurantData.addressId;
    }
    
    const updatedRestaurant = await this.restaurantRepository.save(restaurant);
    console.log('Saved restaurant:', updatedRestaurant);
    
    // Return the updated restaurant with all relations loaded
    const finalRestaurant = await this.findOne(id);
    console.log('Final restaurant with relations:', finalRestaurant);
    return finalRestaurant;
  }

  async remove(id: number): Promise<void> {
    const restaurant = await this.findOne(id);
    restaurant.status = 'inactive';
    await this.restaurantRepository.save(restaurant);
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
} 