import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters?: { status?: string; topicId?: string }) {
    return this.prisma.question.findMany({
      where: {
        status: filters?.status as 'draft' | 'published' | 'archived' | undefined,
        topicId: filters?.topicId,
      },
      include: {
        options: { orderBy: { label: 'asc' } },
        topic: { include: { subject: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSubjects() {
    return this.prisma.subject.findMany({
      include: { topics: { orderBy: { name: 'asc' } } },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
