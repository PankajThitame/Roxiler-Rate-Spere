import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Store } from '../entities/store.entity';
import { Rating } from '../entities/rating.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async getAdminStats() {
    const totalUsers = await this.userRepository.count();
    const totalStores = await this.storeRepository.count();
    const totalRatings = await this.ratingRepository.count();

    return {
      totalUsers,
      totalStores,
      totalRatings,
    };
  }

  async getOwnerDashboard(ownerId: number) {
    const stores = await this.storeRepository.find({
      where: { ownerId },
      relations: ['ratings', 'ratings.user'],
    });

    return stores.map((store) => {
      const totalRatings = store.ratings.length;
      const avg = totalRatings > 0
        ? store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings
        : 0;

      const usersWhoRated = store.ratings.map((r) => ({
        userName: r.user ? r.user.name : 'Unknown User',
        email: r.user ? r.user.email : 'Unknown Email',
        rating: r.rating,
        submittedDate: r.createdAt,
      }));

      return {
        storeDetails: {
          id: store.id,
          name: store.name,
          address: store.address,
          email: store.email,
        },
        averageRating: Number(avg.toFixed(2)),
        ratingsCount: totalRatings,
        usersWhoRated,
      };
    });
  }
}
