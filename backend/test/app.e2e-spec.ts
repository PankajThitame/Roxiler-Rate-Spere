import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { StoresModule } from '../src/stores/stores.module';
import { RatingsModule } from '../src/ratings/ratings.module';
import { DashboardModule } from '../src/dashboard/dashboard.module';
import { User } from '../src/entities/user.entity';
import { Store } from '../src/entities/store.entity';
import { Rating } from '../src/entities/rating.entity';
import { Role } from '../src/enums/role.enum';
import { StoresService } from '../src/stores/stores.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>
  let storeRepo: Repository<Store>
  let storesService: StoresService

  // Increase default jest timeout for slower CI/dev environments
  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Store, Rating],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User, Store, Rating]),
        UsersModule,
        AuthModule,
        StoresModule,
        RatingsModule,
        DashboardModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User))
    storeRepo = moduleFixture.get<Repository<Store>>(getRepositoryToken(Store))
    storesService = moduleFixture.get<StoresService>(StoresService)
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth/register (POST) - success', async () => {
    const payload = {
      name: 'Johnathan Alexander Doe Jr',
      email: 'e2e_user1@example.com',
      password: 'Password@123',
      address: '123 Main Street',
    };

    const res = await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);
    expect(res.body).toHaveProperty('message', 'Registration successful');
    expect(res.body.user).toMatchObject({ email: payload.email });
  });

  it('/auth/register (POST) - validation error (short name)', async () => {
    const payload = {
      name: 'Short Name',
      email: 'e2e_user2@example.com',
      password: 'Password@123',
    };

    const res = await request(app.getHttpServer()).post('/auth/register').send(payload).expect(400);
    expect(Array.isArray(res.body.message)).toBeTruthy();
  });

  it('/auth/login (POST) - success after register', async () => {
    const reg = {
      name: 'Another Test User E2E Name',
      email: 'e2e_user3@example.com',
      password: 'Password@123',
    };
    await request(app.getHttpServer()).post('/auth/register').send(reg).expect(201);

    const loginRes = await request(app.getHttpServer()).post('/auth/login').send({ email: reg.email, password: reg.password }).expect(201);
    expect(loginRes.body).toHaveProperty('accessToken');
    expect(loginRes.body.user).toHaveProperty('email', reg.email);
  });

  it('/admin/stores (GET) - pagination and total', async () => {
    // create a store owner and multiple stores directly via repositories
    const owner = await userRepo.save({
      name: 'Owner E2E User',
      email: 'owner_e2e@example.com',
      password: 'OwnerPass@123',
      role: Role.STORE_OWNER,
    } as any);

    const storesToCreate = 15;
    const stores = [];
    for (let i = 1; i <= storesToCreate; i++) {
      stores.push({ name: `Store ${i}`, email: `store${i}@example.com`, address: 'Some address', owner });
    }
    await storeRepo.save(stores as any[]);

    const res = await storesService.findAllAdmin(1, 10, {}, { sortBy: 'name', sortDirection: 'ASC' });
    expect(res).toHaveProperty('items');
    expect(Array.isArray(res.items)).toBeTruthy();
    expect(res.items.length).toBe(10);
    expect(res).toHaveProperty('total', storesToCreate);
  });
});
