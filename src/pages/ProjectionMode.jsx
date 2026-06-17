// src/pages/ProjectionMode.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ProjectionView from '../components/Projection/ProjectionView'

export default function ProjectionMode() {
  const params = new URLSearchParams(window.location.search)
  const sessionCode = params.get('code')
  const [data, setData] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionCode) return
    supabase.from('sequences').select('*, steps(*)')
      .eq('session_code', sessionCode.toUpperCase())
      .single()
      .then(({ data, error }) => {
        if (error) { setError('Code invalide'); return }
        const steps = [...(data.steps || [])].sort((a, b) => a.position - b.position)
        setData({ sequence: data, steps })
      })
  }, [sessionCode])

  if (!sessionCode) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p>Ajouter <code>?code=XXXXXX</code> à l'URL</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p className="text-gray-400">Chargement…</p>
    </div>
  )

  return (
    <ProjectionView
      step={data.steps[stepIndex]}
      sequence={data.sequence}
    />
  )
}
