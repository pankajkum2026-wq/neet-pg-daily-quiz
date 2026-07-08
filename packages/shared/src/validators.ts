import { z } from 'zod';

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid().nullable(),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

export const updateAttemptSchema = z.object({
  currentQuestionIndex: z.number().int().min(0).max(9).optional(),
  answers: z.array(submitAnswerSchema).optional(),
});

export const createQuestionSchema = z.object({
  topicId: z.string().uuid(),
  stem: z.string().min(10),
  explanation: z.string().min(10),
  clinicalPearl: z.string().optional(),
  memoryTrick: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  imageUrl: z.string().url().optional(),
  options: z
    .array(
      z.object({
        label: z.string().length(1),
        text: z.string().min(1),
        isCorrect: z.boolean(),
      }),
    )
    .length(4)
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: 'Exactly one option must be correct',
    }),
});

export const createDailyQuizSchema = z.object({
  quizDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(3),
  questionIds: z.array(z.string().uuid()).length(10),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type UpdateAttemptInput = z.infer<typeof updateAttemptSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type CreateDailyQuizInput = z.infer<typeof createDailyQuizSchema>;
