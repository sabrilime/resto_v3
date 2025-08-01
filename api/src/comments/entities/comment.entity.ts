import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the comment' })
  id: number;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'The content of the comment' })
  content: string;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ description: 'The rating given by the user (1-5)', required: false })
  rate: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ description: 'URL or path to the comment image', required: false })
  image?: string;

  @Column()
  @ApiProperty({ description: 'The ID of the user who created the comment' })
  userId: number;

  @Column()
  @ApiProperty({ description: 'The ID of the restaurant the comment is about' })
  restaurantId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({ description: 'The user who created the comment', type: () => User })
  user: User;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  @ApiProperty({ description: 'The restaurant the comment is about', type: () => Restaurant })
  restaurant: Restaurant;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 