import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { StreaksModule } from '../streaks/streaks.module';
import { DailyQuizModule } from '../daily-quiz/daily-quiz.module';

@Module({
  imports: [StreaksModule, DailyQuizModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
