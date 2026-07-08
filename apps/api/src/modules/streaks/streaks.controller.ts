import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.guard';
import { StreaksService } from './streaks.service';

@Controller('streaks')
@UseGuards(AuthGuard)
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  @Get('me')
  getMyStreak(@CurrentUser() user: AuthUser) {
    return this.streaksService.getStreak(user.id);
  }
}
