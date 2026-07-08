import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
          include: { topic: { include: { subject: true } } },
        },
      },
    });

    return bookmarks.map((b) => ({
      id: b.id,
      questionId: b.questionId,
      stem: b.question.stem,
      topicName: b.question.topic.name,
      subjectName: b.question.topic.subject.name,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async create(userId: string, questionId: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    if (existing) {
      throw new ConflictException('Question already bookmarked');
    }

    const bookmark = await this.prisma.bookmark.create({
      data: { userId, questionId },
      include: {
        question: { include: { topic: { include: { subject: true } } } },
      },
    });

    return {
      id: bookmark.id,
      questionId: bookmark.questionId,
      stem: bookmark.question.stem,
      topicName: bookmark.question.topic.name,
      subjectName: bookmark.question.topic.subject.name,
      createdAt: bookmark.createdAt.toISOString(),
    };
  }

  async remove(userId: string, questionId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({ where: { id: bookmark.id } });
    return { success: true };
  }

  async isBookmarked(userId: string, questionIds: string[]) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId, questionId: { in: questionIds } },
      select: { questionId: true },
    });
    return new Set(bookmarks.map((b) => b.questionId));
  }
}
