import type { HomeScreenDto, DailyQuizDto, QuizResultsDto, QuestionDto } from '@repo/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const headers = {
  'Content-Type': 'application/json',
  'X-Dev-Firebase-Uid': 'seed-student-uid',
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? 'API request failed');
  }
  return res.json();
}

export const api = {
  getHome: () => request<HomeScreenDto>('/home'),
  getTodayQuiz: () => request<DailyQuizDto>('/daily-quiz/today'),
  startAttempt: (dailyQuizId: string) =>
    request<{ id: string }>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ dailyQuizId }),
    }),
  getAttempt: (id: string) => request<AttemptData>(`/attempts/${id}`),
  updateAttempt: (id: string, data: Record<string, unknown>) =>
    request(`/attempts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  submitAttempt: (id: string) => request<QuizResultsDto>(`/attempts/${id}/submit`, { method: 'POST' }),
  getResults: (id: string) => request<QuizResultsDto>(`/attempts/${id}/results`),
  getHistory: () => request<HistoryItem[]>('/attempts/history'),
};

export interface HistoryItem {
  attemptId: string;
  title: string;
  quizDate: string;
  score: number;
  accuracy: number;
  timeTakenSeconds: number;
}

export interface AttemptData {
  id: string;
  currentQuestionIndex: number;
  questions: QuestionDto[];
  answers: Array<{ questionId: string; selectedOptionId: string | null }>;
}
