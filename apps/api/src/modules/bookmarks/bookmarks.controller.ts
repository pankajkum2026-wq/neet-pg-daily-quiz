import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.guard';
import { BookmarksService } from './bookmarks.service';

class CreateBookmarkDto {
  @IsUUID()
  questionId!: string;
}

@Controller('bookmarks')
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.bookmarksService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: CreateBookmarkDto) {
    return this.bookmarksService.create(user.id, body.questionId);
  }

  @Delete(':questionId')
  remove(@CurrentUser() user: AuthUser, @Param('questionId', ParseUUIDPipe) questionId: string) {
    return this.bookmarksService.remove(user.id, questionId);
  }
}
