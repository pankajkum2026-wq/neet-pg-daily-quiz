import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ESTIMATED_QUIZ_MINUTES, QUIZ_QUESTION_COUNT } from '@repo/shared';
import { getTodayIST } from '../../common/date.utils';

@Injectable()
export class DailyQuizService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodayQuiz() {
    const today = getTodayIST();

    const quiz = await this.prisma.dailyQuiz.findFirst({
      where: {
        quizDate: today,
        status: 'published',
      },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          include: {
            question: {
              include: {
                options: { orderBy: { label: 'asc' } },
                topic: { include: { subject: true } },
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('No daily quiz published for today');
    }

    return {
      id: quiz.id,
      quizDate: quiz.quizDate.toISOString().split('T')[0],
      title: quiz.title,
      questionCount: quiz.questions.length,
      estimatedMinutes: ESTIMATED_QUIZ_MINUTES,
      questions: quiz.questions.map((dq) => ({
        id: dq.question.id,
        position: dq.position,
        stem: dq.question.stem,
        imageUrl: dq.question.imageUrl,
        options: dq.question.options.map((o) => ({
          id: o.id,
          label: o.label,
          text: o.text,
        })),
        topic: {
          id: dq.question.topic.id,
          name: dq.question.topic.name,
          subject: {
            id: dq.question.topic.subject.id,
            name: dq.question.topic.subject.name,
          },
        },
      })),
    };
  }

  async listPublished(limit = 30) {
    return this.prisma.dailyQuiz.findMany({
      where: { status: 'published' },
      orderBy: { quizDate: 'desc' },
      take: limit,
      select: {
        id: true,
        quizDate: true,
        title: true,
        status: true,
        _count: { select: { questions: true } },
      },
    });
  }
}
