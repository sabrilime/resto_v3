import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SpecialitiesService } from './specialities.service';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { Speciality } from './entities/speciality.entity';

@ApiTags('specialities')
@Controller('specialities')
export class SpecialitiesController {
  constructor(private readonly specialitiesService: SpecialitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new speciality' })
  @ApiResponse({ status: 201, description: 'Speciality created successfully', type: Speciality })
  @ApiResponse({ status: 409, description: 'Speciality with this name already exists' })
  create(@Body() createSpecialityDto: CreateSpecialityDto): Promise<Speciality> {
    return this.specialitiesService.create(createSpecialityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all specialities' })
  @ApiResponse({ status: 200, description: 'List of all specialities', type: [Speciality] })
  findAll(): Promise<Speciality[]> {
    return this.specialitiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a speciality by ID' })
  @ApiParam({ name: 'id', description: 'Speciality ID' })
  @ApiResponse({ status: 200, description: 'Speciality found', type: Speciality })
  @ApiResponse({ status: 404, description: 'Speciality not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Speciality> {
    return this.specialitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a speciality' })
  @ApiParam({ name: 'id', description: 'Speciality ID' })
  @ApiResponse({ status: 200, description: 'Speciality updated successfully', type: Speciality })
  @ApiResponse({ status: 404, description: 'Speciality not found' })
  @ApiResponse({ status: 409, description: 'Speciality with this name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpecialityDto: UpdateSpecialityDto,
  ): Promise<Speciality> {
    return this.specialitiesService.update(id, updateSpecialityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a speciality' })
  @ApiParam({ name: 'id', description: 'Speciality ID' })
  @ApiResponse({ status: 200, description: 'Speciality deleted successfully' })
  @ApiResponse({ status: 404, description: 'Speciality not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.specialitiesService.remove(id);
  }
} 