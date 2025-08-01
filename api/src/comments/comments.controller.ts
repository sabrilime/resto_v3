import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/comments',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\//)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // <-- Increase this value
  }))
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully', type: Comment })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async create(
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
    @UploadedFile() file?: any,
  ): Promise<Comment> {
    try {
      console.log('Received DTO:', createCommentDto);
      console.log('Received file:', file);
      const userId = req.user?.userId || 1; // Get userId from JWT token
      if (file) {
        createCommentDto.image = `/uploads/comments/${file.filename}`;
      }
      return await this.commentsService.create(userId, createCommentDto);
    } catch (error) {
      console.error('Error in create comment:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'List of all comments', type: [Comment] })
  findAll(): Promise<Comment[]> {
    return this.commentsService.findAll();
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all comments for a specific restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'List of comments for the restaurant', type: [Comment] })
  findByRestaurant(@Param('restaurantId', ParseIntPipe) restaurantId: number): Promise<Comment[]> {
    return this.commentsService.findByRestaurant(restaurantId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all comments by the current user' })
  @ApiResponse({ status: 200, description: 'List of user comments', type: [Comment] })
  findByUser(@Request() req): Promise<Comment[]> {
    const userId = req.user?.userId || 1; // Get userId from JWT token
    return this.commentsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment found', type: Comment })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully', type: Comment })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only update your own comments' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const userId = req.user?.userId || 1; // Get userId from JWT token
    return this.commentsService.update(id, userId, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only delete your own comments' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<void> {
    const userId = req.user?.userId || 1; // Get userId from JWT token
    return this.commentsService.remove(id, userId);
  }
} 