import { Controller, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from '../dto/rating.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { Role } from '../enums/role.enum';

@ApiTags('ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new store rating' })
  @ApiResponse({ status: 201, description: 'Rating submitted successfully' })
  @ApiResponse({ status: 400, description: 'Admin cannot rate, owner cannot rate own store, or validation error' })
  @ApiResponse({ status: 409, description: 'User already rated this store' })
  async create(
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: Role,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.create(userId, userRole, createRatingDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing store rating' })
  @ApiResponse({ status: 200, description: 'Rating updated successfully' })
  @ApiResponse({ status: 403, description: 'User cannot update others rating' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  async update(
    @CurrentUser('id') userId: number,
    @Param('id') ratingId: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(userId, parseInt(ratingId, 10), updateRatingDto);
  }
}
