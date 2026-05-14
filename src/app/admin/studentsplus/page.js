'use client'
import { useEffect, useRef, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

const SP_CATEGORIES = [
  {value:'team-building',label:'Team Building',icon:'🤝'},
  {value:'circuits',label:'Circuits',icon:'⚡'},
  {value:'robotics',label:'Robotics',icon:'🤖'},
  {value:'innovation',label:'Innovation',icon:'💡'},
  {value:'stem',label:'STEM',icon:'🔬'},
  {value:'ai',label:'AI Workshop',icon:'🧠'},
  {value:'coding',label:'Coding',icon:'💻'},
  {value:'other',label:'Other',icon:'🎯'}
]

const catColors = {
  'team-building':'#C2185B','circuits':'#FF8F00','robotics':'#1565C0',
  'innovation':'#8E44AD','stem':'#27AE60','ai':'#0097A7','coding':'#455A64','other':'#616161'
}
const catBg = {
  'team-building':'rgba(233,30,99,.1)','circuits':'rgba(255,143,0,.1)','robotics':'rgba(30,136,229,.1)',
  'innovation':'rgba(142,68,173,.1)','stem':'rgba(46,204,113,.1)','ai':'rgba(0,188,212,.1)',
  'coding':'rgba(96,125,139,.1)','other':'rgba(158,158,158,.1)'
}

export default function AdminStudentsPlusPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const students = Object.values(DB.users || {}).filter(u => u.role === 'student')
  const [selEmail, setSelEmail] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('team-building')
  const [description, setDescription] = useState('')
  const [weekNumber, setWeekNumber] = useState(1)
  const [imgDataUrl, setImgDataUrl] = useState(null)
  const [msg, setMsg] = useState('')
  const imgInputRef = useRef(null)

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
    if (currentUser?.role !== 'admin') router.push('/dashboard')
    if (students.length && !selEmail) setSelEmail(students[0].email)
  }, [loading, currentUser, students.length])

  if (loading || !currentUser) return null

  const activities = DB.studentsPlus?.[selEmail] || []
  const selStudent = DB.users[selEmail]

  async function addActivity() {
    if (!title) { setMsg('Please enter an activity title'); return }
    if (activities.length >= 20) { setMsg('Maximum 20 activities allowed'); return }
    const newDB = { ...DB }
    if (!newDB.studentsPlus[selEmail]) newDB.studentsPlus[selEmail] = []
    newDB.studentsPlus[selEmail].push({
      id: Date.now(), title, category, description, weekNumber: parseInt(weekNumber),
      imageDataUrl: imgDataUrl || null,
      addedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    })
    await saveDB(newDB)
    setTitle(''); setDescription(''); setImgDataUrl(null)
    setMsg('Activity added for ' + selStudent?.name + '!')
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteActivity(idx) {
    if (!confirm('Delete this activity?')) return
    const newDB = { ...DB }
    newDB.studentsPlus[selEmail].splice(idx, 1)
    await saveDB(newDB)
  }

  function handleImg(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setImgDataUrl(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const levelLabel = l => l === 'basic' ? 'Beginner' : l === 'intermediate' ? 'Intermediate' : 'Expert'

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Students Plus Admin</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Manage weekly enrichment activities</div>

        <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />

        {/* Student Selector */}
        <div style={{ background: 'linear-gradient(135deg,rgba(30,136,229,.08),rgba(46,204,113,.05))', border: '1px solid rgba(30,136,229,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap' }}>👤 Adding activities for:</span>
          <select value={selEmail} onChange={e => setSelEmail(e.target.value)}
            style={{ background: 'var(--card)', border: '1.5px solid rgba(30,136,229,.3)', borderRadius: 8, padding: '7px 12px', color: 'var(--text)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: 220 }}>
            {students.map(s => <option key={s.email} value={s.email}>{s.name} ({levelLabel(s.level)})</option>)}
          </select>
          <span style={{ fontSize: 11, color: 'var(--text2)', padding: '4px 10px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 600 }}>{selStudent?.name} · {levelLabel(selStudent?.level)}</span>
        </div>

        {/* Add Form */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#8E44AD,#2ECC71)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, marginTop: 4, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'Cabinet Grotesk' }}>Add Activity for {selStudent?.name}</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: activities.length > 15 ? 'rgba(255,143,0,.1)' : 'rgba(46,204,113,.1)', color: activities.length > 15 ? '#FF8F00' : '#27AE60', border: `1px solid ${activities.length > 15 ? 'rgba(255,143,0,.2)' : 'rgba(46,204,113,.2)'}` }}>{activities.length}/20 Activities</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 18 }}>Activities are saved per student — only visible to {selStudent?.name?.split(' ')[0]}</div>

          {activities.length >= 20 ? (
            <div style={{ padding: '12px 16px', background: 'rgba(229,57,53,.06)', border: '1px solid rgba(229,57,53,.2)', borderRadius: 8, fontSize: 12, color: '#E53935', fontWeight: 700 }}>Maximum of 20 activities reached. Delete one to add more.</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Activity Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Team Circuit Challenge"
                    style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }}>
                    {SP_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the activity..."
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)', resize: 'vertical', minHeight: 80 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Week Number</label>
                  <select value={weekNumber} onChange={e => setWeekNumber(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }}>
                    {Array.from({length: 10}, (_, i) => <option key={i+1} value={i+1}>Week {i+1}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Activity Image (Optional)</label>
                  <div onClick={() => imgInputRef.current?.click()} style={{ border: '2px dashed var(--border2)', borderRadius: 10, padding: 10, textAlign: 'center', cursor: 'pointer', background: 'var(--bg)' }}>
                    {imgDataUrl ? (
                      <div>
                        <img src={imgDataUrl} style={{ width: '100%', maxHeight: 80, objectFit: 'cover', borderRadius: 6 }} />
                        <button onClick={e => { e.stopPropagation(); setImgDataUrl(null) }} style={{ marginTop: 4, padding: '2px 8px', borderRadius: 5, background: 'rgba(229,57,53,.08)', color: '#E53935', border: '1px solid rgba(229,57,53,.15)', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>Remove</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>📷 Click to add image</div>
                    )}
                  </div>
                </div>
              </div>

              {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 700, background: msg.includes('added') ? 'rgba(46,204,113,.08)' : 'rgba(229,57,53,.06)', border: `1px solid ${msg.includes('added') ? 'rgba(46,204,113,.2)' : 'rgba(229,57,53,.2)'}`, color: msg.includes('added') ? '#27AE60' : '#E53935' }}>{msg}</div>}

              <button onClick={addActivity} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✨ Add Activity</button>
            </>
          )}
        </div>

        {/* Activities List */}
        {!activities.length ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No activities for {selStudent?.name} yet.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 14, fontFamily: 'Cabinet Grotesk' }}>{selStudent?.name}'s Activities ({activities.length})</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
              {activities.map((act, i) => {
                const cat = SP_CATEGORIES.find(c => c.value === act.category) || SP_CATEGORIES[7]
                const color = catColors[act.category] || '#616161'
                const bg = catBg[act.category] || 'rgba(158,158,158,.1)'
                return (
                  <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'Cabinet Grotesk' }}>{act.title}</div>
                          <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: bg, color, border: `1px solid ${color}33` }}>{cat.label}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteActivity(i)} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(229,57,53,.08)', color: '#E53935', border: '1px solid rgba(229,57,53,.15)', cursor: 'pointer', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>Del</button>
                    </div>
                    {act.description && <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 8 }}>{act.description}</div>}
                    {act.imageDataUrl && <img src={act.imageDataUrl} style={{ width: '100%', borderRadius: 7, objectFit: 'cover', maxHeight: 120, border: '1px solid var(--border)', marginBottom: 8 }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                      {act.weekNumber && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', background: 'var(--bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 20 }}>Week {act.weekNumber}</span>}
                      <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{act.addedAt}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}