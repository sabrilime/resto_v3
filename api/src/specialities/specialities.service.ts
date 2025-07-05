import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Speciality } from './entities/speciality.entity';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';

@Injectable()
export class SpecialitiesService {
  constructor(
    @InjectRepository(Speciality)
    private specialityRepository: Repository<Speciality>,
  ) {}

  async create(createSpecialityDto: CreateSpecialityDto): Promise<Speciality> {
    try {
      const speciality = this.specialityRepository.create(createSpecialityDto);
      return await this.specialityRepository.save(speciality);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('Speciality with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Speciality[]> {
    return await this.specialityRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Speciality> {
    const speciality = await this.specialityRepository.findOne({ where: { id } });
    if (!speciality) {
      throw new NotFoundException(`Speciality with ID ${id} not found`);
    }
    return speciality;
  }

  async update(id: number, updateSpecialityDto: UpdateSpecialityDto): Promise<Speciality> {
    const speciality = await this.findOne(id);
    
    try {
      Object.assign(speciality, updateSpecialityDto);
      return await this.specialityRepository.save(speciality);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('Speciality with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const speciality = await this.findOne(id);
    await this.specialityRepository.remove(speciality);
  }
} 