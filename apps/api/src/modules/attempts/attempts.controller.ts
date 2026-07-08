import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { IsArray, IsInt, IsOptional, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.guard';
import { AttemptsService } from './attempts.service';

class SaveAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsOptional()
  @IsUUID()
  selectedOptionId!: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}

class UpdateAttemptDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  currentQuestionIndex?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveAnswerDto)
  answers?: SaveAnswerDto[];
}

class StartAttemptDto {
  @IsUUID()
  dailyQuizId!: string;
}

@Controller('attempts')
@UseGuards(AuthGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  start(@CurrentUser() user: AuthUser, @Body() body: StartAttemptDto) {
    return this.attemptsService.startAttempt(user.id, body.dailyQuizId);
  }

  @Get('history')
  history(@CurrentUser() user: AuthUser) {
    return this.attemptsService.getHistory(user.id);
  }

  @Get(':id/incorrect')
  getIncorrect(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.attemptsService.getIncorrectQuestions(user.id, id);
  }

  @Get(':id')
  getOne(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.attemptsService.getAttempt(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAttemptDto,
  ) {
    return this.attemptsService.updateAttempt(user.id, id, body);
  }

  @Post(':id/submit')
  submit(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.attemptsService.submitAttempt(user.id, id);
  }

  @Get(':id/results')
  results(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.attemptsService.getResults(user.id, id);
  }
}
