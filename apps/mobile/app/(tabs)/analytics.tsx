import { View, Text, StyleSheet } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>Coming in Phase 2</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Accuracy</Text>
        <Text style={styles.placeholder}>Complete more quizzes to see your analytics</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weak Subjects</Text>
        <Text style={styles.placeholder}>Anatomy, Pharmacology</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Strong Subjects</Text>
        <Text style={styles.placeholder}>Medicine, Pathology</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e3a5f', marginBottom: 8 },
  placeholder: { fontSize: 14, color: '#64748b' },
});
