import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { Rating } from '../entities/rating.entity';
import { Store } from '../entities/store.entity';
import { Role } from '../enums/role.enum';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('RatingsService', () => {
  let service: RatingsService;
  let ratingRepository;
  let storeRepository;

  beforeEach(async () => {
    ratingRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    storeRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: getRepositoryToken(Rating),
          useValue: ratingRepository,
        },
        {
          provide: getRepositoryToken(Store),
          useValue: storeRepository,
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if user is an admin', async () => {
      await expect(
        service.create(1, Role.SYSTEM_ADMIN, { storeId: 1, rating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if store does not exist', async () => {
      storeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(1, Role.NORMAL_USER, { storeId: 99, rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if owner attempts to rate own store', async () => {
      const mockStore = { id: 1, ownerId: 2 };
      storeRepository.findOne.mockResolvedValue(mockStore);

      await expect(
        service.create(2, Role.STORE_OWNER, { storeId: 1, rating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if rating already exists', async () => {
      const mockStore = { id: 1, ownerId: 2 };
      storeRepository.findOne.mockResolvedValue(mockStore);
      ratingRepository.findOne.mockResolvedValue({ id: 10, userId: 3, storeId: 1, rating: 4 });

      await expect(
        service.create(3, Role.NORMAL_USER, { storeId: 1, rating: 5 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and save rating successfully if all checks pass', async () => {
      const mockStore = { id: 1, ownerId: 2 };
      const ratingDto = { storeId: 1, rating: 5 };
      
      storeRepository.findOne.mockResolvedValue(mockStore);
      ratingRepository.findOne.mockResolvedValue(null);
      ratingRepository.create.mockReturnValue(ratingDto);
      ratingRepository.save.mockResolvedValue({ id: 100, userId: 3, ...ratingDto });

      const result = await service.create(3, Role.NORMAL_USER, ratingDto);
      expect(result).toBeDefined();
      expect(result.id).toBe(100);
      expect(ratingRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if rating is not found', async () => {
      ratingRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(3, 99, { rating: 4 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if rating does not belong to user', async () => {
      ratingRepository.findOne.mockResolvedValue({ id: 10, userId: 4, storeId: 1, rating: 3 });

      await expect(
        service.update(3, 10, { rating: 4 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update rating successfully if valid', async () => {
      const mockRating = { id: 10, userId: 3, storeId: 1, rating: 3 };
      ratingRepository.findOne.mockResolvedValue(mockRating);
      ratingRepository.save.mockImplementation((r) => Promise.resolve(r));

      const result = await service.update(3, 10, { rating: 5 });
      expect(result.rating).toBe(5);
    });
  });
});
