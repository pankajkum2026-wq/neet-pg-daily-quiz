import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getTodayIST } from '../../common/date.utils';

@Injectable()
export class StreaksService {
  constructor(private readonly prisma: PrismaService) {}

  async getStreak(userId: string) {
    const streak = await this.prisma.userStreak.findUnique({ where: { userId } });
    return {
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastCompletedDate: streak?.lastCompletedDate?.toISOString().split('T')[0] ?? null,
    };
  }

  async updateStreakOnCompletion(userId: string, completedAt: Date) {
    const today = getTodayIST();
    const streak = await this.prisma.userStreak.upsert({
      where: { userId },
      update: {},
      create: { userId, currentStreak: 0, longestStreak: 0 },
    });

    const lastDate = streak.lastCompletedDate;
    let newStreak = 1;

    if (lastDate) {
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const lastDateStr = lastDate.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDateStr === todayStr) {
        return streak;
      } else if (lastDateStr === yesterdayStr) {
        newStreak = streak.currentStreak + 1;
      }
    }

    const longestStreak = Math.max(newStreak, streak.longestStreak);

    return this.prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastCompletedDate: today,
      },
    });
  }
}
