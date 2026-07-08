import { useEffect, useState, useCallback } from 'react';
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
import type { QuestionDto } from '@repo/shared';
import { api, type AttemptData } from '@/services/api';

interface AttemptDataWithQuestions extends AttemptData {
  questions: QuestionDto[];
}

export default function QuizScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptDataWithQuestions | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    api
      .getAttempt(attemptId)
      .then((data) => {
        setAttempt(data);
        setCurrentIndex(data.currentQuestionIndex ?? 0);
        const existing = data.answers?.find(
          (a) => a.questionId === data.questions[data.currentQuestionIndex ?? 0]?.id,
        );
        setSelectedOption(existing?.selectedOptionId ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  const saveAnswer = useCallback(
    async (questionId: string, optionId: string | null, index: number) => {
      if (!attemptId) return;
      await api.updateAttempt(attemptId, {
        currentQuestionIndex: index,
        answers: [{ questionId, selectedOptionId: optionId }],
      });
    },
    [attemptId],
  );

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
    if (attempt) {
      const question = attempt.questions[currentIndex];
      saveAnswer(question.id, optionId, currentIndex);
    }
  };

  const handleNext = async () => {
    if (!attempt) return;
    if (currentIndex < attempt.questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const existing = attempt.answers?.find(
        (a) => a.questionId === attempt.questions[nextIndex].id,
      );
      setSelectedOption(existing?.selectedOptionId ?? null);
      await saveAnswer(attempt.questions[currentIndex].id, selectedOption, nextIndex);
    }
  };

  const handlePrevious = () => {
    if (!attempt || currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    const existing = attempt.answers?.find((a) => a.questionId === attempt.questions[prevIndex].id);
    setSelectedOption(existing?.selectedOptionId ?? null);
  };

  const handleSubmit = async () => {
    if (!attemptId || !attempt) return;

    Alert.alert('Submit Quiz', 'Are you sure you want to submit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          setSubmitting(true);
          try {
            const question = attempt.questions[currentIndex];
            await saveAnswer(question.id, selectedOption, currentIndex);
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

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {attempt.questions.length}
        </Text>
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

        {question.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.option, selectedOption === option.id && styles.optionSelected]}
            onPress={() => handleSelect(option.id)}
          >
            <Text
              style={[styles.optionLabel, selectedOption === option.id && styles.optionLabelSelected]}
            >
              {option.label}
            </Text>
            <Text
              style={[styles.optionText, selectedOption === option.id && styles.optionTextSelected]}
            >
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
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
            style={[styles.submitButton, submitting && styles.navButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !selectedOption}
          >
            <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            disabled={!selectedOption}
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
  progressText: { fontSize: 14, color: '#64748b', marginBottom: 8 },
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
  optionText: { flex: 1, fontSize: 16, color: '#334155' },
  optionTextSelected: { color: '#1e3a5f', fontWeight: '500' },
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
