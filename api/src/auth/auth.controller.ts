import { Controller, Post, Body, Get, UseGuards, Request, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async register(@Body() registerDto: { firstName: string; lastName: string; email: string; password: string }) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout() {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return await this.authService.getUserProfile(req.user.userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get full user profile' })
  @ApiResponse({ status: 200, description: 'Full user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFullProfile(@Request() req) {
    return await this.authService.getUserProfile(req.user.userId);
  }

  @Get('test-jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Test JWT authentication' })
  @ApiResponse({ status: 200, description: 'JWT is working' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async testJwt(@Request() req) {
    return { message: 'JWT is working', user: req.user };
  }

  @Get('verify-token')
  @ApiOperation({ summary: 'Verify JWT token manually' })
  @ApiResponse({ status: 200, description: 'Token verification result' })
  async verifyToken(@Request() req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'No Bearer token provided' };
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Import JWT service to verify token manually
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      // req.user contains the user info from Google
      const result = await this.authService.loginWithGoogle(req.user);
      
      // Redirect to frontend with token as query param
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in Google callback:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/sign-in?error=google_auth_failed`);
    }
  }
} 