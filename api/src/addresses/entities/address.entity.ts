import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the address' })
  id: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'House number', required: false })
  house_number: string;

  @Column()
  @ApiProperty({ description: 'Street name' })
  street: string;

  @Column()
  @ApiProperty({ description: 'Postal code' })
  postal_code: string;

  @Column()
  @ApiProperty({ description: 'City name' })
  city: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'INSEE code', required: false })
  insee_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  @ApiProperty({ description: 'Latitude coordinate', required: false })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  @ApiProperty({ description: 'Longitude coordinate', required: false })
  longitude: number;

  @Column({ default: false })
  @ApiProperty({ description: 'Whether this address is for delivery only', default: false })
  onlyDelivery: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 