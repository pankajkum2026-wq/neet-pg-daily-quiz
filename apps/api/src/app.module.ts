import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DailyQuizModule } from './modules/daily-quiz/daily-quiz.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { StreaksModule } from './modules/streaks/streaks.module';
import { HomeModule } from './modules/home/home.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DailyQuizModule,
    AttemptsModule,
    StreaksModule,
    HomeModule,
    QuestionsModule,
    AdminModule,
    AnalyticsModule,
    BookmarksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
