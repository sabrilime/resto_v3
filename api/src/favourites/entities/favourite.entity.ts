import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('favourites')
@Unique(['userId', 'restaurantId'])
export class Favourite {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the favourite' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The ID of the user' })
  userId: number;

  @Column()
  @ApiProperty({ description: 'The ID of the restaurant' })
  restaurantId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({ description: 'The user who favourited the restaurant', type: () => User })
  user: User;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  @ApiProperty({ description: 'The restaurant that was favourited', type: () => Restaurant })
  restaurant: Restaurant;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
} 