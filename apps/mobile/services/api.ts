import type {
  HomeScreenDto,
  DailyQuizDto,
  QuizResultsDto,
  QuestionDto,
  QuestionFeedbackDto,
  AnalyticsDto,
  BookmarkDto,
  RetryQuestionDto,
} from '@repo/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const headers = {
  'Content-Type': 'application/json',
  'X-Dev-Firebase-Uid': 'seed-student-uid',
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? 'API request failed');
  }
  return res.json();
}

export const api = {
  getHome: () => request<HomeScreenDto>('/home'),
  getTodayQuiz: () => request<DailyQuizDto>('/daily-quiz/today'),
  getAnalytics: () => request<AnalyticsDto>('/analytics/me'),
  startAttempt: (dailyQuizId: string) =>
    request<{ id: string }>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ dailyQuizId }),
    }),
  getAttempt: (id: string) => request<AttemptData>(`/attempts/${id}`),
  updateAttempt: (id: string, data: Record<string, unknown>) =>
    request<AttemptData & { feedback: QuestionFeedbackDto[] }>(`/attempts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  submitAttempt: (id: string) =>
    request<QuizResultsDto>(`/attempts/${id}/submit`, { method: 'POST' }),
  getResults: (id: string) => request<QuizResultsDto>(`/attempts/${id}/results`),
  getHistory: () => request<HistoryItem[]>('/attempts/history'),
  getIncorrect: (attemptId: string) =>
    request<RetryQuestionDto[]>(`/attempts/${attemptId}/incorrect`),
  getBookmarks: () => request<BookmarkDto[]>('/bookmarks'),
  addBookmark: (questionId: string) =>
    request<BookmarkDto>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ questionId }),
    }),
  removeBookmark: (questionId: string) =>
    request(`/bookmarks/${questionId}`, { method: 'DELETE' }),
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
  status: string;
  startedAt: string;
  completedAt: string | null;
  currentQuestionIndex: number;
  dailyQuizId: string;
  questions: QuestionDto[];
  answers: Array<{
    questionId: string;
    selectedOptionId: string | null;
    timeSpentSeconds?: number;
    isCorrect?: boolean;
  }>;
}
