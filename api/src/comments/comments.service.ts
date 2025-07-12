import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if restaurant exists
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: createCommentDto.restaurantId }
    });
    
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${createCommentDto.restaurantId} not found`);
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
    });

    return await this.commentRepository.save(comment);
  }

  async findAll(): Promise<Comment[]> {
    return await this.commentRepository.find({
      relations: ['user', 'restaurant'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByRestaurant(restaurantId: number): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { restaurantId },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByUser(userId: number): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { userId },
      relations: ['restaurant'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'restaurant']
    });
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    return comment;
  }

  async update(id: number, userId: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    
    // Check if user owns the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);
    
    // Check if user owns the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    
    await this.commentRepository.remove(comment);
  }
} 