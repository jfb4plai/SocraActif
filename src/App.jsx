import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Auth/Login'
import ResetPassword from './pages/ResetPassword'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentSession from './pages/StudentSession'
import ProjectionMode from './pages/ProjectionMode'

function getRoute() {
  const path = window.location.pathname
  if (path.startsWith('/eleve')) return 'student'
  if (path.startsWith('/projection')) return 'projection'
  if (path.startsWith('/reset-password')) return 'reset'
  return 'teacher'
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const route = getRoute()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement…</div>

  if (route === 'student') return <StudentSession />
  if (route === 'projection') return <ProjectionMode />
  if (route === 'reset') return <ResetPassword />
  if (!session) return <Login />
  return <TeacherDashboard session={session} />
}
