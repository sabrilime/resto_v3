import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The first name of the user' })
  firstName: string;

  @Column()
  @ApiProperty({ description: 'The last name of the user' })
  lastName: string;

  @Column()
  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @Column({ select: false })
  @ApiProperty({ description: 'The password of the user (hashed)', writeOnly: true })
  password: string;

  @Column({ default: 'user' })
  @ApiProperty({ description: 'Role of the user', default: 'user' })
  role: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Whether the user account is active', default: true })
  isActive: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 