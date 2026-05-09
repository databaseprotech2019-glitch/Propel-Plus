'use client'
import { useState, useEffect } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { DB, saveDB, setCurrentUser, loading } = useDB()
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  useEffect(() => {
    if (loading) return
    try {
      const saved = localStorage.getItem('mrc_session11')
      if (saved) {
        const s = JSON.parse(saved)
        if (DB.users[s.email]) {
          setCurrentUser(DB.users[s.email])
          router.push('/dashboard')
        }
      }
    } catch (e) {}
  }, [loading])

  function doLogin() {
    const em = loginEmail.trim().toLowerCase()
    const pw = loginPass
    if (!em || !pw) { setError('Please enter email and password.'); return }
    const u = DB.users[em]
    if (!u || u.password !== pw) { setError('Invalid email or password.'); return }
    setCurrentUser(u)
    localStorage.setItem('mrc_session11', JSON.stringify({ email: em }))
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#EEF3F7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '12px'
      }}>
        <img src="/Propel.png" style={{ width: 120, height: 120, borderRadius: 20, objectFit: 'cover' }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%', background: '#2196F3',
              animation: `dotPulse 1s ease-in-out infinite ${delay}s`
            }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#E3EDF7 0%,#EEF3F7 50%,#E8F5E9 100%)'
    }}>
      <div style={{
        display: 'flex', background: '#fff', borderRadius: 20,
        overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
        width: '100%', maxWidth: 840, border: '1px solid var(--border)'
      }}>
        {/* Left Brand Panel */}
        <div style={{
          flex: '0 0 300px',
          background: 'linear-gradient(160deg,#1565C0 0%,#1E88E5 60%,#2196F3 100%)',
          padding: '44px 36px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(255,255,255,.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 16
            }}>PT</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em' }}>Propeller Technologies</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 4 }}>Master Research<br />Course</div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>© 2026 Propeller Technologies</div>
        </div>

        {/* Right Form Panel */}
        <div style={{ flex: 1, padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>Welcome Back</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 28 }}>Sign in to continue your learning journey</div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 10, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }} style={{
                flex: 1, padding: '9px 16px', borderRadius: 7, border: 'none',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
                fontWeight: 700, cursor: 'pointer', fontSize: 13,
                boxShadow: tab === t ? 'var(--shadow)' : 'none'
              }}>{t === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          {error && (
            <div style={{
              background: 'rgba(229,57,53,.06)', border: '1px solid rgba(229,57,53,.2)',
              color: '#E53935', borderRadius: 8, padding: '10px 14px',
              fontSize: 12, marginBottom: 14
            }}>{error}</div>
          )}

          {tab === 'login' ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Email Address</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Password</label>
                <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: 'var(--text)' }} />
              </div>
              <button onClick={doLogin} style={{
                width: '100%', padding: 12, borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#2196F3,#1565C0)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer'
              }}>Sign In</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Registration coming soon!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}