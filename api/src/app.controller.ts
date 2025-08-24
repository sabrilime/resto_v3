import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('migrate')
  @HttpCode(HttpStatus.OK)
  async runMigrations() {
    try {
      // Check if we're in production
      if (process.env.NODE_ENV === 'production') {
        // Run pending migrations
        await this.dataSource.runMigrations();
        return { 
          success: true, 
          message: 'Migrations completed successfully',
          timestamp: new Date().toISOString()
        };
      } else {
        return { 
          success: false, 
          message: 'Migrations can only be run in production',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Migration failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: this.dataSource.isInitialized ? 'connected' : 'disconnected'
    };
  }
} 