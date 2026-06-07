"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../src/auth/auth.module");
const users_module_1 = require("../src/users/users.module");
const stores_module_1 = require("../src/stores/stores.module");
const ratings_module_1 = require("../src/ratings/ratings.module");
const dashboard_module_1 = require("../src/dashboard/dashboard.module");
const user_entity_1 = require("../src/entities/user.entity");
const store_entity_1 = require("../src/entities/store.entity");
const rating_entity_1 = require("../src/entities/rating.entity");
const role_enum_1 = require("../src/enums/role.enum");
const stores_service_1 = require("../src/stores/stores.service");
describe('Auth (e2e)', () => {
    let app;
    let userRepo;
    let storeRepo;
    let storesService;
    jest.setTimeout(30000);
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                typeorm_1.TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    dropSchema: true,
                    entities: [user_entity_1.User, store_entity_1.Store, rating_entity_1.Rating],
                    synchronize: true,
                }),
                typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, store_entity_1.Store, rating_entity_1.Rating]),
                users_module_1.UsersModule,
                auth_module_1.AuthModule,
                stores_module_1.StoresModule,
                ratings_module_1.RatingsModule,
                dashboard_module_1.DashboardModule,
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        userRepo = moduleFixture.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        storeRepo = moduleFixture.get((0, typeorm_1.getRepositoryToken)(store_entity_1.Store));
        storesService = moduleFixture.get(stores_service_1.StoresService);
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
        const owner = await userRepo.save({
            name: 'Owner E2E User',
            email: 'owner_e2e@example.com',
            password: 'OwnerPass@123',
            role: role_enum_1.Role.STORE_OWNER,
        });
        const storesToCreate = 15;
        const stores = [];
        for (let i = 1; i <= storesToCreate; i++) {
            stores.push({ name: `Store ${i}`, email: `store${i}@example.com`, address: 'Some address', owner });
        }
        await storeRepo.save(stores);
        const res = await storesService.findAllAdmin(1, 10, {}, { sortBy: 'name', sortDirection: 'ASC' });
        expect(res).toHaveProperty('items');
        expect(Array.isArray(res.items)).toBeTruthy();
        expect(res.items.length).toBe(10);
        expect(res).toHaveProperty('total', storesToCreate);
    });
});
//# sourceMappingURL=app.e2e-spec.js.map