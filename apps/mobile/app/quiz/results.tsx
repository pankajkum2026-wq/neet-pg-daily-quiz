import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { QuizResultsDto } from '@repo/shared';
import { api } from '@/services/api';

export default function ResultsScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const router = useRouter();
  const [results, setResults] = useState<QuizResultsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    api
      .getResults(attemptId)
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading || !results) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  const minutes = Math.floor(results.timeTakenSeconds / 60);
  const seconds = results.timeTakenSeconds % 60;
  const wrongCount = results.feedback.filter((f) => !f.isCorrect).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Quiz Completed!</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.score}>
          {results.score}/{results.totalQuestions}
        </Text>
        <Text style={styles.accuracy}>{results.accuracy}% Accuracy</Text>
        <Text style={styles.time}>
          Time: {minutes}m {seconds}s
        </Text>
      </View>

      {results.weakTopics.length > 0 && (
        <View style={styles.topicCard}>
          <Text style={styles.topicTitle}>Weak Topics</Text>
          {results.weakTopics.map((t) => (
            <Text key={t.topicId} style={styles.topicItem}>
              • {t.topicName} ({t.accuracy}%)
            </Text>
          ))}
        </View>
      )}

      {results.strongTopics.length > 0 && (
        <View style={styles.topicCard}>
          <Text style={styles.topicTitle}>Strong Topics</Text>
          {results.strongTopics.map((t) => (
            <Text key={t.topicId} style={styles.topicItem}>
              • {t.topicName}
            </Text>
          ))}
        </View>
      )}

      {wrongCount > 0 && (
        <TouchableOpacity style={styles.reviewButton} onPress={() => setShowFeedback(!showFeedback)}>
          <Text style={styles.reviewButtonText}>
            {showFeedback ? 'Hide' : 'Review'} Wrong Answers ({wrongCount})
          </Text>
        </TouchableOpacity>
      )}

      {showFeedback &&
        results.feedback
          .filter((f) => !f.isCorrect)
          .map((f) => (
            <View key={f.questionId} style={styles.feedbackCard}>
              <Text style={styles.feedbackExplanation}>{f.explanation}</Text>
              {f.clinicalPearl && (
                <Text style={styles.pearl}>💡 {f.clinicalPearl}</Text>
              )}
              {f.memoryTrick && (
                <Text style={styles.trick}>🧠 {f.memoryTrick}</Text>
              )}
            </View>
          ))}

      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/')}>
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 20, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  scoreCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  score: { fontSize: 48, fontWeight: '800', color: '#fff' },
  accuracy: { fontSize: 18, color: '#94b8d9', marginTop: 4 },
  time: { fontSize: 14, color: '#94b8d9', marginTop: 8 },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  topicTitle: { fontSize: 16, fontWeight: '600', color: '#1e3a5f', marginBottom: 8 },
  topicItem: { fontSize: 14, color: '#475569', marginBottom: 4 },
  reviewButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reviewButtonText: { fontSize: 16, fontWeight: '600', color: '#1e3a5f', textAlign: 'center' },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 8,
  },
  feedbackExplanation: { fontSize: 14, color: '#334155', lineHeight: 22 },
  pearl: { fontSize: 13, color: '#0369a1', marginTop: 8, fontStyle: 'italic' },
  trick: { fontSize: 13, color: '#7c3aed', marginTop: 4 },
  homeButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 12,
    marginBottom: 32,
  },
  homeButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
