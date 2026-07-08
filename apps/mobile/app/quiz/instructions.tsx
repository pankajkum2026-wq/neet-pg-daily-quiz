import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/services/api';

export default function InstructionsScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const router = useRouter();

  const handleStart = async () => {
    if (!quizId) return;
    try {
      const attempt = await api.startAttempt(quizId);
      router.replace({ pathname: '/quiz/[attemptId]', params: { attemptId: attempt.id } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📝</Text>
      <Text style={styles.title}>Daily Quiz Instructions</Text>
      <View style={styles.rules}>
        <Text style={styles.rule}>• 10 multiple-choice questions</Text>
        <Text style={styles.rule}>• Mixed subjects, faculty-curated</Text>
        <Text style={styles.rule}>• Estimated time: 8 minutes</Text>
        <Text style={styles.rule}>• Instant feedback after each question</Text>
        <Text style={styles.rule}>• Your progress is saved if you exit</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Begin Quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 24, justifyContent: 'center' },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 24 },
  rules: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 32 },
  rule: { fontSize: 16, color: '#475569', marginBottom: 10, lineHeight: 24 },
  button: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
