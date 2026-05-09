import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ezjtwjuncwmynonhxike.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6anR3anVuY3dteW5vbmh4aWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzE3NjMsImV4cCI6MjA5MzgwNzc2M30.HUZ63_ZqjydlM0h9CAdFhTI230qqag5ACL24ucOhnjE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)