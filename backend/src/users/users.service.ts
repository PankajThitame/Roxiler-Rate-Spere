import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Store } from '../entities/store.entity';
import { Rating } from '../entities/rating.entity';
import { CreateUserDto } from '../dto/user.dto';
import { Role } from '../enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);
    delete saved.password;
    return saved;
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const query = this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email });
    
    if (includePassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Incorrect old password');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  async findAll(
    page = 1,
    size = 10,
    filters: { name?: string; email?: string; address?: string; role?: Role } = {},
    sort: { sortBy?: string; sortDirection?: 'ASC' | 'DESC' } = {},
  ) {
    const query = this.userRepository.createQueryBuilder('user');

    if (filters.name) {
      query.andWhere('user.name LIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.email) {
      query.andWhere('user.email LIKE :email', { email: `%${filters.email}%` });
    }
    if (filters.address) {
      query.andWhere('user.address LIKE :address', { address: `%${filters.address}%` });
    }
    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    const sortBy = sort.sortBy || 'createdAt';
    const direction = sort.sortDirection || 'DESC';
    query.orderBy(`user.${sortBy}`, direction);

    const [items, total] = await query
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getUserDetails(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.STORE_OWNER) {
      // Find all stores owned by this user
      const stores = await this.storeRepository.find({
        where: { ownerId: user.id },
        relations: ['ratings'],
      });

      let totalRating = 0;
      let ratingCount = 0;

      stores.forEach((store) => {
        store.ratings.forEach((r) => {
          totalRating += r.rating;
          ratingCount++;
        });
      });

      const storeAverageRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(2)) : 0;

      return {
        ...user,
        storeAverageRating,
      };
    }

    return user;
  }
}
