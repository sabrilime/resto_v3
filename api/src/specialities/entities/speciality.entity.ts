import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('specialities')
export class Speciality {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the speciality' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: 'The name of the speciality' })
  name: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ManyToMany(() => Restaurant, restaurant => restaurant.specialities)
  @ApiProperty({ description: 'Restaurants that have this speciality', type: [Restaurant], required: false })
  restaurants: Restaurant[];
} 