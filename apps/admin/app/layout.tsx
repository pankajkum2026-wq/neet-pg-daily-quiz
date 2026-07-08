export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
        <nav
          style={{
            background: '#1e3a5f',
            color: 'white',
            padding: '1rem 2rem',
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <strong style={{ fontSize: '1.2rem' }}>DBMCI Admin</strong>
          <a href="/" style={{ color: 'white', textDecoration: 'none' }}>
            Dashboard
          </a>
          <a href="/questions" style={{ color: 'white', textDecoration: 'none' }}>
            Questions
          </a>
          <a href="/daily-quizzes" style={{ color: 'white', textDecoration: 'none' }}>
            Daily Quizzes
          </a>
        </nav>
        <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  );
}
