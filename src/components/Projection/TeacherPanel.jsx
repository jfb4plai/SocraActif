// src/components/Projection/TeacherPanel.jsx
import { useState } from 'react'

export default function TeacherPanel({ classification, onNextTurn, onRevealHint, loading }) {
  const [open, setOpen] = useState(true)

  if (!classification) return null

  const labels = {
    faute: { label: 'Faute (inattention)', color: 'yellow' },
    technique: { label: 'Erreur de technique', color: 'orange' },
    technologie: { label: 'Erreur de technologie', color: 'red' },
    correct: { label: 'Correct', color: 'green' }
  }
  const info = labels[classification.type] || {}

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setOpen(o => !o)}
        className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full mb-2 block ml-auto">
        {open ? 'Masquer panneau' : 'Panneau enseignant'}
      </button>
      {open && (
        <div className="bg-gray-800 text-white rounded-lg p-4 w-72 space-y-3 shadow-xl">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Diagnostic (confidentiel)</p>
          <p className="font-medium">{info.label}</p>
          <p className="text-xs text-gray-400">Confiance : {Math.round((classification.confidence || 0) * 100)}%</p>
          {classification.reasoning && (
            <p className="text-sm text-gray-300 italic">{classification.reasoning}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={onNextTurn} disabled={loading}
              className="flex-1 bg-teal text-white py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50">
              Tour suivant
            </button>
            <button onClick={onRevealHint}
              className="flex-1 bg-amber-500 text-white py-2 rounded-md text-sm hover:opacity-90">
              Dévoiler indice
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
