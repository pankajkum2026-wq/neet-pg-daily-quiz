import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StreaksService } from '../streaks/streaks.service';
import { getTodayIST } from '../../common/date.utils';
import type { TopicPerformanceDto, QuestionFeedbackDto } from '@repo/shared';

interface SaveAnswerInput {
  questionId: string;
  selectedOptionId: string | null;
  timeSpentSeconds?: number;
}

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streaksService: StreaksService,
  ) {}

  async startAttempt(userId: string, dailyQuizId: string) {
    const existing = await this.prisma.quizAttempt.findUnique({
      where: { userId_dailyQuizId: { userId, dailyQuizId } },
    });

    if (existing?.status === 'completed') {
      throw new ConflictException('Quiz already completed for today');
    }

    if (existing) {
      return this.formatAttempt(existing);
    }

    const attempt = await this.prisma.quizAttempt.create({
      data: { userId, dailyQuizId },
    });

    return this.formatAttempt(attempt);
  }

  async getAttempt(userId: string, attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        answers: true,
        dailyQuiz: {
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
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    return {
      ...this.formatAttempt(attempt),
      answers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
        timeSpentSeconds: a.timeSpentSeconds,
        isCorrect: a.isCorrect,
      })),
      questions: attempt.dailyQuiz.questions.map((dq) => ({
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

  async updateAttempt(
    userId: string,
    attemptId: string,
    data: { currentQuestionIndex?: number; answers?: SaveAnswerInput[] },
  ) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId, status: 'in_progress' },
    });

    if (!attempt) {
      throw new NotFoundException('Active attempt not found');
    }

    if (data.currentQuestionIndex !== undefined) {
      await this.prisma.quizAttempt.update({
        where: { id: attemptId },
        data: { currentQuestionIndex: data.currentQuestionIndex },
      });
    }

    const feedback: QuestionFeedbackDto[] = [];

    if (data.answers?.length) {
      for (const answer of data.answers) {
        const question = await this.prisma.question.findUnique({
          where: { id: answer.questionId },
          include: { options: true },
        });

        if (!question) continue;

        const correctOption = question.options.find((o) => o.isCorrect);
        const isCorrect = answer.selectedOptionId === correctOption?.id;

        await this.prisma.quizAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: answer.questionId,
            },
          },
          update: {
            selectedOptionId: answer.selectedOptionId,
            isCorrect,
            timeSpentSeconds: answer.timeSpentSeconds,
            answeredAt: new Date(),
          },
          create: {
            attemptId,
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
            isCorrect,
            timeSpentSeconds: answer.timeSpentSeconds,
          },
        });

        if (correctOption) {
          feedback.push({
            questionId: answer.questionId,
            isCorrect,
            correctOptionId: correctOption.id,
            explanation: question.explanation,
            clinicalPearl: question.clinicalPearl,
            memoryTrick: question.memoryTrick,
          });
        }
      }
    }

    const attemptData = await this.getAttempt(userId, attemptId);
    return { ...attemptData, feedback };
  }

  async submitAttempt(userId: string, attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId, status: 'in_progress' },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
                topic: { include: { subject: true } },
              },
            },
          },
        },
        dailyQuiz: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    options: true,
                    topic: { include: { subject: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Active attempt not found');
    }

    const totalQuestions = attempt.dailyQuiz.questions.length;
    if (attempt.answers.length < totalQuestions) {
      throw new BadRequestException('All questions must be answered before submitting');
    }

    const score = attempt.answers.filter((a) => a.isCorrect).length;
    const accuracy = (score / totalQuestions) * 100;
    const completedAt = new Date();
    const timeTakenSeconds = Math.round(
      (completedAt.getTime() - attempt.startedAt.getTime()) / 1000,
    );

    await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'completed',
        completedAt,
        score,
        accuracy,
        timeTakenSeconds,
      },
    });

    await this.updateTopicStats(userId, attempt.answers);
    await this.streaksService.updateStreakOnCompletion(userId, completedAt);

    return this.getResults(userId, attemptId);
  }

  async getResults(userId: string, attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId, status: 'completed' },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
                topic: { include: { subject: true } },
              },
            },
          },
        },
        dailyQuiz: { include: { questions: true } },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Completed attempt not found');
    }

    const topicMap = new Map<string, { correct: number; total: number; topicName: string; subjectName: string }>();

    const feedback: QuestionFeedbackDto[] = attempt.answers.map((a) => {
      const correctOption = a.question.options.find((o) => o.isCorrect)!;
      const topicId = a.question.topic.id;

      const existing = topicMap.get(topicId) ?? {
        correct: 0,
        total: 0,
        topicName: a.question.topic.name,
        subjectName: a.question.topic.subject.name,
      };
      existing.total += 1;
      if (a.isCorrect) existing.correct += 1;
      topicMap.set(topicId, existing);

      return {
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        correctOptionId: correctOption.id,
        explanation: a.question.explanation,
        clinicalPearl: a.question.clinicalPearl,
        memoryTrick: a.question.memoryTrick,
      };
    });

    const topicPerformances: TopicPerformanceDto[] = Array.from(topicMap.entries()).map(
      ([topicId, data]) => ({
        topicId,
        topicName: data.topicName,
        subjectName: data.subjectName,
        correct: data.correct,
        total: data.total,
        accuracy: Math.round((data.correct / data.total) * 100),
      }),
    );

    const sorted = [...topicPerformances].sort((a, b) => a.accuracy - b.accuracy);
    const weakTopics = sorted.filter((t) => t.accuracy < 100).slice(0, 3);
    const strongTopics = [...sorted].reverse().filter((t) => t.accuracy === 100).slice(0, 3);

    return {
      attemptId: attempt.id,
      score: attempt.score!,
      totalQuestions: attempt.dailyQuiz.questions.length,
      accuracy: Number(attempt.accuracy),
      timeTakenSeconds: attempt.timeTakenSeconds!,
      weakTopics,
      strongTopics,
      feedback,
    };
  }

  async getIncorrectQuestions(userId: string, attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId, status: 'completed' },
      include: {
        answers: {
          where: { isCorrect: false },
          include: {
            question: {
              include: {
                options: { orderBy: { label: 'asc' } },
                topic: { include: { subject: true } },
              },
            },
          },
        },
        dailyQuiz: {
          include: {
            questions: { select: { questionId: true, position: true } },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Completed attempt not found');
    }

    const positionMap = new Map(
      attempt.dailyQuiz.questions.map((q) => [q.questionId, q.position]),
    );

    return attempt.answers.map((a) => {
      const correctOption = a.question.options.find((o) => o.isCorrect)!;
      return {
        id: a.question.id,
        position: positionMap.get(a.question.id) ?? 0,
        stem: a.question.stem,
        imageUrl: a.question.imageUrl,
        options: a.question.options.map((o) => ({
          id: o.id,
          label: o.label,
          text: o.text,
        })),
        topic: {
          id: a.question.topic.id,
          name: a.question.topic.name,
          subject: {
            id: a.question.topic.subject.id,
            name: a.question.topic.subject.name,
          },
        },
        previousAnswer: {
          selectedOptionId: a.selectedOptionId,
          isCorrect: a.isCorrect,
        },
        feedback: {
          questionId: a.questionId,
          isCorrect: a.isCorrect,
          correctOptionId: correctOption.id,
          explanation: a.question.explanation,
          clinicalPearl: a.question.clinicalPearl,
          memoryTrick: a.question.memoryTrick,
        },
      };
    });
  }

  async getHistory(userId: string, limit = 30) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: limit,
      include: {
        dailyQuiz: { select: { id: true, title: true, quizDate: true } },
      },
    });

    return attempts.map((a) => ({
      attemptId: a.id,
      dailyQuizId: a.dailyQuizId,
      title: a.dailyQuiz.title,
      quizDate: a.dailyQuiz.quizDate.toISOString().split('T')[0],
      score: a.score,
      accuracy: Number(a.accuracy),
      timeTakenSeconds: a.timeTakenSeconds,
      completedAt: a.completedAt?.toISOString(),
    }));
  }

  private async updateTopicStats(
    userId: string,
    answers: Array<{ isCorrect: boolean; question: { topicId: string } }>,
  ) {
    for (const answer of answers) {
      const stat = await this.prisma.userTopicStat.upsert({
        where: {
          userId_topicId: { userId, topicId: answer.question.topicId },
        },
        update: {
          totalAttempted: { increment: 1 },
          totalCorrect: { increment: answer.isCorrect ? 1 : 0 },
          lastAttemptedAt: new Date(),
        },
        create: {
          userId,
          topicId: answer.question.topicId,
          totalAttempted: 1,
          totalCorrect: answer.isCorrect ? 1 : 0,
        },
      });

      const accuracy = (stat.totalCorrect / stat.totalAttempted) * 100;
      await this.prisma.userTopicStat.update({
        where: { id: stat.id },
        data: { accuracy },
      });
    }
  }

  private formatAttempt(attempt: {
    id: string;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    currentQuestionIndex: number;
    dailyQuizId: string;
  }) {
    return {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt?.toISOString() ?? null,
      currentQuestionIndex: attempt.currentQuestionIndex,
      dailyQuizId: attempt.dailyQuizId,
    };
  }
}
