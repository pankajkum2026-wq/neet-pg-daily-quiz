'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const headers = {
  'Content-Type': 'application/json',
  'X-Dev-Firebase-Uid': 'seed-faculty-uid',
};

interface Question {
  id: string;
  stem: string;
  topic: { name: string; subject: { name: string } };
}

interface DailyQuiz {
  id: string;
  quizDate: string;
  title: string;
  status: string;
  _count: { questions: number; attempts: number };
}

export default function DailyQuizzesPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quizDate, setQuizDate] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setQuizDate(tomorrow.toISOString().split('T')[0]);
    setTitle(`Daily Quiz — ${tomorrow.toISOString().split('T')[0]}`);

    Promise.all([
      fetch(`${API_URL}/questions?status=published`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/admin/daily-quizzes`, { headers }).then((r) => r.json()),
    ])
      .then(([q, d]) => {
        setQuestions(q);
        setQuizzes(d);
      })
      .catch(() => setMessage('API not reachable'));
  }, []);

  const toggleQuestion = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 10) {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreate = async () => {
    if (selected.size !== 10) {
      setMessage('Select exactly 10 questions');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/admin/daily-quizzes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          quizDate,
          title,
          questionIds: Array.from(selected),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create quiz');

      await fetch(`${API_URL}/admin/daily-quizzes/${data.id}/publish`, {
        method: 'PATCH',
        headers,
      });

      setMessage(`Quiz "${title}" created and published!`);
      setSelected(new Set());
      const updated = await fetch(`${API_URL}/admin/daily-quizzes`, { headers }).then((r) =>
        r.json(),
      );
      setQuizzes(updated);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error creating quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Daily Quizzes</h1>
      <p style={{ color: '#64748b' }}>Assemble and publish daily quizzes with 10 mixed-subject questions.</p>

      {message && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: 8,
            background: message.includes('published') ? '#dcfce7' : '#fef3c7',
            color: message.includes('published') ? '#166534' : '#92400e',
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h3>Create Quiz ({selected.size}/10 selected)</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#64748b' }}>
              Quiz Date
            </label>
            <input
              type="date"
              value={quizDate}
              onChange={(e) => {
                setQuizDate(e.target.value);
                setTitle(`Daily Quiz — ${e.target.value}`);
              }}
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#64748b' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', width: '100%' }}
            />
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {questions.map((q) => (
              <label
                key={q.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: selected.has(q.id) ? '#eff6ff' : '#fff',
                  borderRadius: 8,
                  border: selected.has(q.id) ? '2px solid #1e3a5f' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {q.topic.subject.name} → {q.topic.name}
                  </div>
                  <div style={{ fontSize: 14 }}>{q.stem}</div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || selected.size !== 10}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 2rem',
              background: selected.size === 10 ? '#1e3a5f' : '#94a3b8',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: selected.size === 10 ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Creating...' : 'Create & Publish Quiz'}
          </button>
        </div>

        <div>
          <h3>Published Quizzes</h3>
          {quizzes.map((q) => (
            <div
              key={q.id}
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: '1rem',
                marginBottom: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ fontWeight: 600 }}>{q.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                {new Date(q.quizDate).toISOString().split('T')[0]} · {q._count.questions}{' '}
                questions · {q._count.attempts} attempts ·{' '}
                <span style={{ color: q.status === 'published' ? '#16a34a' : '#f59e0b' }}>
                  {q.status}
                </span>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && (
            <p style={{ color: '#94a3b8' }}>No quizzes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
