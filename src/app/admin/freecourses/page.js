'use client'
import { useEffect, useRef, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { supabase } from '@/lib/supabase'

function getYouTubeThumbnail(url) {
  try {
    let videoId = ''
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) videoId = u.pathname.slice(1)
    else videoId = u.searchParams.get('v') || ''
    if (!videoId) {
      const m = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([^&?/\s]{11})/)
      if (m) videoId = m[1]
    }
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  } catch (e) {}
  return ''
}

export default function AdminFreeCoursesPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pendingGuideIdx, setPendingGuideIdx] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const courses = DB.freeCourses || []

  async function addCourse() {
    if (!title) { setMsg('Please enter a video title'); return }
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) { setMsg('Please enter a valid YouTube link'); return }
    const newDB = { ...DB }
    if (!newDB.freeCourses) newDB.freeCourses = []
    newDB.freeCourses.push({
      id: Date.now(), title, url, description: desc,
      addedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      guide: null
    })
    await saveDB(newDB)
    setTitle(''); setUrl(''); setDesc('')
    setMsg('Video added successfully!')
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteCourse(idx) {
    if (!confirm('Delete this video?')) return
    const newDB = { ...DB }
    newDB.freeCourses.splice(idx, 1)
    await saveDB(newDB)
  }

  function triggerGuideUpload(idx) {
    setPendingGuideIdx(idx)
    fileInputRef.current?.click()
  }

  async function handleGuideUpload(e) {
    const file = e.target.files[0]
    if (!file || pendingGuideIdx === null) return
    if (file.size > 50 * 1024 * 1024) { setMsg('File too large. Max 50MB'); return }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const dataUrl = ev.target.result
        const guideId = 'guide_' + Date.now()
        try {
          await supabase.from('guide_files').upsert({
            guide_id: guideId,
            course_id: DB.freeCourses[pendingGuideIdx].id,
            file_name: file.name,
            file_type: file.type || 'application/octet-stream',
            file_size: file.size,
            data_url: dataUrl,
            uploaded_at: new Date().toISOString()
          })
        } catch (err) { console.warn('Supabase guide save failed:', err) }

        const newDB = { ...DB }
        newDB.freeCourses[pendingGuideIdx].guide = {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          guideId,
          uploadedAt: Date.now()
        }
        await saveDB(newDB)
        setMsg('Guide uploaded!')
        setTimeout(() => setMsg(''), 3000)
      } catch (err) { setMsg('Upload failed: ' + err.message) }
      setUploading(false)
      setPendingGuideIdx(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function deleteGuide(idx) {
    const newDB = { ...DB }
    newDB.freeCourses[idx].guide = null
    await saveDB(newDB)
  }

  async function downloadGuide(guide) {
    try {
      const { data } = await supabase.from('guide_files').select('data_url').eq('guide_id', guide.guideId).maybeSingle()
      if (data?.data_url) {
        const a = document.createElement('a'); a.href = data.data_url; a.download = guide.name || 'guide'; a.click()
      }
    } catch (e) { setMsg('Download failed') }
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Free Courses Admin</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Add YouTube video lessons for students</div>

        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleGuideUpload} />

        {/* Add Form */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#FF0000,#1E88E5)' }} />
          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4, marginTop: 4 }}>Add Free Course Video</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 18 }}>Paste a YouTube link. Students can watch and download the guide if uploaded.</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Video Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Robotics"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>YouTube Link</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Description (Optional)</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description"
              style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
          </div>

          {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 700, background: msg.includes('success') || msg.includes('uploaded') ? 'rgba(46,204,113,.08)' : 'rgba(229,57,53,.06)', border: `1px solid ${msg.includes('success') || msg.includes('uploaded') ? 'rgba(46,204,113,.2)' : 'rgba(229,57,53,.2)'}`, color: msg.includes('success') || msg.includes('uploaded') ? '#27AE60' : '#E53935' }}>{msg}</div>}

          <button onClick={addCourse} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Add Video</button>
        </div>

        {/* Videos List */}
        {uploading && <div style={{ padding: '12px 16px', background: 'rgba(30,136,229,.08)', border: '1px solid rgba(30,136,229,.2)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#1E88E5', fontWeight: 700 }}>Uploading guide...</div>}

        {!courses.length ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎬</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No videos added yet.</div>
          </div>
        ) : courses.map((c, idx) => {
          const thumb = getYouTubeThumbnail(c.url)
          return (
            <div key={idx} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {thumb && (
                  <div style={{ flex: '0 0 180px', maxWidth: 180, borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#111' }}>
                    <img src={thumb} alt={c.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.15)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,0,0,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}><polygon points="5,3 19,12 5,21" /></svg>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>{c.addedAt}{c.description ? ` · ${c.description}` : ''}</div>

                  {/* Guide Section */}
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>📄 Course Guide File</div>
                    {c.guide ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(46,204,113,.08)', border: '1px solid rgba(46,204,113,.2)', borderRadius: 8, flex: 1, minWidth: 160 }}>
                          <span style={{ fontSize: 18 }}>📄</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#27AE60' }}>{c.guide.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{c.guide.type || 'Document'}</div>
                          </div>
                        </div>
                        <button onClick={() => downloadGuide(c.guide)} style={{ padding: '7px 12px', borderRadius: 7, background: 'linear-gradient(135deg,#27AE60,#1E8449)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Download</button>
                        <button onClick={() => deleteGuide(idx)} style={{ padding: '7px 12px', borderRadius: 7, background: 'rgba(229,57,53,.08)', color: '#E53935', border: '1px solid rgba(229,57,53,.2)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Remove</button>
                      </div>
                    ) : (
                      <div onClick={() => triggerGuideUpload(idx)} style={{ border: '2px dashed var(--border2)', borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', background: 'var(--bg)' }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>📂</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>Click to upload guide (PDF or DOC)</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Students will see a "Download Guide" button</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, background: 'linear-gradient(135deg,#FF0000,#CC0000)', color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>Preview
                    </a>
                    <button onClick={() => deleteCourse(idx)} style={{ padding: '6px 12px', borderRadius: 7, background: 'rgba(229,57,53,.08)', color: '#E53935', border: '1px solid rgba(229,57,53,.2)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Delete Video</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}