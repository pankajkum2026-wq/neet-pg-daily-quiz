import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { QuestionsService } from './questions.service';

@Controller('questions')
@UseGuards(AuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  list(@Query('status') status?: string, @Query('topicId') topicId?: string) {
    return this.questionsService.list({ status, topicId });
  }

  @Get('subjects')
  getSubjects() {
    return this.questionsService.getSubjects();
  }
}
