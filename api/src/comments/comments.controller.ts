import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully', type: Comment })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  create(@Request() req, @Body() createCommentDto: CreateCommentDto): Promise<Comment> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.commentsService.create(userId, createCommentDto);
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
  @ApiOperation({ summary: 'Get all comments by the current user' })
  @ApiResponse({ status: 200, description: 'List of user comments', type: [Comment] })
  findByUser(@Request() req): Promise<Comment[]> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
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
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.commentsService.update(id, userId, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only delete your own comments' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: Replace with actual user ID from JWT token
    const userId = req.user?.id || 1; // Temporary for testing
    return this.commentsService.remove(id, userId);
  }
} 