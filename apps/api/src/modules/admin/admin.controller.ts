import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.guard';
import { AdminService } from './admin.service';
import { createQuestionSchema, createDailyQuizSchema } from '@repo/shared';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.getDashboardStats();
  }

  @Post('questions')
  createQuestion(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const input = createQuestionSchema.parse(body);
    return this.adminService.createQuestion(user.id, input);
  }

  @Patch('questions/:id/publish')
  publishQuestion(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.publishQuestion(id);
  }

  @Get('daily-quizzes')
  listDailyQuizzes() {
    return this.adminService.listDailyQuizzes();
  }

  @Post('daily-quizzes')
  createDailyQuiz(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const input = createDailyQuizSchema.parse(body);
    return this.adminService.createDailyQuiz(user.id, input);
  }

  @Patch('daily-quizzes/:id/publish')
  publishDailyQuiz(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.publishDailyQuiz(id);
  }
}
