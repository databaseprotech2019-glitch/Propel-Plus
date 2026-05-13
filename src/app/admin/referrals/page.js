'use client'
import { useEffect } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function AdminReferralsPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const refs = DB.referrals || []
  const pending = refs.filter(r => r.status === 'pending')
  const approved = refs.filter(r => r.status === 'approved')

  async function approveRef(id) {
    const newDB = { ...DB }
    const r = newDB.referrals.find(x => x.id === id)
    if (r) { r.status = 'approved'; r.approvedOn = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }
    await saveDB(newDB)
  }

  async function unapproveRef(id) {
    const newDB = { ...DB }
    const r = newDB.referrals.find(x => x.id === id)
    if (r) { r.status = 'pending'; delete r.approvedOn }
    await saveDB(newDB)
  }

  async function deleteRef(id) {
    if (!confirm('Delete this referral?')) return
    const newDB = { ...DB }
    newDB.referrals = newDB.referrals.filter(x => x.id !== id)
    await saveDB(newDB)
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Referrals</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Review and approve student referrals</div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total', value: refs.length, color: '#1E88E5', tag: 'Total' },
            { label: 'Pending', value: pending.length, color: '#FF8F00', tag: 'New' },
            { label: 'Approved', value: approved.length, color: '#2ECC71', tag: 'Done' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20, background: `${s.color}18`, color: s.color, display: 'inline-block', marginBottom: 12 }}>{s.tag}</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: s.color }} />
            </div>
          ))}
        </div>

        {!refs.length ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No referrals yet.</div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Referred By', 'Friend', 'Contact', 'School', 'Course', 'Date', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...refs].reverse().map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.referrerName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.referrerEmail}</div>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13 }}>{r.refName}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text2)' }}>{r.refContact || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text2)' }}>{r.refSchool}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: 'rgba(30,136,229,.1)', color: '#1E88E5', border: '1px solid rgba(30,136,229,.2)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700 }}>{r.refCourse}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text2)' }}>{r.submittedAt}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {r.status === 'approved'
                          ? <span style={{ background: 'rgba(46,204,113,.1)', color: '#27AE60', border: '1px solid rgba(46,204,113,.25)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700 }}>Approved</span>
                          : <span style={{ background: 'rgba(255,143,0,.1)', color: '#FF8F00', border: '1px solid rgba(255,143,0,.2)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700 }}>Pending</span>}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {r.status === 'pending'
                          ? <button onClick={() => approveRef(r.id)} style={{ padding: '5px 12px', borderRadius: 7, background: 'rgba(46,204,113,.1)', color: '#27AE60', border: '1px solid rgba(46,204,113,.25)', cursor: 'pointer', fontSize: 11, fontWeight: 700, marginRight: 4 }}>Approve</button>
                          : <button onClick={() => unapproveRef(r.id)} style={{ padding: '5px 12px', borderRadius: 7, background: 'rgba(229,57,53,.07)', color: '#E53935', border: '1px solid rgba(229,57,53,.15)', cursor: 'pointer', fontSize: 11, fontWeight: 700, marginRight: 4 }}>Undo</button>}
                        <button onClick={() => deleteRef(r.id)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(229,57,53,.07)', color: '#E53935', border: '1px solid rgba(229,57,53,.15)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}