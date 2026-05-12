'use client'
import { useEffect } from 'react'
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

export default function StudentsPlusPage() {
  const { currentUser, loading, DB } = useDB()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const activities = DB.studentsPlus?.[currentUser.email] || []

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg,#6C3483,#8E44AD)',
          borderRadius: 16, padding: 24, marginBottom: 20,
          position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 6 }}>Students Plus</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'Cabinet Grotesk', marginBottom: 6 }}>✨ Enrichment Activities</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}>Weekly team building, hands-on circuits, robotics challenges, and more!</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Cabinet Grotesk' }}>{activities.length}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.65)', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>Total Activities</div>
              </div>
            </div>
          </div>
        </div>

        {!activities.length ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, fontFamily: 'Cabinet Grotesk' }}>No Activities Yet</div>
            <div style={{ fontSize: 13 }}>Your admin will add enrichment activities soon!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {activities.map((act, i) => {
              const cat = SP_CATEGORIES.find(c => c.value === act.category) || SP_CATEGORIES[7]
              const color = catColors[act.category] || '#616161'
              const bg = catBg[act.category] || 'rgba(158,158,158,.1)'
              return (
                <div key={i} style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: 18, boxShadow: 'var(--shadow)',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', fontFamily: 'Cabinet Grotesk', lineHeight: 1.2 }}>{act.title}</div>
                      <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', background: bg, color, border: `1px solid ${color}33`, marginTop: 4 }}>{cat.label}</span>
                    </div>
                  </div>
                  {act.description && <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>{act.description}</div>}
                  {act.imageDataUrl && <img src={act.imageDataUrl} alt={act.title} style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 140, border: '1px solid var(--border)', marginBottom: 10 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    {act.weekNumber && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', background: 'var(--bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 20 }}>Week {act.weekNumber}</span>}
                    <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{act.addedAt || ''}</span>
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