'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function AdminFeedbacksPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const [remarks, setRemarks] = useState({})

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
    const r = {}
    Object.values(DB.remarks || {}).forEach((v, i) => { r[Object.keys(DB.remarks || {})[i]] = v })
    setRemarks(DB.remarks || {})
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const allFeedbacks = []
  Object.entries(DB.feedbacks || {}).forEach(([email, list]) => {
    list.forEach(f => allFeedbacks.push({ ...f, studentEmail: email, studentName: DB.users[email]?.name || email }))
  })
  allFeedbacks.sort((a, b) => b.id - a.id)

  const pending = allFeedbacks.filter(f => !f.actionTaken)
  const resolved = allFeedbacks.filter(f => f.actionTaken)

  async function markActionTaken(studentEmail, id) {
    const newDB = { ...DB }
    const list = newDB.feedbacks[studentEmail] || []
    const f = list.find(x => x.id === id)
    if (f) { f.actionTaken = true; f.actionDate = new Date().toLocaleDateString() }
    await saveDB(newDB)
  }

  async function saveRemark(id) {
    const newDB = { ...DB }
    if (!newDB.remarks) newDB.remarks = {}
    newDB.remarks['remark_' + id] = remarks['remark_' + id] || ''
    await saveDB(newDB)
  }

  async function deleteFeedback(studentEmail, id) {
    if (!confirm('Delete this feedback?')) return
    const newDB = { ...DB }
    newDB.feedbacks[studentEmail] = (newDB.feedbacks[studentEmail] || []).filter(f => f.id !== id)
    await saveDB(newDB)
  }

  const priColors = { low: '#27AE60', medium: '#FF8F00', high: '#E53935' }
  const priBg = { low: 'rgba(46,204,113,.1)', medium: 'rgba(255,143,0,.1)', high: 'rgba(229,57,53,.08)' }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Feedbacks</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Review & act on trainer feedbacks</div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total', value: allFeedbacks.length, color: '#1E88E5', tag: 'All' },
            { label: 'Pending', value: pending.length, color: '#FF8F00', tag: 'Open' },
            { label: 'Resolved', value: resolved.length, color: '#2ECC71', tag: 'Done' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20, background: `${s.color}18`, color: s.color, display: 'inline-block', marginBottom: 12 }}>{s.tag}</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: s.color }} />
            </div>
          ))}
        </div>

        {!allFeedbacks.length ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No feedbacks yet.</div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 14, fontFamily: 'Cabinet Grotesk' }}>All Feedbacks</div>
            {allFeedbacks.map(f => {
              const remarkKey = 'remark_' + f.id
              return (
                <div key={f.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: `3px solid ${f.actionTaken ? '#2ECC71' : '#FF8F00'}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Trainer: {f.trainer}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>By: {f.studentName} · Date: {f.date} · Submitted: {f.submittedAt}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: priBg[f.priority], color: priColors[f.priority], border: `1px solid ${priColors[f.priority]}40`, borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{f.priority}</span>
                      {f.actionTaken
                        ? <span style={{ background: 'rgba(46,204,113,.1)', color: '#27AE60', border: '1px solid rgba(46,204,113,.2)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Resolved</span>
                        : <span style={{ background: 'rgba(255,143,0,.1)', color: '#FF8F00', border: '1px solid rgba(255,143,0,.2)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Pending</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>{f.matter}</div>

                  {/* Parent Details */}
                  {f.parentName && (
                    <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(142,68,173,.05)', border: '1px solid rgba(142,68,173,.15)', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#8E44AD', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Parent Details</div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--text2)' }}>
                        <span><strong>Name:</strong> {f.parentName}</span>
                        {f.parentPhone && <span><strong>Phone:</strong> {f.parentPhone}</span>}
                        {f.parentEmail && <span><strong>Email:</strong> {f.parentEmail}</span>}
                      </div>
                    </div>
                  )}

                  {/* Remark */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>Admin Remark</div>
                    <textarea
                      value={remarks[remarkKey] || ''}
                      onChange={e => setRemarks(prev => ({ ...prev, [remarkKey]: e.target.value }))}
                      placeholder="Add admin notes..."
                      style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 12, outline: 'none', resize: 'none', minHeight: 60 }}
                    />
                    <button onClick={() => saveRemark(f.id)} style={{ marginTop: 5, padding: '5px 12px', borderRadius: 7, background: 'rgba(30,136,229,.1)', color: '#1E88E5', border: '1px solid rgba(30,136,229,.2)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Save Remark</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {!f.actionTaken && (
                      <button onClick={() => markActionTaken(f.studentEmail, f.id)} style={{ padding: '5px 12px', borderRadius: 7, background: 'rgba(46,204,113,.1)', color: '#27AE60', border: '1px solid rgba(46,204,113,.2)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Mark Action Taken</button>
                    )}
                    {f.actionTaken && <span style={{ fontSize: 11, color: '#27AE60', fontWeight: 700 }}>Action taken on {f.actionDate || ''}</span>}
                    <button onClick={() => deleteFeedback(f.studentEmail, f.id)} style={{ padding: '5px 12px', borderRadius: 7, background: 'rgba(229,57,53,.07)', color: '#E53935', border: '1px solid rgba(229,57,53,.15)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}