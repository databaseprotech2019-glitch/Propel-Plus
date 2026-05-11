'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const DBContext = createContext(null)

const defaultDB = {
  users: {}, progress: {}, attendance: {}, feedbacks: {},
  remarks: {}, information: [], certificates: {}, referrals: [],
  activities: {}, parentFeedbacks: [], freeCourses: [],
  profilePics: {}, studentsPlus: {}, settings: {}
}

export function DBProvider({ children }) {
  const [DB, setDB] = useState(defaultDB)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function saveDB(newDB) {
    const updated = { ...newDB, lastSaved: Date.now() }
    setDB(updated)
    localStorage.setItem('mrc_db11', JSON.stringify(updated))
    try {
      await supabase.from('app_data').upsert({
        id: 'main', data: updated, updated_at: new Date().toISOString()
      })
    } catch (err) {
      console.warn('Supabase sync failed:', err.message)
    }
  }

  useEffect(() => {
    async function loadDB() {
      let localDB = defaultDB
      try {
        const local = localStorage.getItem('mrc_db11')
        if (local) localDB = JSON.parse(local)
      } catch (e) {}

      try {
        const { data } = await supabase
          .from('app_data').select('data').eq('id', 'main').maybeSingle()
        if (data?.data) {
          const supaTime = data.data?.lastSaved || 0
          const localTime = localDB?.lastSaved || 0
          if (supaTime >= localTime) localDB = data.data
        }
      } catch (e) {}

      applyMigrations(localDB)

      // ── Session Restore ──
      try {
        const saved = localStorage.getItem('mrc_session11')
        if (saved) {
          const s = JSON.parse(saved)
          if (localDB.users[s.email]) {
            setCurrentUser(localDB.users[s.email])
          }
        }
      } catch (e) {}

      setDB(localDB)
      setLoading(false)
    }
    loadDB()
  }, [])

  function applyMigrations(db) {
    if (!db.attendance) db.attendance = {}
    if (!db.feedbacks) db.feedbacks = {}
    if (!db.remarks) db.remarks = {}
    if (!db.information) db.information = []
    if (!db.progress) db.progress = {}
    if (!db.certificates) db.certificates = {}
    if (!db.referrals) db.referrals = []
    if (!db.activities) db.activities = {}
    if (!db.freeCourses) db.freeCourses = []
    if (!db.profilePics) db.profilePics = {}
    if (!db.studentsPlus) db.studentsPlus = {}
    if (!db.settings) db.settings = {}
    if (!db.settings.googleReviewLink) db.settings.googleReviewLink = 'https://g.page/r/propeller-review'
    if (!db.settings.communityLink) db.settings.communityLink = 'https://chat.whatsapp.com/propeller-community'
    if (!db.users['admin@propeller.com']) {
      db.users['admin@propeller.com'] = {
        name: 'Admin', password: 'admin123', role: 'admin',
        level: 'basic', email: 'admin@propeller.com', joinedAt: Date.now()
      }
    }
  }

  return (
    <DBContext.Provider value={{ DB, saveDB, currentUser, setCurrentUser, loading }}>
      {children}
    </DBContext.Provider>
  )
}

export function useDB() {
  return useContext(DBContext)
}