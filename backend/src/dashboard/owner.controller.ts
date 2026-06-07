import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Role } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../decorators/user.decorator';

@ApiTags('owner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STORE_OWNER)
@Controller('owner')
export class OwnerController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics for the logged in store owner' })
  @ApiResponse({ status: 200, description: 'Store dashboard metrics fetched successfully' })
  async getDashboard(@CurrentUser('id') ownerId: number) {
    return this.dashboardService.getOwnerDashboard(ownerId);
  }
}
