'use client'
import { useDB } from '@/context/DBContext'
import { useRouter, usePathname } from 'next/navigation'

export default function AppLayout({ children }) {
  const { currentUser, setCurrentUser } = useDB()
  const router = useRouter()
  const pathname = usePathname()

  const isAdmin = currentUser?.role === 'admin'

  const studentNav = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Profile', path: '/profile' },
    { label: 'My Course', path: '/course' },
    { label: 'My Progress', path: '/progress' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'My Activities', path: '/activities' },
    { label: 'Trainer Feedback', path: '/feedback' },
    { label: 'Free Courses', path: '/freecourses' },
    { label: 'Students Plus ✨', path: '/studentsplus' },
    { label: 'Tech Buddy Referral', path: '/referral' },
  ]

  const adminNav = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Manage Students', path: '/admin' },
    { label: 'Attendance Admin', path: '/admin/attendance' },
    { label: 'Student Activities', path: '/admin/activities' },
    { label: 'Information Board', path: '/admin/information' },
    { label: 'Certificates', path: '/admin/certificates' },
    { label: 'Referrals', path: '/admin/referrals' },
    { label: 'Free Courses Admin', path: '/admin/freecourses' },
    { label: 'Feedbacks', path: '/admin/feedbacks' },
    { label: 'Students Plus Admin', path: '/admin/studentsplus' },
    { label: '⚙️ Settings', path: '/admin/settings' },
  ]

  const navItems = isAdmin ? adminNav : studentNav

  function doLogout() {
    setCurrentUser(null)
    localStorage.removeItem('mrc_session11')
    router.push('/')
  }

  const pic = currentUser ? useDB().DB?.profilePics?.[currentUser.email] : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{
        width: 260, background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg,#2196F3,#1565C0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0
            }}>PT</div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Propeller Technologies</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', fontFamily: 'Cabinet Grotesk' }}>Master Research Course</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', padding: '12px 12px 4px' }}>
            {isAdmin ? 'Admin Menu' : 'Main Menu'}
          </div>
          {navItems.map(item => (
            <div key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, marginBottom: 1,
                background: pathname === item.path ? 'rgba(30,136,229,.08)' : 'transparent',
                color: pathname === item.path ? 'var(--accent)' : 'var(--text2)',
                border: pathname === item.path ? '1px solid rgba(30,136,229,.15)' : '1px solid transparent',
                transition: 'all .15s'
              }}
            >{item.label}</div>
          ))}
        </div>

        {/* User Footer */}
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', background: 'var(--bg)',
            border: '1px solid var(--border)', borderRadius: 10
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#2196F3,#1565C0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
              overflow: 'hidden'
            }}>
              {currentUser?.name?.[0] || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{isAdmin ? 'Administrator' : 'Student'}</div>
            </div>
            <button onClick={doLogout} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted)', fontSize: 13, fontWeight: 700,
              padding: '4px 6px', borderRadius: 6
            }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
<div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
  <div key={typeof window !== 'undefined' ? window.location.pathname : ''} 
    style={{ animation: 'pageIn 0.28s cubic-bezier(0.22,1,0.36,1) both' }}>
    {children}
  </div>
</div>
    </div>
  )
}