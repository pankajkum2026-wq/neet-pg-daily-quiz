import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StreaksService } from '../streaks/streaks.service';
import type { AnalyticsDto, SubjectPerformanceDto } from '@repo/shared';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streaksService: StreaksService,
  ) {}

  async getUserAnalytics(userId: string): Promise<AnalyticsDto> {
    const streak = await this.streaksService.getStreak(userId);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [weeklyAttempts, totalCompleted, topicStats] = await Promise.all([
      this.prisma.quizAttempt.findMany({
        where: {
          userId,
          status: 'completed',
          completedAt: { gte: weekAgo },
        },
        select: { score: true, accuracy: true },
      }),
      this.prisma.quizAttempt.count({
        where: { userId, status: 'completed' },
      }),
      this.prisma.userTopicStat.findMany({
        where: { userId, totalAttempted: { gt: 0 } },
        include: { topic: { include: { subject: true } } },
      }),
    ]);

    const weeklyAccuracy =
      weeklyAttempts.length > 0
        ? Math.round(
            weeklyAttempts.reduce((sum, a) => sum + Number(a.accuracy), 0) / weeklyAttempts.length,
          )
        : 0;

    const averageScore =
      weeklyAttempts.length > 0
        ? Math.round(
            weeklyAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / weeklyAttempts.length,
          )
        : 0;

    const subjectMap = new Map<
      string,
      { subjectName: string; totalAttempted: number; totalCorrect: number }
    >();

    for (const stat of topicStats) {
      const subjectId = stat.topic.subject.id;
      const existing = subjectMap.get(subjectId) ?? {
        subjectName: stat.topic.subject.name,
        totalAttempted: 0,
        totalCorrect: 0,
      };
      existing.totalAttempted += stat.totalAttempted;
      existing.totalCorrect += stat.totalCorrect;
      subjectMap.set(subjectId, existing);
    }

    const subjectPerformances: SubjectPerformanceDto[] = Array.from(subjectMap.entries()).map(
      ([subjectId, data]) => ({
        subjectId,
        subjectName: data.subjectName,
        totalAttempted: data.totalAttempted,
        totalCorrect: data.totalCorrect,
        accuracy: Math.round((data.totalCorrect / data.totalAttempted) * 100),
      }),
    );

    const sorted = [...subjectPerformances].sort((a, b) => a.accuracy - b.accuracy);
    const weakSubjects = sorted.filter((s) => s.accuracy < 80).slice(0, 5);
    const strongSubjects = [...sorted].reverse().filter((s) => s.accuracy >= 80).slice(0, 5);

    return {
      weeklyAccuracy,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      quizzesCompleted: totalCompleted,
      averageScore,
      weakSubjects,
      strongSubjects,
    };
  }
}
