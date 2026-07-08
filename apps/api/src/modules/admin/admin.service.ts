import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateQuestionInput, CreateDailyQuizInput } from '@repo/shared';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createQuestion(createdById: string, input: CreateQuestionInput) {
    return this.prisma.question.create({
      data: {
        topicId: input.topicId,
        stem: input.stem,
        explanation: input.explanation,
        clinicalPearl: input.clinicalPearl,
        memoryTrick: input.memoryTrick,
        difficulty: input.difficulty,
        imageUrl: input.imageUrl,
        status: 'draft',
        createdById,
        options: { create: input.options },
      },
      include: { options: true, topic: { include: { subject: true } } },
    });
  }

  async publishQuestion(id: string) {
    return this.prisma.question.update({
      where: { id },
      data: { status: 'published' },
    });
  }

  async createDailyQuiz(createdById: string, input: CreateDailyQuizInput) {
    const subjects = new Set<string>();
    const questions = await this.prisma.question.findMany({
      where: { id: { in: input.questionIds }, status: 'published' },
      include: { topic: { include: { subject: true } } },
    });

    if (questions.length !== 10) {
      throw new BadRequestException('All 10 questions must be published');
    }

    for (const q of questions) {
      subjects.add(q.topic.subject.id);
    }

    if (subjects.size < 2) {
      throw new BadRequestException('Quiz must include questions from at least 2 subjects');
    }

    const quizDate = new Date(input.quizDate + 'T00:00:00.000Z');

    return this.prisma.dailyQuiz.create({
      data: {
        quizDate,
        title: input.title,
        status: 'draft',
        createdById,
        questions: {
          create: input.questionIds.map((questionId, index) => ({
            questionId,
            position: index + 1,
          })),
        },
      },
      include: { questions: { include: { question: true } } },
    });
  }

  async publishDailyQuiz(id: string) {
    return this.prisma.dailyQuiz.update({
      where: { id },
      data: { status: 'published', publishedAt: new Date() },
    });
  }

  async getDashboardStats() {
    const [totalQuestions, publishedQuestions, totalQuizzes, totalAttempts, totalUsers] =
      await Promise.all([
        this.prisma.question.count(),
        this.prisma.question.count({ where: { status: 'published' } }),
        this.prisma.dailyQuiz.count({ where: { status: 'published' } }),
        this.prisma.quizAttempt.count({ where: { status: 'completed' } }),
        this.prisma.user.count({ where: { role: 'student' } }),
      ]);

    return {
      totalQuestions,
      publishedQuestions,
      totalQuizzes,
      totalAttempts,
      totalUsers,
    };
  }
}
