'use client'
import { useEffect } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function AdminCertificatesPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const students = Object.values(DB.users || {}).filter(u => u.role === 'student')
  const distributed = students.filter(s => DB.certificates?.[s.email]?.distributed)
  const pending = students.filter(s => !DB.certificates?.[s.email]?.distributed)

  function getTotalTopics(level) {
    const counts = { basic: 57, intermediate: 68, advanced: 62 }
    return counts[level] || 0
  }
  function getProgress(email, level) {
    return DB.progress?.[email]?.[level] || []
  }
  function getAttnStats(email) {
    const a = DB.attendance?.[email] || {}
    let present = 0
    for (let w = 1; w <= 10; w++)
      for (let d = 0; d < 4; d++)
        if (a[`W${w}D${d}`] === 'present') present++
    return present
  }

  async function toggleCert(email, currentlyDistributed) {
    const newDB = { ...DB }
    if (!newDB.certificates) newDB.certificates = {}
    if (currentlyDistributed) {
      delete newDB.certificates[email]
    } else {
      newDB.certificates[email] = {
        distributed: true,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      }
    }
    await saveDB(newDB)
  }

  const levelLabel = l => l === 'basic' ? 'Beginner' : l === 'intermediate' ? 'Intermediate' : 'Expert'
  const levelColor = l => l === 'basic' ? '#2ECC71' : l === 'intermediate' ? '#1E88E5' : '#8E44AD'

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Certificates</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Manage student course completion</div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Students', value: students.length, color: '#1E88E5', tag: 'Total' },
            { label: 'Distributed', value: distributed.length, color: '#2ECC71', tag: 'Done' },
            { label: 'Awaiting', value: pending.length, color: '#FF8F00', tag: 'Pending' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20, background: `${s.color}18`, color: s.color, display: 'inline-block', marginBottom: 12 }}>{s.tag}</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: s.color }} />
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: 'Cabinet Grotesk' }}>Certificate Management</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{distributed.length} of {students.length} distributed</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Student', 'Level', 'Progress', 'Attendance', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.sort((a, b) => {
                  const ac = DB.certificates?.[a.email]?.distributed ? 1 : 0
                  const bc = DB.certificates?.[b.email]?.distributed ? 1 : 0
                  return bc - ac
                }).map(s => {
                  const done = getProgress(s.email, s.level).length
                  const total = getTotalTopics(s.level)
                  const pct = total ? Math.round(done / total * 100) : 0
                  const present = getAttnStats(s.email)
                  const apct = Math.round(present / 40 * 100)
                  const cert = DB.certificates?.[s.email]
                  const isD = cert?.distributed
                  const pic = DB.profilePics?.[s.email]
                  const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  const lc = levelColor(s.level)

                  return (
                    <tr key={s.email} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: pic ? 'transparent' : `linear-gradient(135deg,${lc},${lc}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', overflow: 'hidden' }}>
                            {pic ? <img src={pic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: `${lc}18`, color: lc, border: `1px solid ${lc}40`, borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{levelLabel(s.level)}</span>
                      </td>
                      <td style={{ padding: '10px 12px', minWidth: 120 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 600, color: 'var(--muted)' }}>
                          <span>{done}/{total}</span>
                          <span style={{ color: pct >= 80 ? '#27AE60' : pct >= 50 ? '#FF8F00' : '#E53935' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: lc, borderRadius: 3 }} />
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', minWidth: 100 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 600, color: 'var(--muted)' }}>
                          <span>{present}/40</span>
                          <span style={{ color: apct >= 80 ? '#27AE60' : apct >= 50 ? '#FF8F00' : '#E53935' }}>{apct}%</span>
                        </div>
                        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${apct}%`, background: '#FF8F00', borderRadius: 3 }} />
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isD
                          ? <span style={{ background: 'rgba(46,204,113,.1)', color: '#27AE60', border: '1px solid rgba(46,204,113,.25)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700 }}>🎓 Distributed</span>
                          : <span style={{ background: 'rgba(255,143,0,.1)', color: '#FF8F00', border: '1px solid rgba(255,143,0,.2)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700 }}>⏳ Pending</span>}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{isD ? cert.date : '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => toggleCert(s.email, isD)} style={{
                          padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                          background: isD ? 'rgba(229,57,53,.07)' : 'rgba(46,204,113,.1)',
                          color: isD ? '#E53935' : '#27AE60',
                          border: `1px solid ${isD ? 'rgba(229,57,53,.15)' : 'rgba(46,204,113,.25)'}`
                        }}>{isD ? '↩ Undo' : '✓ Mark Done'}</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}