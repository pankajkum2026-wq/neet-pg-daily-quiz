const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function fetchQuestions() {
  try {
    const res = await fetch(`${API_URL}/questions?status=published`, {
      headers: { 'X-Dev-Firebase-Uid': 'seed-faculty-uid' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function QuestionsPage() {
  const questions = await fetchQuestions();

  return (
    <div>
      <h1>Questions</h1>
      <p style={{ color: '#64748b' }}>{questions.length} published questions</p>

      <div style={{ marginTop: '1.5rem' }}>
        {questions.map(
          (q: {
            id: string;
            stem: string;
            status: string;
            topic: { name: string; subject: { name: string } };
          }) => (
            <div
              key={q.id}
              style={{
                background: 'white',
                borderRadius: 8,
                padding: '1rem 1.5rem',
                marginBottom: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                {q.topic.subject.name} → {q.topic.name}
              </div>
              <div>{q.stem}</div>
            </div>
          ),
        )}
        {questions.length === 0 && (
          <p style={{ color: '#94a3b8' }}>No questions found. Run db:seed to populate sample data.</p>
        )}
      </div>
    </div>
  );
}
