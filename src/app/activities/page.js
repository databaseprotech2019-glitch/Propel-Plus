'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

function getNextSunday(date) {
  const d = new Date(date); d.setHours(0,0,0,0)
  const day = d.getDay()
  if (day === 0) return d
  d.setDate(d.getDate() + (7 - day))
  return d
}

export default function ActivitiesPage() {
  const { currentUser, loading, DB } = useDB()
  const router = useRouter()
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const email = currentUser.email
  const acts = DB.activities?.[email] || {}

  function getBaseDate() {
    if (!currentUser.joinedAt) return new Date('2026-01-04')
    return getNextSunday(new Date(currentUser.joinedAt))
  }

  function formatDate(dayNum) {
    const base = getBaseDate()
    const d = new Date(base)
    d.setDate(d.getDate() + (dayNum - 1) * 7)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  let totalPhotos = 0
  for (let d = 1; d <= 40; d++) {
    const k = 'day_' + d
    if (acts[k]) totalPhotos += acts[k].length
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>My Activities</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Session photos & work gallery</div>

        <div style={{ padding: '12px 16px', background: 'rgba(30,136,229,.06)', border: '1px solid rgba(30,136,229,.2)', borderRadius: 8, marginBottom: 20, fontSize: 12, color: '#1E88E5', fontWeight: 700 }}>
          Photos uploaded by your trainer for each class day. Click any photo to view full size.
        </div>

        {totalPhotos === 0 ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>No Activity Photos Yet</div>
            <div style={{ fontSize: 12 }}>Your trainer will upload session photos here after each class.</div>
          </div>
        ) : (
          Array.from({ length: 40 }, (_, i) => i + 1).map(d => {
            const k = 'day_' + d
            const photos = acts[k] || []
            if (!photos.length) return null
            return (
              <div key={d} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginBottom: 16, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text2)' }}>D{d}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk' }}>Class Day {d}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDate(d)} · {photos.length} photo{photos.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
                  {photos.map((photo, pi) => (
                    <div key={pi} onClick={() => setLightbox(photo)} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg)' }}>
                      <img src={photo.dataUrl} alt={photo.caption || 'Activity'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '.2s' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                        <span style={{ color: '#fff', fontSize: 20 }}>🔍</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}

        {/* Lightbox */}
        {lightbox && (
          <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 800, width: '100%', background: 'var(--card)', borderRadius: 14, overflow: 'hidden' }}>
              <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>✕</button>
              <img src={lightbox.dataUrl} alt={lightbox.caption} style={{ width: '100%', display: 'block' }} />
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{lightbox.caption || 'Activity Photo'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{lightbox.date || ''}</div>
                </div>
                <button onClick={() => { const a = document.createElement('a'); a.href = lightbox.dataUrl; a.download = (lightbox.caption || 'photo') + '.jpg'; a.click() }}
                  style={{ padding: '6px 14px', borderRadius: 7, background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Download</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}