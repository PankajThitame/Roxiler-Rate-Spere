import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';

@ApiTags('stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all stores for users, including average rating and current user rating' })
  @ApiResponse({ status: 200, description: 'Stores fetched successfully' })
  async getStores(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('name') name?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'ASC' | 'DESC',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = size ? parseInt(size, 10) : 10;

    return this.storesService.findAllUser(
      userId,
      pageNum,
      sizeNum,
      { name, address },
      { sortBy, sortDirection },
    );
  }
}
