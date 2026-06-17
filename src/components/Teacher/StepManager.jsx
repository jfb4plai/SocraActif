// src/components/Teacher/StepManager.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import StepForm from './StepForm'

export default function StepManager({ sequence, onBack }) {
  const [steps, setSteps] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('steps').select('*')
      .eq('sequence_id', sequence.id)
      .order('position')
      .then(({ data }) => { setSteps(data || []); setLoading(false) })
  }, [sequence.id])

  function handleStepSaved(step) {
    setSteps(prev => [...prev, step])
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Retour</button>
        <h2 className="text-lg font-semibold text-gray-800">{sequence.title}</h2>
      </div>

      {sequence.mode === 'autonomie' && (
        <div className="bg-teal/10 border border-teal/30 rounded-md p-3 text-sm">
          Code session élève : <strong className="text-teal tracking-widest">{sequence.session_code}</strong>
          <span className="ml-3 text-gray-500">· Distribuer sur papier</span>
        </div>
      )}

      {loading ? <p className="text-gray-500">Chargement…</p> : (
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Étape {i + 1}</p>
              <p className="text-gray-800">{step.content}</p>
              <p className="text-xs text-gray-400 mt-2">Réponse : {step.expected_answer} · Type : {step.error_type_hypothesis}</p>
            </div>
          ))}
        </div>
      )}

      {showForm
        ? <StepForm sequenceId={sequence.id} position={steps.length + 1}
            onSaved={handleStepSaved} onCancel={() => setShowForm(false)} />
        : (
          <button onClick={() => setShowForm(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-500 hover:border-teal hover:text-teal transition-colors">
            + Ajouter une étape
          </button>
        )
      }
    </div>
  )
}
