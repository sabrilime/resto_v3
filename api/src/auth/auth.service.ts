import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Create user
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate token
    const payload = { email: user.email, sub: user.id, role: user.role };
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token: this.jwtService.sign(payload),
    };
  }

  async logout() {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  async loginWithGoogle(googleUser: any) {
    // Try to find user by googleId first
    let user = await this.usersService.findByGoogleId(googleUser.googleId);
    
    if (!user) {
      // If not found by googleId, try to find by email
      user = await this.usersService.findByEmail(googleUser.email);
      
      if (user) {
        // User exists but doesn't have googleId, update the user to add googleId
        await this.usersService.update(user.id, {
          googleId: googleUser.googleId,
          provider: 'google',
        });
        // Refresh user data
        user = await this.usersService.findOne(user.id);
      } else {
        // If not found by email either, create a new user
        user = await this.usersService.create({
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          email: googleUser.email,
          googleId: googleUser.googleId,
          provider: 'google',
          password: Math.random().toString(36).slice(-8), // random password
        });
      }
    }
    
    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getUserProfile(userId: number) {
    const user = await this.usersService.findOne(userId);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
} 