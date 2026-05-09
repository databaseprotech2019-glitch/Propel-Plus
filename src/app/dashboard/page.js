'use client'
import { useEffect } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function DashboardPage() {
  const { currentUser, loading, DB } = useDB()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
  }, [loading, currentUser])

  if (loading || !currentUser) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#EEF3F7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12
      }}>
        <img src="/Propel.png" style={{ width: 120, height: 120, borderRadius: 20 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 0.2, 0.4].map((d, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%', background: '#2196F3',
              animation: `dotPulse 1s ease-in-out infinite ${d}s`
            }} />
          ))}
        </div>
      </div>
    )
  }

  const isAdmin = currentUser.role === 'admin'
  const level = currentUser.level
  const students = Object.values(DB.users).filter(u => u.role === 'student')

  // Progress helpers
  function getProgress(email, level) {
    if (!DB.progress[email]) return []
    if (!DB.progress[email][level]) return []
    return DB.progress[email][level]
  }
  function getCompletedCount(email, level) {
    return getProgress(email, level).length
  }
  function getTotalTopics(level) {
    const counts = { basic: 57, intermediate: 68, advanced: 62 }
    return counts[level] || 0
  }
  function getAttnStats(email) {
    const a = DB.attendance[email] || {}
    let present = 0, absent = 0
    for (let w = 1; w <= 10; w++)
      for (let d = 0; d < 4; d++) {
        const k = `W${w}D${d}`
        if (a[k] === 'present') present++
        else if (a[k] === 'absent') absent++
      }
    return { present, absent, unmarked: 40 - present - absent }
  }

  if (isAdmin) {
    const totalStudents = students.length
    const newStudents = students.filter(s => !s.joinedAt || (Date.now() - s.joinedAt) < 180 * 24 * 60 * 60 * 1000).length
    const allFeedbacks = Object.values(DB.feedbacks).flat()
    const pendingFeedbacks = allFeedbacks.filter(f => !f.actionTaken).length
    const certCount = Object.values(DB.certificates).filter(c => c && c.distributed).length
    const pendingRefs = (DB.referrals || []).filter(r => r.status === 'pending').length

    const stats = [
      { label: 'Total Students', value: totalStudents, color: '#1E88E5', tag: 'Total' },
      { label: 'New Students', value: newStudents, color: '#2ECC71', tag: 'New' },
      { label: 'Long-term', value: totalStudents - newStudents, color: '#1E88E5', tag: 'Old' },
      { label: 'Pending Feedbacks', value: pendingFeedbacks, color: '#E53935', tag: 'Open' },
      { label: 'Certs Issued', value: certCount, color: '#2ECC71', tag: 'Certs' },
      { label: 'Pending Referrals', value: pendingRefs, color: '#FF8F00', tag: 'Refs' },
    ]

    return (
      <AppLayout>
        <div style={{ padding: '24px 32px' }}>
          <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Dashboard</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Welcome back, {currentUser.name}</div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 20, boxShadow: 'var(--shadow)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20, background: `${s.color}18`, color: s.color, display: 'inline-block', marginBottom: 12 }}>{s.tag}</div>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '0 0 12px 12px' }} />
              </div>
            ))}
          </div>

          {/* Students Table */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, fontFamily: 'Cabinet Grotesk' }}>Student Overview</div>
            {!students.length ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No students yet</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Student', 'Level', 'Progress', 'Attendance'].map(h => (
                        <th key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const done = getCompletedCount(s.email, s.level)
                      const total = getTotalTopics(s.level)
                      const pct = total ? Math.round(done / total * 100) : 0
                      const attn = getAttnStats(s.email)
                      const apct = Math.round(attn.present / 40 * 100)
                      const levelColors = { basic: '#2ECC71', intermediate: '#1E88E5', advanced: '#8E44AD' }
                      const lc = levelColors[s.level] || '#1E88E5'
                      return (
                        <tr key={s.email} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.email}</div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: `${lc}18`, color: lc, border: `1px solid ${lc}40`, borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                              {s.level === 'basic' ? 'Beginner' : s.level === 'intermediate' ? 'Intermediate' : 'Expert'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', minWidth: 120 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 600, color: 'var(--muted)' }}>
                              <span>{done}/{total}</span><span style={{ color: pct >= 80 ? '#27AE60' : pct >= 50 ? '#FF8F00' : '#E53935' }}>{pct}%</span>
                            </div>
                            <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: lc, borderRadius: 3 }} />
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', minWidth: 110 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 600, color: 'var(--muted)' }}>
                              <span>{attn.present}/40</span><span style={{ color: apct >= 80 ? '#27AE60' : apct >= 50 ? '#FF8F00' : '#E53935' }}>{apct}%</span>
                            </div>
                            <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${apct}%`, background: '#FF8F00', borderRadius: 3 }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    )
  }

  // Student Dashboard
  const done = getCompletedCount(currentUser.email, level)
  const total = getTotalTopics(level)
  const pct = total ? Math.round(done / total * 100) : 0
  const attn = getAttnStats(currentUser.email)
  const attnPct = Math.round(attn.present / 40 * 100)
  const levelLabel = level === 'basic' ? 'Beginner' : level === 'intermediate' ? 'Intermediate' : 'Expert'
  const levelColor = level === 'basic' ? '#2ECC71' : level === 'intermediate' ? '#1E88E5' : '#8E44AD'

  const stats = [
    { label: 'Total Topics', value: total, tag: 'Topics', color: '#1E88E5' },
    { label: 'Completed', value: done, tag: 'Done', color: '#2ECC71' },
    { label: 'Remaining', value: total - done, tag: 'Left', color: '#FF8F00' },
    { label: 'Progress', value: `${pct}%`, tag: 'Rate', color: '#8E44AD' },
    { label: 'Attendance', value: `${attn.present}/40`, tag: 'Days', color: '#FF8F00' },
  ]

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Dashboard</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Welcome back, {currentUser.name}</div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, boxShadow: 'var(--shadow)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20, background: `${s.color}18`, color: s.color, display: 'inline-block', marginBottom: 12 }}>{s.tag}</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '0 0 12px 12px' }} />
            </div>
          ))}
        </div>

        {/* Progress Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Cabinet Grotesk' }}>Course Progress</div>
              <span style={{ background: `${levelColor}18`, color: levelColor, border: `1px solid ${levelColor}40`, borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{levelLabel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>
              <span>{done} / {total} topics</span><span>{pct}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: levelColor, borderRadius: 3, transition: 'width .7s' }} />
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 12 }}>Attendance (40 Days)</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>
              <span>{attn.present} present · {attn.absent} absent</span><span>{attnPct}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${attnPct}%`, background: '#FF8F00', borderRadius: 3, transition: 'width .7s' }} />
            </div>
          </div>
        </div>

        {/* Course Card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 6 }}>Master Research Course – {levelLabel}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>Track your learning journey topic by topic.</div>
          <button onClick={() => router.push('/course')} style={{
            marginTop: 12, padding: '9px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#2196F3,#1565C0)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}>View My Course →</button>
        </div>
      </div>
    </AppLayout>
  )
}