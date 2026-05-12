'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function ReferralPage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const [refName, setRefName] = useState('')
  const [refContact, setRefContact] = useState('')
  const [refSchool, setRefSchool] = useState('')
  const [refCourse, setRefCourse] = useState('Beginner')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const myRefs = (DB.referrals || []).filter(r => r.referrerEmail === currentUser.email)

  async function submitReferral() {
    if (!refName || !refSchool) { setMsg('Please fill in friend name and school'); return }
    const newDB = { ...DB }
    if (!newDB.referrals) newDB.referrals = []
    newDB.referrals.push({
      id: Date.now(), referrerEmail: currentUser.email,
      referrerName: currentUser.name, refName, refContact, refSchool, refCourse,
      status: 'pending', submittedAt: new Date().toLocaleDateString()
    })
    await saveDB(newDB)
    setRefName(''); setRefContact(''); setRefSchool('')
    setMsg('Referral submitted successfully!')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Tech Buddy Referral</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Refer a friend and earn rewards</div>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,rgba(245,124,0,.06),rgba(30,136,229,.06))', border: '1px solid rgba(245,124,0,.2)', borderRadius: 16, padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#F57C00,#1E88E5)' }} />
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 6, fontFamily: 'Cabinet Grotesk' }}>Tech Buddy Referral Program</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>Refer a friend to join the Master Research Course and earn rewards!</div>
        </div>

        {/* How it works */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, fontFamily: 'Cabinet Grotesk' }}>How It Works</div>
          {['You refer a new student to Propeller Technologies.', 'The new student enrolls successfully in any course level.', 'Both of you receive rewards once admin approves the referral!'].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
        </div>

        {/* Rewards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: '#F57C00' }}>15%</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginTop: 4 }}>Fee Concession for You</div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: '#1E88E5' }}>5%</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginTop: 4 }}>Welcome Discount for Friend</div>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 20, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4, fontFamily: 'Cabinet Grotesk' }}>Submit a Referral</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 18 }}>Fill in your friend's details below</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Friend's Full Name</label>
              <input value={refName} onChange={e => setRefName(e.target.value)} placeholder="Enter their full name"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Phone / Contact</label>
              <input value={refContact} onChange={e => setRefContact(e.target.value)} placeholder="+91 XXXXX XXXXX"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>School / Institution</label>
              <input value={refSchool} onChange={e => setRefSchool(e.target.value)} placeholder="School or college name"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Course Interested In</label>
              <select value={refCourse} onChange={e => setRefCourse(e.target.value)}
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
          </div>
          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 700, background: msg.includes('success') ? 'rgba(46,204,113,.08)' : 'rgba(229,57,53,.06)', border: `1px solid ${msg.includes('success') ? 'rgba(46,204,113,.2)' : 'rgba(229,57,53,.2)'}`, color: msg.includes('success') ? '#27AE60' : '#E53935' }}>{msg}</div>
          )}
          <button onClick={submitReferral} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2196F3,#1565C0)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Submit Referral</button>
        </div>

        {/* List */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 14, fontFamily: 'Cabinet Grotesk' }}>My Referrals ({myRefs.length})</div>
          {!myRefs.length ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 28, fontSize: 13 }}>No referrals submitted yet.</div>
          ) : myRefs.map(r => (
            <div key={r.id} style={{ background: 'var(--bg)', border: `1px solid var(--border)`, borderLeft: `3px solid ${r.status === 'approved' ? '#2ECC71' : '#FF8F00'}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{r.refName}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.refSchool} · {r.refCourse}</div>
                  {r.refContact && <div style={{ fontSize: 11, color: 'var(--text2)' }}>📞 {r.refContact}</div>}
                </div>
                <span style={{ background: r.status === 'approved' ? 'rgba(46,204,113,.1)' : 'rgba(255,143,0,.1)', color: r.status === 'approved' ? '#27AE60' : '#FF8F00', border: `1px solid ${r.status === 'approved' ? 'rgba(46,204,113,.25)' : 'rgba(255,143,0,.2)'}`, borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  {r.status === 'approved' ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Submitted: {r.submittedAt}</div>
              {r.status === 'approved' && <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(46,204,113,.06)', border: '1px solid rgba(46,204,113,.2)', borderRadius: 8, fontSize: 12, color: '#27AE60', fontWeight: 600 }}>Approved on {r.approvedOn} – 15% fee concession applied!</div>}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}