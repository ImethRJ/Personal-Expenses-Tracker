import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('monthly')
  async getMonthlyTrend(
    @CurrentUser('id') userId: string,
    @Query('months') months?: string,
  ) {
    const count = months ? parseInt(months, 10) : 6;
    return this.analyticsService.getMonthlyTrend(userId, count);
  }

  @Get('categories')
  async getCategoryBreakdown(
    @CurrentUser('id') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const m = month ? parseInt(month, 10) : undefined;
    const y = year ? parseInt(year, 10) : undefined;
    return this.analyticsService.getCategoryBreakdown(userId, m, y);
  }

  @Get('insights')
  async getInsights(
    @CurrentUser('id') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const m = month ? parseInt(month, 10) : undefined;
    const y = year ? parseInt(year, 10) : undefined;
    return this.analyticsService.getInsights(userId, m, y);
  }
}
