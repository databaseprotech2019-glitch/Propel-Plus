'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function AdminInformationPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const infos = DB.information || []

  async function postInfo() {
    if (!title || !body) { setMsg('Please fill both title and details'); return }
    const newDB = { ...DB }
    if (!newDB.information) newDB.information = []
    newDB.information.push({ id: Date.now(), title, body, date: new Date().toLocaleDateString() })
    await saveDB(newDB)
    setTitle(''); setBody('')
    setMsg('Posted successfully!')
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteInfo(id) {
    const newDB = { ...DB }
    newDB.information = (newDB.information || []).filter(n => n.id !== id)
    await saveDB(newDB)
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Information Board</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Post information to all students</div>

        {/* Post Form */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#1E88E5,#2ECC71)' }} />
          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4, marginTop: 4 }}>Post Information</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 18 }}>Visible as a running ticker to all students</div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Schedule update, reminder..."
              style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Information Details</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write the information here..."
              style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)', resize: 'vertical', minHeight: 90 }} />
          </div>

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 700, background: msg.includes('success') ? 'rgba(46,204,113,.08)' : 'rgba(229,57,53,.06)', border: `1px solid ${msg.includes('success') ? 'rgba(46,204,113,.2)' : 'rgba(229,57,53,.2)'}`, color: msg.includes('success') ? '#27AE60' : '#E53935' }}>{msg}</div>
          )}

          <button onClick={postInfo} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Post to All Students
          </button>
        </div>

        {/* Posted List */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 14, fontFamily: 'Cabinet Grotesk' }}>Posted ({infos.length})</div>
          {!infos.length ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 28, fontSize: 13 }}>No information posted yet.</div>
          ) : (
            [...infos].reverse().map(n => (
              <div key={n.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 5 }}>{n.title}</div>
                  <button onClick={() => deleteInfo(n.id)} style={{ padding: '3px 9px', borderRadius: 6, background: 'rgba(229,57,53,.07)', color: '#E53935', border: '1px solid rgba(229,57,53,.15)', cursor: 'pointer', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>Delete</button>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{n.body}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Posted: {n.date}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}