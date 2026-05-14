'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function AdminSettingsPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const [googleLink, setGoogleLink] = useState('')
  const [communityLink, setCommunityLink] = useState('')
  const [baseDate, setBaseDate] = useState('2026-01-04')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
    setGoogleLink(DB.settings?.googleReviewLink || '')
    setCommunityLink(DB.settings?.communityLink || '')
    const saved = localStorage.getItem('mrc_base_date')
    if (saved) setBaseDate(saved)
  }, [loading, currentUser, DB.settings])

  if (loading || !currentUser) return null

  async function saveSettings() {
    const newDB = { ...DB }
    if (!newDB.settings) newDB.settings = {}
    newDB.settings.googleReviewLink = googleLink
    newDB.settings.communityLink = communityLink
    await saveDB(newDB)
    setMsg('Settings saved!')
    setTimeout(() => setMsg(''), 3000)
  }

  function saveBaseDateFn() {
    localStorage.setItem('mrc_base_date', baseDate)
    setMsg('Base date saved!')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>⚙️ Settings</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Configure platform links & options</div>

        {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 12, fontWeight: 700, background: 'rgba(46,204,113,.08)', border: '1px solid rgba(46,204,113,.2)', color: '#27AE60' }}>{msg}</div>}

        {/* Platform Links */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#4285F4,#25D366)' }} />
          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4, marginTop: 4 }}>Platform Links</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>Configure external links shown to students.</div>

          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4285F4,#1A73E8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, color: '#fff' }}>⭐</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk' }}>Google Review Link</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>Shown above the Trainer Feedback form</div>
                </div>
              </div>
              <input value={googleLink} onChange={e => setGoogleLink(e.target.value)} placeholder="https://g.page/r/your-google-review-link"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#25D366,#128C7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, color: '#fff' }}>💬</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk' }}>Community Link</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>Shown above videos in Free Courses</div>
                </div>
              </div>
              <input value={communityLink} onChange={e => setCommunityLink(e.target.value)} placeholder="https://chat.whatsapp.com/your-group-link"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
          </div>

          <button onClick={saveSettings} style={{ marginTop: 20, padding: '11px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save Settings</button>
        </div>

        {/* Base Date */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 6 }}>Configure First Class Base Date</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>Sets the default first Sunday class date when a student's join date is unavailable.</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Base Date (Sunday)</label>
              <input type="date" value={baseDate} onChange={e => setBaseDate(e.target.value)}
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
            <button onClick={saveBaseDateFn} style={{ padding: '11px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Save Date</button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}