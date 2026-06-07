import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Store } from '../entities/store.entity';
import { Rating } from '../entities/rating.entity';
import { DashboardService } from './dashboard.service';
import { AdminController } from './admin.controller';
import { OwnerController } from './owner.controller';
import { UsersModule } from '../users/users.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Store, Rating]),
    UsersModule,
    StoresModule,
  ],
  controllers: [AdminController, OwnerController],
  providers: [DashboardService],
})
export class DashboardModule {}
