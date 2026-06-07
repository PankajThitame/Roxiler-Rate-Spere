import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { Rating } from '../entities/rating.entity';
import { CreateStoreDto } from '../dto/store.dto';
import { Role } from '../enums/role.enum';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const owner = await this.userRepository.findOne({ where: { id: createStoreDto.ownerId } });
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${createStoreDto.ownerId} not found`);
    }

    if (owner.role !== Role.STORE_OWNER) {
      throw new BadRequestException('Selected user is not a store owner');
    }

    const store = this.storeRepository.create(createStoreDto);
    return this.storeRepository.save(store);
  }

  async findById(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async findAllAdmin(
    page = 1,
    size = 10,
    filters: { name?: string; email?: string; address?: string } = {},
    sort: { sortBy?: string; sortDirection?: 'ASC' | 'DESC' } = {},
  ) {
    const query = this.storeRepository.createQueryBuilder('store')
      .leftJoinAndSelect('store.ratings', 'rating');

    if (filters.name) {
      query.andWhere('store.name LIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.email) {
      query.andWhere('store.email LIKE :email', { email: `%${filters.email}%` });
    }
    if (filters.address) {
      query.andWhere('store.address LIKE :address', { address: `%${filters.address}%` });
    }

    const sortBy = sort.sortBy || 'name';
    const direction = sort.sortDirection || 'ASC';

    if (sortBy === 'name') {
      query.orderBy('store.name', direction);
    } else {
      query.orderBy(`store.${sortBy}`, direction);
    }

    const [stores, total] = await query.getManyAndCount();

    // Map to include average rating & paginate manually due to TypeORM limit issues with leftJoinAndSelect and counts
    const mappedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const avg = totalRatings > 0
        ? store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings
        : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        averageRating: Number(avg.toFixed(2)),
        ratingsCount: totalRatings,
        createdAt: store.createdAt,
      };
    });

    const paginatedItems = mappedStores.slice((page - 1) * size, page * size);

    return {
      items: paginatedItems,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async findAllUser(
    userId: number,
    page = 1,
    size = 10,
    filters: { name?: string; address?: string } = {},
    sort: { sortBy?: string; sortDirection?: 'ASC' | 'DESC' } = {},
  ) {
    const query = this.storeRepository.createQueryBuilder('store')
      .leftJoinAndSelect('store.ratings', 'rating');

    if (filters.name) {
      query.andWhere('store.name LIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.address) {
      query.andWhere('store.address LIKE :address', { address: `%${filters.address}%` });
    }

    const stores = await query.getMany();

    const mappedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const avg = totalRatings > 0
        ? store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings
        : 0;

      const userRatingObj = store.ratings.find((r) => Number(r.userId) === Number(userId));

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Number(avg.toFixed(2)),
        currentUserRating: userRatingObj ? userRatingObj.rating : null,
        currentUserRatingId: userRatingObj ? userRatingObj.id : null,
      };
    });

    const sortBy = sort.sortBy || 'name';
    const direction = sort.sortDirection || 'ASC';

    mappedStores.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'rating') {
        comparison = a.averageRating - b.averageRating;
      }

      return direction === 'ASC' ? comparison : -comparison;
    });

    const paginatedItems = mappedStores.slice((page - 1) * size, page * size);

    return {
      items: paginatedItems,
      total: mappedStores.length,
      page,
      size,
      totalPages: Math.ceil(mappedStores.length / size),
    };
  }
}
