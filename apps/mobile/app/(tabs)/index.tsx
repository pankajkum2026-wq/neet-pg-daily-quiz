import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { HomeScreenDto } from '@repo/shared';
import { api } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [home, setHome] = useState<HomeScreenDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getHome()
      .then(setHome)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStartQuiz = async () => {
    if (!home?.todayQuiz.id) return;

    try {
      if (home.todayQuiz.status === 'completed' && home.todayQuiz.attemptId) {
        router.push({ pathname: '/quiz/results', params: { attemptId: home.todayQuiz.attemptId } });
        return;
      }

      if (home.todayQuiz.status === 'in_progress' && home.todayQuiz.attemptId) {
        router.push({ pathname: '/quiz/[attemptId]', params: { attemptId: home.todayQuiz.attemptId } });
        return;
      }

      router.push({ pathname: '/quiz/instructions', params: { quizId: home.todayQuiz.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start quiz');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  if (error || !home) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Failed to load'}</Text>
        <Text style={styles.hint}>Make sure the API is running on port 3001</Text>
      </View>
    );
  }

  const buttonLabel =
    home.todayQuiz.status === 'completed'
      ? 'View Results'
      : home.todayQuiz.status === 'in_progress'
        ? 'Continue Quiz'
        : 'Start Quiz';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>👋 Welcome, {home.user.name}</Text>

      <View style={styles.quizCard}>
        <Text style={styles.quizEmoji}>🔥</Text>
        <Text style={styles.quizTitle}>Daily Quiz</Text>
        <Text style={styles.quizMeta}>
          {home.todayQuiz.questionCount} Questions · ~{home.todayQuiz.estimatedMinutes} Minutes
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
          <Text style={styles.startButtonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🔥 {home.streak.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {home.todayQuiz.previousScore !== null ? `${home.todayQuiz.previousScore}/10` : '—'}
          </Text>
          <Text style={styles.statLabel}>Previous Score</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  greeting: { fontSize: 22, fontWeight: '600', color: '#1e293b', marginBottom: 20 },
  quizCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  quizEmoji: { fontSize: 40, marginBottom: 8 },
  quizTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  quizMeta: { fontSize: 14, color: '#94b8d9', marginTop: 8, marginBottom: 20 },
  startButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1e3a5f' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  errorText: { fontSize: 16, color: '#dc2626', textAlign: 'center' },
  hint: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
});
