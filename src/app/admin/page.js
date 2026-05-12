'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function AdminPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const students = Object.values(DB.users).filter(u => u.role === 'student')
  const SIX = 180 * 24 * 60 * 60 * 1000
  const newS = students.filter(s => !s.joinedAt || (Date.now() - s.joinedAt) < SIX)
  const oldS = students.filter(s => s.joinedAt && (Date.now() - s.joinedAt) >= SIX)

  function getProgress(email, level) {
    return DB.progress?.[email]?.[level] || []
  }
  function getTotalTopics(level) {
    const counts = { basic: 57, intermediate: 68, advanced: 62 }
    return counts[level] || 0
  }
  function getAttnStats(email) {
    const a = DB.attendance?.[email] || {}
    let present = 0, absent = 0
    for (let w = 1; w <= 10; w++)
      for (let d = 0; d < 4; d++) {
        const k = `W${w}D${d}`
        if (a[k] === 'present') present++
        else if (a[k] === 'absent') absent++
      }
    return { present, absent }
  }
  function getNextSunday(date) {
    const d = new Date(date); d.setHours(0,0,0,0)
    const day = d.getDay()
    if (day === 0) return d
    d.setDate(d.getDate() + (7 - day))
    return d
  }

  async function changeLevel(email, newLevel) {
    const newDB = { ...DB }
    newDB.users[email].level = newLevel
    await saveDB(newDB)
  }

  async function deleteStudent(email, name) {
    if (!confirm(`⚠️ Delete ${name}? This cannot be undone.`)) return
    const newDB = { ...DB }
    delete newDB.users[email]
    delete newDB.progress[email]
    delete newDB.attendance[email]
    delete newDB.feedbacks[email]
    delete newDB.certificates[email]
    delete newDB.activities[email]
    delete newDB.profilePics[email]
    if (newDB.studentsPlus) delete newDB.studentsPlus[email]
    newDB.referrals = (newDB.referrals || []).filter(r => r.referrerEmail !== email)
    await saveDB(newDB)
  }

  function renderTable(list, label, color) {
    if (!list.length) return (
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
        No students in this category.
      </div>
    )

    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <div style={{ padding: '12px 16px', background: `${color}08`, borderBottom: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk', color }}>{label}</div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{list.length} student{list.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Student', 'Level', 'Joined', 'Progress', 'Attendance', 'Certificate', 'Actions'].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(s => {
                const done = getProgress(s.email, s.level).length
                const total = getTotalTopics(s.level)
                const pct = total ? Math.round(done / total * 100) : 0
                const attn = getAttnStats(s.email)
                const apct = Math.round(attn.present / 40 * 100)
                const cert = DB.certificates?.[s.email]
                const pic = DB.profilePics?.[s.email]
                const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                const levelColors = { basic: '#2ECC71', intermediate: '#1E88E5', advanced: '#8E44AD' }
                const lc = levelColors[s.level] || '#1E88E5'
                const fc = s.joinedAt ? getNextSunday(new Date(s.joinedAt)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

                return (
                  <tr key={s.email} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: pic ? 'transparent' : `linear-gradient(135deg,${lc},${lc}aa)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden'
                        }}>
                          {pic ? <img src={pic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.email}</div>
                          {s.phone && <div style={{ fontSize: 11, color: 'var(--text2)' }}>📞 {s.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <select value={s.level} onChange={e => changeLevel(s.email, e.target.value)}
                        style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 7, padding: '5px 10px', color: 'var(--text)', fontSize: 12, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                        <option value="basic">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Expert</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{fc}</td>
                    <td style={{ padding: '10px 12px', minWidth: 130 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 600, color: 'var(--muted)' }}>
                        <span>{done}/{total}</span>
                        <span style={{ color: pct >= 80 ? '#27AE60' : pct >= 50 ? '#FF8F00' : '#E53935' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: lc, borderRadius: 3 }} />
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', minWidth: 110 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 600, color: 'var(--muted)' }}>
                        <span>{attn.present}/40</span>
                        <span style={{ color: apct >= 80 ? '#27AE60' : apct >= 50 ? '#FF8F00' : '#E53935' }}>{apct}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${apct}%`, background: '#FF8F00', borderRadius: 3 }} />
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {cert?.distributed
                        ? <span style={{ background: 'rgba(46,204,113,.1)', color: '#27AE60', border: '1px solid rgba(46,204,113,.25)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700 }}>✓ Done</span>
                        : <span style={{ fontSize: 11, color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => router.push(`/attendance?student=${s.email}`)}
                        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginRight: 4 }}>📅</button>
                      <button onClick={() => router.push(`/course?student=${s.email}`)}
                        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginRight: 4 }}>📚</button>
                      <button onClick={() => deleteStudent(s.email, s.name)}
                        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(229,57,53,.15)', background: 'rgba(229,57,53,.08)', color: '#E53935', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🗑</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Manage Students</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>New & long-term student overview</div>

        <div style={{ padding: '14px 18px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20, boxShadow: 'var(--shadow)', fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>
          Total: <strong style={{ color: 'var(--text)' }}>{students.length}</strong> students ·
          New: <strong style={{ color: '#F57C00' }}>{newS.length}</strong> ·
          Long-term: <strong style={{ color: '#1E88E5' }}>{oldS.length}</strong>
        </div>

        <div style={{ fontSize: 13, fontWeight: 800, color: '#F57C00', marginBottom: 12 }}>🟠 New Students (&lt; 6 months)</div>
        {renderTable(newS, '🟠 New Students', '#F57C00')}

        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,var(--border2),transparent)', margin: '8px 0 24px' }} />

        <div style={{ fontSize: 13, fontWeight: 800, color: '#1E88E5', marginBottom: 12 }}>🔵 Long-term Students</div>
        {renderTable(oldS, '🔵 Long-term Students', '#1E88E5')}
      </div>
    </AppLayout>
  )
}