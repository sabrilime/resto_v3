import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Speciality } from '../../specialities/entities/speciality.entity';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';

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

  @Column({ nullable: true })
  @ApiProperty({ description: 'Image URL of the restaurant', required: false })
  image: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Instagram handle of the restaurant', required: false })
  instagram: string;

  @Column({ default: false })
  @ApiProperty({ description: 'Whether the restaurant is halal', default: false })
  halal: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @ApiProperty({ description: 'Average rating of the restaurant', required: false })
  rating: number;

  @Column({ default: 'active' })
  @ApiProperty({ description: 'Status of the restaurant', default: 'active' })
  status: string;

  @Column({ nullable: false })
  @ApiProperty({ description: 'ID of the user who posted the restaurant', required: true })
  postedByUserId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'postedByUserId' })
  @ApiProperty({ description: 'User who posted the restaurant', type: () => User, required: false })
  postedBy: User;

  @Column({ nullable: true })
  @ApiProperty({ description: 'ID of the restaurant address', required: false })
  addressId: number;

  @ManyToOne(() => Address, address => address.id, { eager: false })
  @JoinColumn({ name: 'addressId' })
  @ApiProperty({ description: 'Address of the restaurant', type: () => Address, required: false })
  address: Address;

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