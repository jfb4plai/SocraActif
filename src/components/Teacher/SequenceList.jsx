import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function SequenceList({ onSelect, onNew }) {
  const [sequences, setSequences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('socra_sequences').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setSequences(data || []); setLoading(false) })
  }, [])

  if (loading) return <p className="text-gray-500">Chargement…</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Mes parcours</h2>
        <button onClick={onNew}
          className="bg-teal text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          + Nouveau parcours
        </button>
      </div>
      {sequences.length === 0 && (
        <p className="text-gray-500 text-sm">Aucun parcours. Créez le premier.</p>
      )}
      {sequences.map(seq => (
        <button key={seq.id} onClick={() => onSelect(seq)}
          className="w-full text-left bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-teal transition-colors">
          <p className="font-medium text-gray-800">{seq.title}</p>
          <p className="text-sm text-gray-500">{seq.subject} · {seq.mode}</p>
          {seq.session_code && (
            <p className="text-xs text-teal mt-1">Code : {seq.session_code}</p>
          )}
        </button>
      ))}
    </div>
  )
}
