import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    console.log('Creating user with email:', createUserDto.email);
    console.log('Original password:', createUserDto.password);
    console.log('Password type:', typeof createUserDto.password);
    console.log('Password length:', createUserDto.password.length);
    
    // Check if password is already hashed
    const isAlreadyHashed = createUserDto.password.startsWith('$2b$') && createUserDto.password.length === 60;
    console.log('Password appears to be already hashed:', isAlreadyHashed);
    
    let hashedPassword;
    if (isAlreadyHashed) {
      console.log('Using password as-is (already hashed)');
      hashedPassword = createUserDto.password;
    } else {
      console.log('Hashing password');
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }
    
    console.log('Final password hash:', hashedPassword);
    
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    console.log('User saved with ID:', savedUser.id);
    console.log('Saved user password hash:', savedUser.password);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
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
    
    console.log('findByEmailWithPassword - user found:', !!user);
    if (user) {
      console.log('findByEmailWithPassword - password field exists:', !!user.password);
      console.log('findByEmailWithPassword - password hash:', user.password);
    }
    
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

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }
} 