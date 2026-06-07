import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { CreateRatingDto, UpdateRatingDto } from '../dto/rating.dto';
import { Role } from '../enums/role.enum';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(userId: number, userRole: Role, createRatingDto: CreateRatingDto): Promise<Rating> {
    if (userRole === Role.SYSTEM_ADMIN) {
      throw new BadRequestException('Admin cannot submit ratings');
    }

    const store = await this.storeRepository.findOne({ where: { id: createRatingDto.storeId } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${createRatingDto.storeId} not found`);
    }

    if (Number(store.ownerId) === Number(userId)) {
      throw new BadRequestException('Store owner cannot rate own store');
    }

    const existing = await this.ratingRepository.findOne({
      where: { userId, storeId: createRatingDto.storeId },
    });

    if (existing) {
      throw new ConflictException('You have already rated this store. Please update your existing rating.');
    }

    const newRating = this.ratingRepository.create({
      userId,
      storeId: createRatingDto.storeId,
      rating: createRatingDto.rating,
    });

    return this.ratingRepository.save(newRating);
  }

  async update(userId: number, ratingId: number, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({ where: { id: ratingId } });
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);
    }

    if (Number(rating.userId) !== Number(userId)) {
      throw new ForbiddenException('You do not have permission to edit this rating');
    }

    rating.rating = updateRatingDto.rating;
    return this.ratingRepository.save(rating);
  }
}
