import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    this.logger.log(`Creating user${createUserDto.email ? ` with email ${createUserDto.email}` : ''}`);
    
    // Check if password is already hashed
    const isAlreadyHashed = createUserDto.password.startsWith('$2b$') && createUserDto.password.length === 60;
    
    let hashedPassword;
    if (isAlreadyHashed) {
      hashedPassword = createUserDto.password;
    } else {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }
    
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User saved with ID: ${savedUser.id}`);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'googleId', 'provider', 'createdAt', 'updatedAt'],
    });
  }

  async findAllForAdmin(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'googleId', 'provider', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'googleId', 'provider', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email, isActive: true },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'googleId', 'provider', 'createdAt', 'updatedAt'],
    });
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getOne();
    
    // Avoid logging sensitive password data in production
    
    return user;
  }

  async findByGoogleId(googleId: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { googleId, isActive: true } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async adminUpdate(id: number, adminUpdateUserDto: AdminUpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    if (adminUpdateUserDto.email && adminUpdateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: adminUpdateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (adminUpdateUserDto.password) {
      adminUpdateUserDto.password = await bcrypt.hash(adminUpdateUserDto.password, 10);
    }

    Object.assign(user, adminUpdateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }
} 
