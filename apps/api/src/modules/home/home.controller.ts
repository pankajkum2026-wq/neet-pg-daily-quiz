import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.guard';
import { HomeService } from './home.service';

@Controller('home')
@UseGuards(AuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHome(@CurrentUser() user: AuthUser) {
    return this.homeService.getHomeScreen(user.id);
  }
}
