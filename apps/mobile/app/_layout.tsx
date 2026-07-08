import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/instructions" options={{ title: 'Quiz Instructions' }} />
        <Stack.Screen name="quiz/[attemptId]" options={{ title: 'Daily Quiz' }} />
        <Stack.Screen name="quiz/results" options={{ title: 'Results', headerBackVisible: false }} />
        <Stack.Screen name="quiz/retry" options={{ title: 'Review Wrong Answers' }} />
      </Stack>
    </>
  );
}
