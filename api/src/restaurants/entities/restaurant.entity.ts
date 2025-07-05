import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Speciality } from '../../specialities/entities/speciality.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the restaurant' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The name of the restaurant' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Description of the restaurant', required: false })
  description: string;

  @Column()
  @ApiProperty({ description: 'The address of the restaurant' })
  address: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Phone number of the restaurant', required: false })
  phone: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Website URL of the restaurant', required: false })
  website: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  @ApiProperty({ description: 'Latitude coordinate', required: false })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  @ApiProperty({ description: 'Longitude coordinate', required: false })
  longitude: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @ApiProperty({ description: 'Average rating of the restaurant', required: false })
  rating: number;

  @Column({ default: 'active' })
  @ApiProperty({ description: 'Status of the restaurant', default: 'active' })
  status: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ManyToMany(() => Speciality, { eager: false })
  @JoinTable({
    name: 'restaurant_specialities',
    joinColumn: {
      name: 'restaurant_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'speciality_id',
      referencedColumnName: 'id',
    },
  })
  @ApiProperty({ description: 'Specialities of the restaurant', type: [Speciality], required: false })
  specialities: Speciality[];
} 