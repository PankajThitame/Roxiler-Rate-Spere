import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { CreateUserDto } from '../dto/user.dto';
import { CreateStoreDto } from '../dto/store.dto';
import { Role } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SYSTEM_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Stats fetched successfully' })
  async getDashboard() {
    return this.dashboardService.getAdminStats();
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user (any role)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('stores')
  @ApiOperation({ summary: 'Create a new store and assign owner' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or owner is not a STORE_OWNER' })
  @ApiResponse({ status: 404, description: 'Owner not found' })
  async createStore(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get('stores')
  @ApiOperation({ summary: 'List all stores with filters and sorting' })
  @ApiResponse({ status: 200, description: 'Stores fetched successfully' })
  async getStores(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'ASC' | 'DESC',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = size ? parseInt(size, 10) : 10;
    return this.storesService.findAllAdmin(
      pageNum,
      sizeNum,
      { name, email, address },
      { sortBy, sortDirection },
    );
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users with filters and sorting' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  async getUsers(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('role') role?: Role,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'ASC' | 'DESC',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = size ? parseInt(size, 10) : 10;
    return this.usersService.findAll(
      pageNum,
      sizeNum,
      { name, email, address, role },
      { sortBy, sortDirection },
    );
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get detailed info of a user (including average store rating if store owner)' })
  @ApiResponse({ status: 200, description: 'User fetched successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetails(@Param('id') id: string) {
    return this.usersService.getUserDetails(parseInt(id, 10));
  }
}
