'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function ProfilePage() {
  const { currentUser, setCurrentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [school, setSchool] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role === 'admin') router.push('/dashboard')
    if (currentUser) {
      setName(currentUser.name || '')
      setPhone(currentUser.phone || '')
      setSchool(currentUser.school || '')
    }
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const level = currentUser.level
  const levelLabel = level === 'basic' ? 'Beginner' : level === 'intermediate' ? 'Intermediate' : 'Expert'
  const levelColor = level === 'basic' ? '#2ECC71' : level === 'intermediate' ? '#1E88E5' : '#8E44AD'

  function getProgress() { return DB.progress?.[currentUser.email]?.[level] || [] }
  function getTotalTopics() { const counts = { basic: 57, intermediate: 68, advanced: 62 }; return counts[level] || 0 }
  function getAttnStats() {
    const a = DB.attendance?.[currentUser.email] || {}
    let present = 0, absent = 0
    for (let w = 1; w <= 10; w++)
      for (let d = 0; d < 4; d++) {
        const k = `W${w}D${d}`
        if (a[k] === 'present') present++
        else if (a[k] === 'absent') absent++
      }
    return { present, absent }
  }

  const done = getProgress().length
  const total = getTotalTopics()
  const pct = total ? Math.round(done / total * 100) : 0
  const attn = getAttnStats()
  const attnPct = Math.round(attn.present / 40 * 100)
  const cert = DB.certificates?.[currentUser.email]
  const myRefs = (DB.referrals || []).filter(r => r.referrerEmail === currentUser.email && r.status === 'approved')
  const pic = DB.profilePics?.[currentUser.email]
  const joinDate = currentUser.joinedAt ? new Date(currentUser.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  const achievements = []
  if (done >= 10) achievements.push({ icon: '🚀', label: '10 Topics Done' })
  if (done >= 50) achievements.push({ icon: '🌟', label: '50 Topics Done' })
  if (done === total && total > 0) achievements.push({ icon: '🏆', label: 'Course Complete' })
  if (attn.present >= 20) achievements.push({ icon: '📅', label: '20 Days Present' })
  if (attn.present >= 40) achievements.push({ icon: '💯', label: 'Full Attendance' })
  if (myRefs.length > 0) achievements.push({ icon: '🤝', label: 'Tech Buddy' })
  if (cert?.distributed) achievements.push({ icon: '🎓', label: 'Certified' })

  async function saveProfile() {
    if (!name) { setMsg('Name cannot be empty'); return }
    if (password && password.length < 6) { setMsg('Password must be at least 6 characters'); return }
    const newDB = { ...DB }
    newDB.users[currentUser.email].name = name
    newDB.users[currentUser.email].phone = phone
    newDB.users[currentUser.email].school = school
    if (password) newDB.users[currentUser.email].password = password
    await saveDB(newDB)
    setCurrentUser(newDB.users[currentUser.email])
    setEditMode(false)
    setPassword('')
    setMsg('Profile updated successfully!')
    setTimeout(() => setMsg(''), 3000)
  }

  function triggerPicUpload() { document.getElementById('profile-pic-input').click() }

  async function handlePicUpload(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const size = 200; canvas.width = size; canvas.height = size
        const ctx = canvas.getContext('2d')
        const s = Math.min(img.width, img.height)
        const sx = (img.width - s) / 2, sy = (img.height - s) / 2
        ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        const newDB = { ...DB }
        if (!newDB.profilePics) newDB.profilePics = {}
        newDB.profilePics[currentUser.email] = dataUrl
        await saveDB(newDB)
        setMsg('Profile photo updated!')
        setTimeout(() => setMsg(''), 3000)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function removePic() {
    const newDB = { ...DB }
    delete newDB.profilePics[currentUser.email]
    await saveDB(newDB)
  }

  if (editMode) {
    return (
      <AppLayout>
        <div style={{ padding: '24px 32px' }}>
          <div style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5,#2196F3)', borderRadius: 16, padding: 28, marginBottom: 20, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
              <div onClick={triggerPicUpload} style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
                {pic ? <img src={pic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{currentUser.name[0]}</span>}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Cabinet Grotesk' }}>Edit Profile</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{currentUser.email}</div>
                <button onClick={triggerPicUpload} style={{ marginTop: 8, padding: '5px 12px', borderRadius: 7, background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>📷 Change Photo</button>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 16 }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Email Address</label>
                <input value={currentUser.email} disabled style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)', opacity: .6 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>School / Institution</label>
                <input value={school} onChange={e => setSchool(e.target.value)} placeholder="Your school name"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>New Password (leave blank to keep current)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
            </div>

            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginTop: 14, fontSize: 12, fontWeight: 700, background: msg.includes('success') ? 'rgba(46,204,113,.08)' : 'rgba(229,57,53,.06)', border: `1px solid ${msg.includes('success') ? 'rgba(46,204,113,.2)' : 'rgba(229,57,53,.2)'}`, color: msg.includes('success') ? '#27AE60' : '#E53935' }}>{msg}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={saveProfile} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
              <button onClick={() => setEditMode(false)} style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <input type="file" id="profile-pic-input" accept="image/*" style={{ display: 'none' }} onChange={handlePicUpload} />
      <div style={{ padding: '24px 32px' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5,#2196F3)', borderRadius: 16, padding: 28, marginBottom: 20, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
            <div onClick={triggerPicUpload} style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
              {pic ? <img src={pic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{currentUser.name[0]}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Cabinet Grotesk' }}>{currentUser.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{currentUser.email}</div>
              <span style={{ display: 'inline-flex', background: 'rgba(255,255,255,.2)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, marginTop: 8 }}>{levelLabel} Level</span>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button onClick={triggerPicUpload} style={{ padding: '5px 12px', borderRadius: 7, background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>📷 {pic ? 'Change' : 'Add'} Photo</button>
                {pic && <button onClick={removePic} style={{ padding: '5px 12px', borderRadius: 7, background: 'rgba(229,57,53,.2)', color: '#fff', border: '1px solid rgba(229,57,53,.4)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Remove</button>}
              </div>
            </div>
            <button onClick={() => setEditMode(true)} style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', position: 'relative', zIndex: 1 }}>Edit Profile</button>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 16, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            {[
              { val: `${pct}%`, label: 'Progress' },
              { val: `${attn.present}/40`, label: 'Attendance' },
              { val: `${done}/${total}`, label: 'Topics Done' },
              { val: myRefs.length, label: 'Referrals' }
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: '#fff' }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.65)', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 12, fontWeight: 700, background: 'rgba(46,204,113,.08)', border: '1px solid rgba(46,204,113,.2)', color: '#27AE60' }}>{msg}</div>}

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 16 }}>Personal Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Full Name', value: currentUser.name },
                { label: 'Phone', value: currentUser.phone || '—' },
                { label: 'Email', value: currentUser.email },
                { label: 'School', value: currentUser.school || '—' },
                { label: 'Joined On', value: joinDate },
              ].map(f => (
                <div key={f.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', wordBreak: 'break-all' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 16 }}>Course Enrolled</div>
            <div style={{ background: `${levelColor}0d`, border: `1px solid ${levelColor}33`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: levelColor }}>Master Research Course</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginTop: 2 }}>{levelLabel} Level</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{total} Topics</div>
            </div>
            {cert?.distributed
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(46,204,113,.07)', border: '1px solid rgba(46,204,113,.2)', borderRadius: 8 }}>
                  <span style={{ fontSize: 18 }}>🎓</span>
                  <div><div style={{ fontSize: 12, fontWeight: 700, color: '#27AE60' }}>Certificate Distributed</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{cert.date}</div></div>
                </div>
              : <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--muted)' }}>Certificate not yet distributed</div>}
          </div>
        </div>

        {/* Performance */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cabinet Grotesk', marginBottom: 16 }}>Performance Summary</div>
          {[
            { label: 'Course Progress', pct, color: levelColor },
            { label: 'Attendance Rate', pct: attnPct, color: '#FF8F00' }
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', width: 120, flexShrink: 0 }}>{b.label}</div>
              <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: 3, transition: 'width .7s' }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', width: 36, textAlign: 'right' }}>{b.pct}%</div>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>Achievements</div>
            <div>
              {achievements.length > 0
                ? achievements.map((a, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, margin: 4, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                      <span style={{ fontSize: 14 }}>{a.icon}</span>{a.label}
                    </span>
                  ))
                : <span style={{ fontSize: 12, color: 'var(--muted)' }}>Complete more topics to earn achievements!</span>}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}