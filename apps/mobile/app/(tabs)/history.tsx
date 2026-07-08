import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { api, type HistoryItem } from '@/services/api';

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.attemptId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No quiz history yet. Complete your first daily quiz!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.quizDate}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.row}>
              <Text style={styles.score}>
                {item.score}/10 ({item.accuracy}%)
              </Text>
              <Text style={styles.time}>
                {Math.floor(item.timeTakenSeconds / 60)}m {item.timeTakenSeconds % 60}s
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
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
  date: { fontSize: 12, color: '#94a3b8' },
  title: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  score: { fontSize: 14, fontWeight: '600', color: '#1e3a5f' },
  time: { fontSize: 14, color: '#64748b' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 16 },
});
