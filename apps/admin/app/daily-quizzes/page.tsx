export default function DailyQuizzesPage() {
  return (
    <div>
      <h1>Daily Quizzes</h1>
      <p style={{ color: '#64748b' }}>
        Assemble and publish daily quizzes with 10 mixed-subject questions.
      </p>
      <div
        style={{
          marginTop: '2rem',
          padding: '2rem',
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h3>Create Daily Quiz</h3>
        <p style={{ color: '#64748b' }}>
          Use the API endpoint <code>POST /api/v1/admin/daily-quizzes</code> with 10 question IDs,
          then publish via <code>PATCH /api/v1/admin/daily-quizzes/:id/publish</code>.
        </p>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>
          Full quiz builder UI coming in Phase 2.
        </p>
      </div>
    </div>
  );
}
