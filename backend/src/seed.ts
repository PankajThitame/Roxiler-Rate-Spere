import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { User } from './entities/user.entity';
import { Store } from './entities/store.entity';
import { Rating } from './entities/rating.entity';
import { Role } from './enums/role.enum';

async function run() {
  console.log('Starting database seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const storeRepository = app.get<Repository<Store>>(getRepositoryToken(Store));
  const ratingRepository = app.get<Repository<Rating>>(getRepositoryToken(Rating));

  // 1. Clean existing data (ratings -> stores -> users)
  console.log('Cleaning existing database tables...');
  // Use explicit DELETE queries to remove rows without TRUNCATE (avoids FK issues).
  await ratingRepository.createQueryBuilder().delete().execute();
  await storeRepository.createQueryBuilder().delete().execute();
  await userRepository.createQueryBuilder().delete().execute();

  // Hash standard password for seed users
  const seedPasswordHash = await bcrypt.hash('Password@123', 10);

  // 2. Create Default Admin
  console.log('Seeding default administrator...');
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const defaultAdmin = userRepository.create({
    name: 'System Administrator General', // 28 chars (min 20 validation)
    email: 'admin@store.com',
    password: adminPassword,
    address: 'HQ Administrative Block, Sector 7',
    role: Role.SYSTEM_ADMIN,
  });
  await userRepository.save(defaultAdmin);

  // 3. Create 10 Store Owners
  console.log('Seeding 10 store owners...');
  const owners: User[] = [];
  for (let i = 1; i <= 10; i++) {
    const owner = userRepository.create({
      name: `Store Owner Number ${i.toString().padStart(2, '0')}`, // 22 chars
      email: `owner${i}@store.com`,
      password: seedPasswordHash,
      address: `${i * 10} Owner Boulevard, Retail Hub`,
      role: Role.STORE_OWNER,
    });
    owners.push(await userRepository.save(owner));
  }

  // 4. Create 50 Normal Users
  console.log('Seeding 50 normal users...');
  const normalUsers: User[] = [];
  for (let i = 1; i <= 50; i++) {
    const user = userRepository.create({
      name: `Normal Rating User Number ${i.toString().padStart(2, '0')}`, // 29 chars
      email: `user${i}@user.com`,
      password: seedPasswordHash,
      address: `${i * 12} Residential Lane, Suburbia`,
      role: Role.NORMAL_USER,
    });
    normalUsers.push(await userRepository.save(user));
  }

  // 5. Create 20 Stores (distributed across 10 owners)
  console.log('Seeding 20 stores...');
  const stores: Store[] = [];
  const storeNames = [
    'Delicious Coffee Cafe Springfield',
    'Gourmet Pizza Restaurant Metro',
    'Fresh Organic Grocery Market',
    'Modern Fashion Retail Boutique',
    'Vintage Bookshop and Coffee Cafe',
    'Premium Gym and Fitness Club',
    'Sunny Side Breakfast Restaurant',
    'Elite Spa and Wellness Center',
    'Smart Electronics Repair Shop',
    'Pet Paradise Care and Supplies',
    'Classic Italian Bistro and Bar',
    'Golden Crust Bakery Springfield',
    'Happy Gardens Nursery Outlet',
    'Super Scoops Ice Cream Parlor',
    'Urban Tech Gadgets Springfield',
    'Sparkling Clean Car Wash Shop',
    'Creative Craft and Hobby Store',
    'Downtown Dentist Clinic Office',
    'Corner Pharmacy and Wellness',
    'Speedy Tires and Auto Service',
  ];

  for (let i = 0; i < 20; i++) {
    // Assign 2 stores to each owner
    const owner = owners[Math.floor(i / 2)];
    const store = storeRepository.create({
      name: storeNames[i], // all > 20 chars
      email: `contact@${storeNames[i].toLowerCase().replace(/\s+/g, '')}.com`,
      address: `${100 + i * 5} Business Way, Commerce District`,
      ownerId: owner.id,
    });
    stores.push(await storeRepository.save(store));
  }

  // 6. Create 100 Ratings (randomly between normal users and stores)
  console.log('Seeding 100 ratings...');
  const ratings: Rating[] = [];
  
  // Set of generated user-store combinations to avoid unique constraints
  const generatedPairs = new Set<string>();

  while (ratings.length < 100) {
    const randomUser = normalUsers[Math.floor(Math.random() * normalUsers.length)];
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const pairKey = `${randomUser.id}-${randomStore.id}`;

    if (!generatedPairs.has(pairKey)) {
      generatedPairs.add(pairKey);
      
      const rating = ratingRepository.create({
        userId: randomUser.id,
        storeId: randomStore.id,
        rating: Math.floor(Math.random() * 5) + 1, // 1 to 5 stars
      });
      
      ratings.push(await ratingRepository.save(rating));
    }
  }

  console.log(`Successfully seeded:
  - 1 Admin User (admin@store.com)
  - 10 Store Owners (owner1@store.com to owner10@store.com)
  - 50 Normal Users (user1@user.com to user50@user.com)
  - 20 Stores
  - 100 Store Ratings`);

  await app.close();
  console.log('Seeding completed successfully!');
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
