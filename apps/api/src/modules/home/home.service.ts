import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StreaksService } from '../streaks/streaks.service';
import { DailyQuizService } from '../daily-quiz/daily-quiz.service';
import { ESTIMATED_QUIZ_MINUTES, QUIZ_QUESTION_COUNT } from '@repo/shared';
import { getTodayIST } from '../../common/date.utils';

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streaksService: StreaksService,
    private readonly dailyQuizService: DailyQuizService,
  ) {}

  async getHomeScreen(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const streak = await this.streaksService.getStreak(userId);
    const today = getTodayIST();

    const todayQuiz = await this.prisma.dailyQuiz.findFirst({
      where: { quizDate: today, status: 'published' },
    });

    let quizStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
    let attemptId: string | null = null;
    let previousScore: number | null = null;

    if (todayQuiz) {
      const attempt = await this.prisma.quizAttempt.findUnique({
        where: { userId_dailyQuizId: { userId, dailyQuizId: todayQuiz.id } },
      });

      if (attempt) {
        attemptId = attempt.id;
        if (attempt.status === 'completed') {
          quizStatus = 'completed';
          previousScore = attempt.score;
        } else if (attempt.status === 'in_progress') {
          quizStatus = 'in_progress';
        }
      }
    }

    const lastCompleted = await this.prisma.quizAttempt.findFirst({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      select: { score: true },
    });

    return {
      user: { id: user.id, name: user.name },
      streak,
      todayQuiz: {
        id: todayQuiz?.id ?? null,
        title: todayQuiz?.title ?? 'No quiz today',
        questionCount: QUIZ_QUESTION_COUNT,
        estimatedMinutes: ESTIMATED_QUIZ_MINUTES,
        status: quizStatus,
        previousScore: previousScore ?? lastCompleted?.score ?? null,
        attemptId,
      },
    };
  }
}
