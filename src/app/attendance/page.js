'use client'
import { useEffect, useState } from 'react'
import { useDB } from '@/context/DBContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

function getNextSunday(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  if (day === 0) return d
  d.setDate(d.getDate() + (7 - day))
  return d
}

function getStudentBaseDate(user) {
  if (!user?.joinedAt) return new Date('2026-01-04')
  return getNextSunday(new Date(user.joinedAt))
}

function formatDate(date, options = {}) {
  return date.toLocaleDateString('en-IN', options)
}

export default function AttendancePage() {
  const { currentUser, loading, DB, saveDB } = useDB()
  const router = useRouter()
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (loading) return
    if (!currentUser) router.push('/')
  }, [loading, currentUser])

  if (loading || !currentUser) return null

  const targetUser = currentUser
  const targetEmail = currentUser.email

  function getAttn() {
    return DB.attendance?.[targetEmail] || {}
  }

  function getAttnKey(week, dayIdx) {
    return `W${week}D${dayIdx}`
  }

  function getAttnStats() {
    const a = getAttn()
    let present = 0, absent = 0
    for (let w = 1; w <= 10; w++)
      for (let d = 0; d < 4; d++) {
        const k = getAttnKey(w, d)
        if (a[k] === 'present') present++
        else if (a[k] === 'absent') absent++
      }
    return { present, absent, unmarked: 40 - present - absent }
  }

  async function toggleAttn(week, dayIdx) {
    if (!isAdmin) return
    const a = { ...(DB.attendance?.[targetEmail] || {}) }
    const key = getAttnKey(week, dayIdx)
    const cur = a[key] || 'not-marked'
    const next = cur === 'not-marked' ? 'present' : cur === 'present' ? 'absent' : 'not-marked'
    if (next === 'not-marked') delete a[key]
    else a[key] = next
    const newDB = { ...DB, attendance: { ...DB.attendance, [targetEmail]: a } }
    await saveDB(newDB)
  }

  const stats = getAttnStats()
  const pct = Math.round(stats.present / 40 * 100)
  const attn = getAttn()
  const baseDate = getStudentBaseDate(targetUser)
  const firstClassStr = formatDate(baseDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  function getDayDate(week, dayIdx) {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + ((week - 1) * 4 + dayIdx) * 7)
    return formatDate(d, { day: 'numeric', month: 'short' })
  }

  const statusColors = {
    present: { bg: 'rgba(46,204,113,.08)', num: '#27AE60', dot: '#2ECC71' },
    absent: { bg: 'rgba(229,57,53,.05)', num: '#E53935', dot: '#E53935' },
    'not-marked': { bg: 'transparent', num: 'var(--text)', dot: 'var(--border)' }
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Cabinet Grotesk', marginBottom: 4 }}>
          {isAdmin ? 'Attendance Admin' : 'My Attendance'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20 }}>Class attendance record</div>

        {/* Hero Card */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Cabinet Grotesk' }}>
                {isAdmin ? `${targetUser.name} – Attendance` : 'Attendance Record'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                First class: {firstClassStr}
                {isAdmin && ' · Click a day to toggle present/absent'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Present', value: stats.present, color: '#27AE60' },
                { label: 'Absent', value: stats.absent, color: '#E53935' },
                { label: 'Rate', value: `${pct}%`, color: '#FF8F00' },
                { label: 'Unmarked', value: stats.unmarked, color: 'var(--muted)' }
              ].map(s => (
                <div key={s.label} style={{
                  padding: '10px 14px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg)',
                  textAlign: 'center', minWidth: 78
                }}>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'var(--text2)', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 7, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#FF8F00,#EF6C00)', borderRadius: 3, transition: 'width .7s' }} />
          </div>
        </div>

        {/* Week Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 10 }, (_, wi) => {
            const week = wi + 1
            const weekPresent = [0, 1, 2, 3].filter(d => attn[getAttnKey(week, d)] === 'present').length
            return (
              <div key={week} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow)'
              }}>
                <div style={{
                  padding: '9px 14px', background: 'var(--surface)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 12, fontWeight: 700, color: 'var(--text2)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span>Week {week}</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 10,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    padding: '2px 8px', borderRadius: 20, color: 'var(--muted)'
                  }}>{weekPresent}/4 present</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                  {[0, 1, 2, 3].map(dayIdx => {
                    const key = getAttnKey(week, dayIdx)
                    const status = attn[key] || 'not-marked'
                    const dayNum = (week - 1) * 4 + dayIdx + 1
                    const colors = statusColors[status]
                    return (
                      <div
                        key={dayIdx}
                        onClick={() => isAdmin && toggleAttn(week, dayIdx)}
                        style={{
                          padding: '12px 6px', textAlign: 'center',
                          cursor: isAdmin ? 'pointer' : 'default',
                          borderRight: dayIdx < 3 ? '1px solid var(--border)' : 'none',
                          background: colors.bg,
                          transition: 'background .18s'
                        }}
                      >
                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 3 }}>Sunday</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', marginBottom: 2 }}>{getDayDate(week, dayIdx)}</div>
                        <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'Cabinet Grotesk', color: colors.num, marginBottom: 4 }}>Day {dayNum}</div>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', margin: '0 auto', background: colors.dot }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}