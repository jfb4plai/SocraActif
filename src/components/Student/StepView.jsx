// src/components/Student/StepView.jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import SocraticDialog from './SocraticDialog'
import HintView from './HintView'

export default function StepView({ step, sequence, studentCode, attemptNumber, onNext, onSolved }) {
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState('input')   // 'input' | 'faute' | 'dialogue' | 'hint' | 'correct'
  const [errorType, setErrorType] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [hint, setHint] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const classifyRes = await fetch('/api/classify-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_answer: answer,
        expected_answer: step.expected_answer,
        procedure_steps: step.procedure_steps,
        teacher_hypothesis: step.error_type_hypothesis,
        distraction_errors: step.distraction_errors
      })
    })
    const classification = await classifyRes.json()

    const { data: attempt } = await supabase.from('socra_attempts').insert({
      step_id: step.id,
      student_code: studentCode,
      answer,
      error_classification: classification.type,
      match_hypothesis: classification.match_hypothesis,
      solved: classification.type === 'correct',
      attempt_number: attemptNumber
    }).select().single()

    setAttemptId(attempt.id)
    setLoading(false)

    if (classification.type === 'correct') {
      setState('correct')
      if (onSolved) onSolved()
      return
    }
    if (classification.type === 'faute') { setState('faute'); return }
    setErrorType(classification.type)
    setState('dialogue')
  }

  async function handleMaxTurnsReached() {
    if (step.explicit_hint) { setHint(step.explicit_hint); setState('hint'); return }
    const res = await fetch('/api/classify-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_answer: answer, expected_answer: step.expected_answer,
        procedure_steps: step.procedure_steps, teacher_hypothesis: step.error_type_hypothesis,
        distraction_errors: step.distraction_errors, hint_mode: true
      })
    })
    const data = await res.json()
    setHint(data.hint)
    setState('hint')
  }

  function handleContinueAfterHint() {
    setAnswer('')
    setAttemptId(null)
    setState('input')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-sm mb-2">Étape {step.position}</p>
        <p className="text-gray-800 text-xl leading-relaxed">{step.content}</p>
      </div>

      {state === 'input' && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={answer} onChange={e => setAnswer(e.target.value)} required
            placeholder="Ta réponse…"
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-xl text-center focus:outline-none focus:ring-2 focus:ring-teal" />
          <button type="submit" disabled={loading}
            className="w-full bg-teal text-white py-3 rounded-md font-medium text-lg hover:opacity-90 disabled:opacity-50">
            {loading ? 'Vérification…' : 'Vérifier ma réponse'}
          </button>
        </form>
      )}

      {state === 'faute' && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-3">
          <p className="text-yellow-800">L'étape est juste — relis ton calcul.</p>
          <button onClick={() => setState('input')}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md font-medium hover:opacity-90">
            Réessayer
          </button>
        </div>
      )}

      {state === 'dialogue' && (
        <SocraticDialog
          errorType={errorType}
          rupturePoint={step.rupture_point}
          scaffoldingLevel={step.scaffolding_level}
          maxTurns={sequence.max_socratic_turns}
          attemptId={attemptId}
          onSolved={() => { setState('correct'); if (onSolved) onSolved() }}
          onMaxTurnsReached={handleMaxTurnsReached}
        />
      )}

      {state === 'hint' && (
        <HintView hint={hint} onContinue={handleContinueAfterHint} />
      )}

      {state === 'correct' && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-5 space-y-3 text-center">
          <p className="text-green-800 font-medium text-lg">Bravo !</p>
          <button onClick={onNext}
            className="bg-teal text-white px-6 py-3 rounded-md font-medium hover:opacity-90">
            Étape suivante →
          </button>
        </div>
      )}
    </div>
  )
}
