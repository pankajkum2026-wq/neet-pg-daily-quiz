const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function fetchDashboard() {
  try {
    const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { 'X-Dev-Firebase-Uid': 'seed-faculty-uid' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await fetchDashboard();

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: '#64748b' }}>NEET PG Daily Quiz — Faculty CMS</p>

      {stats ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          {[
            { label: 'Total Questions', value: stats.totalQuestions },
            { label: 'Published Questions', value: stats.publishedQuestions },
            { label: 'Published Quizzes', value: stats.totalQuizzes },
            { label: 'Completed Attempts', value: stats.totalAttempts },
            { label: 'Students', value: stats.totalUsers },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: 'white',
                borderRadius: 8,
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f' }}>
                {card.value}
              </div>
              <div style={{ color: '#64748b', marginTop: '0.5rem' }}>{card.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            marginTop: '2rem',
            padding: '2rem',
            background: '#fef3c7',
            borderRadius: 8,
            color: '#92400e',
          }}
        >
          API not reachable. Start the API server with <code>pnpm dev --filter @repo/api</code>
        </div>
      )}
    </div>
  );
}
