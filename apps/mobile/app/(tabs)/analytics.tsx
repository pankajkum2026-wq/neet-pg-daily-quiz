import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { AnalyticsDto } from '@repo/shared';
import { api } from '@/services/api';

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Complete quizzes to see your analytics</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroValue}>{analytics.weeklyAccuracy}%</Text>
        <Text style={styles.heroLabel}>Weekly Accuracy</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🔥 {analytics.currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analytics.quizzesCompleted}</Text>
          <Text style={styles.statLabel}>Quizzes Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analytics.averageScore}/10</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
      </View>

      {analytics.weakSubjects.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weak Subjects</Text>
          {analytics.weakSubjects.map((s) => (
            <View key={s.subjectId} style={styles.subjectRow}>
              <Text style={styles.subjectName}>{s.subjectName}</Text>
              <Text style={styles.subjectAccuracy}>{s.accuracy}%</Text>
            </View>
          ))}
        </View>
      )}

      {analytics.strongSubjects.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Strong Subjects</Text>
          {analytics.strongSubjects.map((s) => (
            <View key={s.subjectId} style={styles.subjectRow}>
              <Text style={styles.subjectName}>{s.subjectName}</Text>
              <Text style={[styles.subjectAccuracy, styles.strongAccuracy]}>{s.accuracy}%</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Longest Streak</Text>
        <Text style={styles.longestStreak}>🔥 {analytics.longestStreak} days</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  empty: { fontSize: 16, color: '#94a3b8', textAlign: 'center' },
  heroCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroValue: { fontSize: 48, fontWeight: '800', color: '#fff' },
  heroLabel: { fontSize: 16, color: '#94b8d9', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1e3a5f' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e3a5f', marginBottom: 12 },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  subjectName: { fontSize: 15, color: '#334155' },
  subjectAccuracy: { fontSize: 15, fontWeight: '600', color: '#dc2626' },
  strongAccuracy: { color: '#16a34a' },
  longestStreak: { fontSize: 24, fontWeight: '700', color: '#1e3a5f' },
});
