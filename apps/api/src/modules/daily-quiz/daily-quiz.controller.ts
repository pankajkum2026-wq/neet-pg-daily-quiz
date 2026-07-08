import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DailyQuizService } from './daily-quiz.service';

@Controller('daily-quiz')
@UseGuards(AuthGuard)
export class DailyQuizController {
  constructor(private readonly dailyQuizService: DailyQuizService) {}

  @Get('today')
  getToday() {
    return this.dailyQuizService.getTodayQuiz();
  }
}
