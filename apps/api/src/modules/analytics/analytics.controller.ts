import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('me')
  getMyAnalytics(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getUserAnalytics(user.id);
  }
}
