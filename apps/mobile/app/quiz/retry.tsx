import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { RetryQuestionDto } from '@repo/shared';
import { api } from '@/services/api';

export default function RetryScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const router = useRouter();
  const [questions, setQuestions] = useState<RetryQuestionDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    api
      .getIncorrect(attemptId)
      .then(setQuestions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No incorrect answers to review!</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[currentIndex];
  const { feedback } = question;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>
        Review {currentIndex + 1} of {questions.length}
      </Text>

      <Text style={styles.topic}>
        {question.topic.subject.name} → {question.topic.name}
      </Text>
      <Text style={styles.stem}>{question.stem}</Text>

      {question.options.map((option) => {
        const isCorrect = feedback.correctOptionId === option.id;
        const wasSelected = question.previousAnswer.selectedOptionId === option.id;
        return (
          <View
            key={option.id}
            style={[
              styles.option,
              isCorrect && styles.optionCorrect,
              wasSelected && !isCorrect && styles.optionWrong,
            ]}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionText}>{option.text}</Text>
          </View>
        );
      })}

      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackExplanation}>{feedback.explanation}</Text>
        {feedback.clinicalPearl && <Text style={styles.pearl}>💡 {feedback.clinicalPearl}</Text>}
        {feedback.memoryTrick && <Text style={styles.trick}>🧠 {feedback.memoryTrick}</Text>}
      </View>

      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navDisabled]}
          onPress={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>
        {currentIndex < questions.length - 1 ? (
          <TouchableOpacity style={styles.navButtonPrimary} onPress={() => setCurrentIndex((i) => i + 1)}>
            <Text style={styles.navTextPrimary}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButtonPrimary} onPress={() => router.back()}>
            <Text style={styles.navTextPrimary}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  empty: { fontSize: 16, color: '#94a3b8', marginBottom: 16 },
  header: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  topic: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  stem: { fontSize: 18, fontWeight: '600', color: '#1e293b', lineHeight: 26, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCorrect: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  optionWrong: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  optionLabel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    marginRight: 12,
    overflow: 'hidden',
  },
  optionText: { flex: 1, fontSize: 15, color: '#334155' },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  feedbackExplanation: { fontSize: 14, color: '#334155', lineHeight: 22 },
  pearl: { fontSize: 13, color: '#0369a1', marginTop: 8, fontStyle: 'italic' },
  trick: { fontSize: 13, color: '#7c3aed', marginTop: 4 },
  nav: { flexDirection: 'row', justifyContent: 'space-between' },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  navDisabled: { opacity: 0.4 },
  navButtonPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1e3a5f',
  },
  navText: { fontSize: 16, fontWeight: '600', color: '#475569' },
  navTextPrimary: { fontSize: 16, fontWeight: '600', color: '#fff' },
  backButton: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: { color: '#fff', fontWeight: '600' },
});
