import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function SequenceList({ onSelect, onNew }) {
  const [sequences, setSequences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('socra_sequences').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setSequences(data || []); setLoading(false) })
  }, [])

  if (loading) return <p style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Chargement…</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--text)' }}>
          Mes parcours
        </h2>
        <button className="plai-btn" onClick={onNew}>+ Nouveau parcours</button>
      </div>

      {sequences.length === 0 && (
        <div className="plai-empty">Aucun parcours. Créez le premier.</div>
      )}

      {sequences.map(seq => (
        <button key={seq.id} onClick={() => onSelect(seq)}
          className="plai-card"
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'block',
            marginBottom: '0.75rem', transition: 'border-color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <p style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{seq.title}</p>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>{seq.subject} · {seq.mode}</p>
          {seq.session_code && (
            <p style={{ fontSize: 12, color: 'var(--teal)', marginTop: 4 }}>
              Code session : <strong>{seq.session_code}</strong>
            </p>
          )}
        </button>
      ))}
    </div>
  )
}
