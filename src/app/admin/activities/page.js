'use client'
import { useEffect, useRef, useState } from 'react'
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

export default function AdminActivitiesPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const students = Object.values(DB.users || {}).filter(u => u.role === 'student')
  const [selEmail, setSelEmail] = useState('')
  const fileInputRef = useRef(null)
  const [uploadDay, setUploadDay] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
    if (students.length && !selEmail) setSelEmail(students[0].email)
  }, [loading, currentUser, students.length])

  if (loading || !currentUser) return null

  const targetUser = DB.users[selEmail]
  const acts = DB.activities?.[selEmail] || {}

  function getBaseDate() {
    if (!targetUser?.joinedAt) return new Date('2026-01-04')
    return getNextSunday(new Date(targetUser.joinedAt))
  }

  function formatDate(dayNum) {
    const base = getBaseDate()
    const d = new Date(base)
    d.setDate(d.getDate() + (dayNum - 1) * 7)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function triggerUpload(day) {
    setUploadDay(day)
    fileInputRef.current?.click()
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length || !uploadDay) return
    setUploading(true)

    const newDB = { ...DB }
    if (!newDB.activities[selEmail]) newDB.activities[selEmail] = {}
    const k = 'day_' + uploadDay
    if (!newDB.activities[selEmail][k]) newDB.activities[selEmail][k] = []

    for (const file of files) {
      await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          newDB.activities[selEmail][k].push({
            dataUrl: ev.target.result,
            caption: 'Day ' + uploadDay,
            date: new Date().toLocaleDateString('en-IN')
          })
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }

    await saveDB(newDB)
    setUploading(false)
    setUploadDay(null)
    e.target.value = ''
  }

  async function deletePhoto(day, photoIdx) {
    if (!confirm('Delete this photo?')) return
    const newDB = { ...DB }
    const k = 'day_' + day
    newDB.activities[selEmail][k].splice(photoIdx, 1)
    await saveDB(newDB)
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Student Activities</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Upload class day photos</div>

        {/* Student Selector */}
        <div style={{ background: 'linear-gradient(135deg,rgba(30,136,229,.08),rgba(46,204,113,.05))', border: '1px solid rgba(30,136,229,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap' }}>👤 Viewing Student:</span>
          <select value={selEmail} onChange={e => setSelEmail(e.target.value)}
            style={{ background: 'var(--card)', border: '1.5px solid rgba(30,136,229,.3)', borderRadius: 8, padding: '7px 12px', color: 'var(--text)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: 220 }}>
            {students.map(s => (
              <option key={s.email} value={s.email}>{s.name} ({s.level === 'basic' ? 'Beginner' : s.level === 'intermediate' ? 'Intermediate' : 'Expert'})</option>
            ))}
          </select>
        </div>

        <div style={{ padding: '9px 14px', background: 'rgba(142,68,173,.07)', border: '1px solid rgba(142,68,173,.2)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#8E44AD', fontWeight: 700 }}>
          Upload class photos for {targetUser?.name}. Photos are organized by class day.
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUpload} />

        {uploading && (
          <div style={{ padding: '12px 16px', background: 'rgba(30,136,229,.08)', border: '1px solid rgba(30,136,229,.2)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#1E88E5', fontWeight: 700 }}>
            Uploading photos...
          </div>
        )}

        {/* Day Cards */}
        {Array.from({ length: 40 }, (_, i) => i + 1).map(d => {
          const k = 'day_' + d
          const photos = acts[k] || []
          return (
            <div key={d} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 14, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: photos.length ? 12 : 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text2)', flexShrink: 0 }}>D{d}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'Cabinet Grotesk' }}>Class Day {d}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDate(d)} · {photos.length} photo{photos.length !== 1 ? 's' : ''}</div>
                </div>
                <button onClick={() => triggerUpload(d)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(30,136,229,.1)', color: '#1E88E5', border: '1px solid rgba(30,136,229,.2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Photo</button>
              </div>
              {photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
                  {photos.map((photo, pi) => (
                    <div key={pi} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={photo.dataUrl} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '.2s' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                        <button onClick={() => deletePhoto(d, pi)} style={{ background: 'rgba(229,57,53,.8)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}