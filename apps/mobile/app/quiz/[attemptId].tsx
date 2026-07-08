import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { QuestionFeedbackDto } from '@repo/shared';
import { api, type AttemptData } from '@/services/api';

export default function QuizScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<QuestionFeedbackDto | null>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    api
      .getAttempt(attemptId)
      .then((data) => {
        setAttempt(data);
        setCurrentIndex(data.currentQuestionIndex ?? 0);
        const answered = new Set(data.answers.map((a) => a.questionId));
        setAnsweredIds(answered);
        startTimeRef.current = new Date(data.startedAt);
        const idx = data.currentQuestionIndex ?? 0;
        const existing = data.answers.find((a) => a.questionId === data.questions[idx]?.id);
        setSelectedOption(existing?.selectedOptionId ?? null);
        if (existing?.selectedOptionId) {
          setAnsweredIds((prev) => new Set(prev).add(existing.questionId));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => {
    if (!startTimeRef.current) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current!.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [attempt]);

  const saveAnswer = useCallback(
    async (questionId: string, optionId: string, index: number) => {
      if (!attemptId) return null;
      const result = await api.updateAttempt(attemptId, {
        currentQuestionIndex: index,
        answers: [{ questionId, selectedOptionId: optionId }],
      });
      setAttempt(result);
      return result.feedback?.[0] ?? null;
    },
    [attemptId],
  );

  const handleSelect = async (optionId: string) => {
    if (!attempt || feedback) return;
    const question = attempt.questions[currentIndex];
    if (answeredIds.has(question.id)) return;

    setSelectedOption(optionId);
    const fb = await saveAnswer(question.id, optionId, currentIndex);
    if (fb) {
      setFeedback(fb);
      setAnsweredIds((prev) => new Set(prev).add(question.id));
    }
  };

  const handleNext = () => {
    if (!attempt) return;
    setFeedback(null);
    if (currentIndex < attempt.questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const existing = attempt.answers.find(
        (a) => a.questionId === attempt.questions[nextIndex].id,
      );
      setSelectedOption(existing?.selectedOptionId ?? null);
    }
  };

  const handlePrevious = () => {
    if (!attempt || currentIndex === 0) return;
    setFeedback(null);
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    const existing = attempt.answers.find((a) => a.questionId === attempt.questions[prevIndex].id);
    setSelectedOption(existing?.selectedOptionId ?? null);
  };

  const handleSubmit = () => {
    if (!attemptId || !attempt) return;

    Alert.alert('Submit Quiz', 'Are you sure you want to submit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          setSubmitting(true);
          try {
            await api.submitAttempt(attemptId);
            router.replace({ pathname: '/quiz/results', params: { attemptId } });
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Submit failed');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loading || !attempt) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  const question = attempt.questions[currentIndex];
  const isLast = currentIndex === attempt.questions.length - 1;
  const isAnswered = answeredIds.has(question.id);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {attempt.questions.length}
          </Text>
          <Text style={styles.timer}>
            ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / attempt.questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.questionArea} contentContainerStyle={styles.questionContent}>
        <Text style={styles.topic}>
          {question.topic.subject.name} → {question.topic.name}
        </Text>
        <Text style={styles.stem}>{question.stem}</Text>

        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = feedback?.correctOptionId === option.id;
          const isWrong = isSelected && feedback && !feedback.isCorrect;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && !feedback && styles.optionSelected,
                feedback && isCorrect && styles.optionCorrect,
                feedback && isWrong && styles.optionWrong,
              ]}
              onPress={() => handleSelect(option.id)}
              disabled={isAnswered}
            >
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && !feedback && styles.optionLabelSelected,
                  feedback && isCorrect && styles.optionLabelCorrect,
                  feedback && isWrong && styles.optionLabelWrong,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          );
        })}

        {feedback && (
          <View style={[styles.feedbackCard, feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>
              {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </Text>
            <Text style={styles.feedbackExplanation}>{feedback.explanation}</Text>
            {feedback.clinicalPearl && (
              <Text style={styles.pearl}>💡 {feedback.clinicalPearl}</Text>
            )}
            {feedback.memoryTrick && (
              <Text style={styles.trick}>🧠 {feedback.memoryTrick}</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting || answeredIds.size < attempt.questions.length) && styles.navButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || answeredIds.size < attempt.questions.length}
          >
            <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, !feedback && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={!feedback}
          >
            <Text style={[styles.navButtonText, styles.nextButtonText]}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progress: { padding: 16, backgroundColor: '#fff' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 14, color: '#64748b' },
  timer: { fontSize: 14, fontWeight: '600', color: '#1e3a5f' },
  progressBar: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#1e3a5f', borderRadius: 2 },
  questionArea: { flex: 1 },
  questionContent: { padding: 20 },
  topic: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
  stem: { fontSize: 18, fontWeight: '600', color: '#1e293b', lineHeight: 26, marginBottom: 24 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: { borderColor: '#1e3a5f', backgroundColor: '#eff6ff' },
  optionCorrect: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  optionWrong: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '700',
    color: '#475569',
    marginRight: 12,
    overflow: 'hidden',
  },
  optionLabelSelected: { backgroundColor: '#1e3a5f', color: '#fff' },
  optionLabelCorrect: { backgroundColor: '#16a34a', color: '#fff' },
  optionLabelWrong: { backgroundColor: '#dc2626', color: '#fff' },
  optionText: { flex: 1, fontSize: 16, color: '#334155' },
  feedbackCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
  },
  feedbackCorrect: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  feedbackWrong: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  feedbackTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#1e293b' },
  feedbackExplanation: { fontSize: 14, color: '#334155', lineHeight: 22 },
  pearl: { fontSize: 13, color: '#0369a1', marginTop: 8, fontStyle: 'italic' },
  trick: { fontSize: 13, color: '#7c3aed', marginTop: 4 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  navButtonDisabled: { opacity: 0.4 },
  navButtonText: { fontSize: 16, fontWeight: '600', color: '#475569' },
  nextButton: { backgroundColor: '#1e3a5f' },
  nextButtonText: { color: '#fff' },
  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
  },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
