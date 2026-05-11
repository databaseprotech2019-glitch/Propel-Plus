'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function FeedbackPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const [trainer, setTrainer] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [matter, setMatter] = useState('')
  const [priority, setPriority] = useState('medium')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const email = currentUser.email
  const feedbacks = DB.feedbacks?.[email] || []
  const googleReviewLink = DB.settings?.googleReviewLink || '#'

  async function submitFeedback() {
    if (!trainer || !date || !matter) { setMsg('Please fill trainer name, date and feedback details'); return }
    const fb = {
      id: Date.now(), trainer, date, matter, priority,
      actionTaken: false, submittedBy: email,
      submittedAt: new Date().toLocaleDateString(),
      parentName: parentName || null,
      parentPhone: parentPhone || null,
      parentEmail: parentEmail || null
    }
    const newDB = { ...DB }
    if (!newDB.feedbacks[email]) newDB.feedbacks[email] = []
    newDB.feedbacks[email].push(fb)
    await saveDB(newDB)
    setTrainer(''); setMatter(''); setParentName(''); setParentPhone(''); setParentEmail('')
    setMsg('Feedback submitted successfully!')
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteFeedback(id) {
    const newDB = { ...DB }
    newDB.feedbacks[email] = (newDB.feedbacks[email] || []).filter(f => f.id !== id)
    await saveDB(newDB)
  }

  const priColors = { low: '#27AE60', medium: '#FF8F00', high: '#E53935' }
  const priBg = { low: 'rgba(46,204,113,.1)', medium: 'rgba(255,143,0,.1)', high: 'rgba(229,57,53,.08)' }
  const priBorder = { low: 'rgba(46,204,113,.35)', medium: 'rgba(255,143,0,.35)', high: 'rgba(229,57,53,.25)' }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Trainer Feedback</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Share & track trainer feedback</div>

        {/* Google Review */}
        <div style={{
          background: 'rgba(66,133,244,.03)', border: '1px solid rgba(66,133,244,.2)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Enjoying the Course?</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Share your experience on Google!</div>
          </div>
          <a href={googleReviewLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 10,
            background: 'linear-gradient(135deg,#4285F4,#1A73E8)',
            color: '#fff', fontSize: 13, fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 4px 14px rgba(66,133,244,.35)'
          }}>⭐ Google Review</a>
        </div>

        {/* Feedback Form */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 24, marginBottom: 20,
          boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#1E88E5,#2ECC71)' }} />
          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4, marginTop: 4 }}>Submit Trainer Feedback</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>Your feedback will be reviewed by the admin team</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Trainer Name</label>
              <input value={trainer} onChange={e => setTrainer(e.target.value)} placeholder="Enter trainer name"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Feedback Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Feedback Details</label>
            <textarea value={matter} onChange={e => setMatter(e.target.value)} placeholder="Share your experience or concern..."
              style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)', resize: 'vertical', minHeight: 80 }} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Priority</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['low', 'medium', 'high'].map(p => (
                <div key={p} onClick={() => setPriority(p)} style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: priority === p ? priBg[p] : 'var(--bg)',
                  color: priority === p ? priColors[p] : 'var(--muted)',
                  border: `1.5px solid ${priority === p ? priBorder[p] : 'var(--border)'}`,
                  textTransform: 'capitalize'
                }}>{p}</div>
              ))}
            </div>
          </div>

          {/* Parent Section */}
          <div style={{ background: 'rgba(142,68,173,.04)', border: '1px solid rgba(142,68,173,.15)', borderRadius: 12, padding: 18, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#8E44AD', marginBottom: 12, fontFamily: 'Cabinet Grotesk' }}>📬 Parent Notification (Optional)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Parent Name</label>
                <input value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Parent's full name"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Parent Phone</label>
                <input value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Parent Email</label>
                <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="parent@email.com"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
            </div>
          </div>

          {msg && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 700,
              background: msg.includes('success') ? 'rgba(46,204,113,.08)' : 'rgba(229,57,53,.06)',
              border: `1px solid ${msg.includes('success') ? 'rgba(46,204,113,.2)' : 'rgba(229,57,53,.2)'}`,
              color: msg.includes('success') ? '#27AE60' : '#E53935'
            }}>{msg}</div>
          )}

          <button onClick={submitFeedback} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#2196F3,#1565C0)',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>Submit Feedback</button>
        </div>

        {/* Feedback List */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 14, fontFamily: 'Cabinet Grotesk' }}>My Feedbacks ({feedbacks.length})</div>
          {!feedbacks.length ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 28, fontSize: 13 }}>No feedbacks submitted yet.</div>
          ) : (
            [...feedbacks].reverse().map(f => {
              const adminRemark = DB.remarks?.['remark_' + f.id] || ''
              return (
                <div key={f.id} style={{
                  background: 'var(--bg)', border: `1px solid var(--border)`,
                  borderLeft: `3px solid ${f.actionTaken ? '#2ECC71' : '#FF8F00'}`,
                  borderRadius: 10, padding: 16, marginBottom: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Trainer: {f.trainer}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Submitted: {f.submittedAt} · Date: {f.date}</div>
                    </div>
                    <span style={{
                      background: priBg[f.priority], color: priColors[f.priority],
                      border: `1px solid ${priBorder[f.priority]}`,
                      borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                    }}>{f.priority}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>{f.matter}</div>
                  {f.actionTaken && adminRemark && (
                    <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(245,124,0,.05)', border: '1px solid rgba(245,124,0,.15)', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#F57C00', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 5 }}>Admin Response</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{adminRemark}</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {f.actionTaken ? (
                      <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: 'rgba(46,204,113,.1)', color: '#27AE60', border: '1px solid rgba(46,204,113,.2)' }}>
                        Action Taken on {f.actionDate || ''}
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: 'rgba(255,143,0,.1)', color: '#FF8F00', border: '1px solid rgba(255,143,0,.2)' }}>
                        Pending Review
                      </span>
                    )}
                    <button onClick={() => deleteFeedback(f.id)} style={{
                      padding: '5px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      background: 'rgba(229,57,53,.07)', color: '#E53935', border: '1px solid rgba(229,57,53,.15)'
                    }}>Delete</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </AppLayout>
  )
}