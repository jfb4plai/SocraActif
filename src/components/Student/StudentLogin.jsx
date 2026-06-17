// src/components/Student/StudentLogin.jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function StudentLogin({ onLoggedIn }) {
  const [studentCode, setStudentCode] = useState('')
  const [sessionCode, setSessionCode] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const { data, error } = await supabase
      .from('socra_sequences')
      .select('*, steps(*)')
      .eq('session_code', sessionCode.toUpperCase())
      .single()
    if (error || !data) { setError('Code session invalide. Vérifie avec ton enseignant.'); return }
    const steps = [...(data.steps || [])].sort((a, b) => a.position - b.position)
    onLoggedIn({ sequence: data, steps, studentCode: studentCode.trim() })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-teal rounded-full" />
          <h1 className="text-xl font-bold text-gray-800">SocraActif</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ton code (ex: LION)</label>
            <input value={studentCode} onChange={e => setStudentCode(e.target.value)} required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg tracking-widest text-center uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code de session (donné par l'enseignant)</label>
            <input value={sessionCode} onChange={e => setSessionCode(e.target.value)} required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg tracking-widest text-center uppercase" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit"
            className="w-full bg-teal text-white py-3 rounded-md font-medium text-lg hover:opacity-90">
            Commencer
          </button>
        </form>
      </div>
    </div>
  )
}
