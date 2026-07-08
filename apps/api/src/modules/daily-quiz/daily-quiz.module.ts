import { Module } from '@nestjs/common';
import { DailyQuizService } from './daily-quiz.service';
import { DailyQuizController } from './daily-quiz.controller';

@Module({
  controllers: [DailyQuizController],
  providers: [DailyQuizService],
  exports: [DailyQuizService],
})
export class DailyQuizModule {}
