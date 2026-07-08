export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

export interface QuestionOptionDto {
  id: string;
  label: string;
  text: string;
}

export interface QuestionDto {
  id: string;
  position: number;
  stem: string;
  imageUrl: string | null;
  options: QuestionOptionDto[];
  topic: {
    id: string;
    name: string;
    subject: { id: string; name: string };
  };
}

export interface DailyQuizDto {
  id: string;
  quizDate: string;
  title: string;
  questionCount: number;
  estimatedMinutes: number;
  questions: QuestionDto[];
}

export interface QuizAnswerDto {
  questionId: string;
  selectedOptionId: string | null;
  timeSpentSeconds?: number;
}

export interface QuizAttemptDto {
  id: string;
  status: AttemptStatus;
  startedAt: string;
  completedAt: string | null;
  currentQuestionIndex: number;
  dailyQuizId: string;
}

export interface QuestionFeedbackDto {
  questionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  clinicalPearl: string | null;
  memoryTrick: string | null;
}

export interface TopicPerformanceDto {
  topicId: string;
  topicName: string;
  subjectName: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface QuizResultsDto {
  attemptId: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  weakTopics: TopicPerformanceDto[];
  strongTopics: TopicPerformanceDto[];
  feedback: QuestionFeedbackDto[];
}

export interface StreakDto {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface HomeScreenDto {
  user: { id: string; name: string };
  streak: StreakDto;
  todayQuiz: {
    id: string;
    title: string;
    questionCount: number;
    estimatedMinutes: number;
    status: 'not_started' | 'in_progress' | 'completed';
    previousScore: number | null;
    attemptId: string | null;
  };
}

export interface SubjectPerformanceDto {
  subjectId: string;
  subjectName: string;
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
}

export interface AnalyticsDto {
  weeklyAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  quizzesCompleted: number;
  averageScore: number;
  weakSubjects: SubjectPerformanceDto[];
  strongSubjects: SubjectPerformanceDto[];
}

export interface BookmarkDto {
  id: string;
  questionId: string;
  stem: string;
  topicName: string;
  subjectName: string;
  createdAt: string;
}

export interface RetryQuestionDto extends QuestionDto {
  previousAnswer: {
    selectedOptionId: string | null;
    isCorrect: boolean;
  };
  feedback: QuestionFeedbackDto;
}
