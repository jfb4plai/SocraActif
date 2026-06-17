// src/components/Projection/ProjectionView.jsx
import { useState } from 'react'
import TeacherPanel from './TeacherPanel'

export default function ProjectionView({ step, sequence }) {
  const [teacherAnswer, setTeacherAnswer] = useState('')
  const [question, setQuestion] = useState(null)
  const [hint, setHint] = useState(null)
  const [classification, setClassification] = useState(null)
  const [history, setHistory] = useState([])
  const [currentTurn, setCurrentTurn] = useState(1)
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('input')  // 'input' | 'dialogue' | 'hint'

  async function handleClassify(e) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/classify-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_answer: teacherAnswer,
        expected_answer: step.expected_answer,
        procedure_steps: step.procedure_steps,
        teacher_hypothesis: step.error_type_hypothesis,
        distraction_errors: step.distraction_errors
      })
    })
    const data = await res.json()
    setClassification(data)
    setLoading(false)
    if (data.type === 'correct' || data.type === 'faute') return
    await fetchNextQuestion(data.type, [])
    setPhase('dialogue')
  }

  async function fetchNextQuestion(errorType, convHistory) {
    setLoading(true)
    const res = await fetch('/api/socratic-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_type: errorType || classification?.type,
        rupture_point: step.rupture_point,
        scaffolding_level: step.scaffolding_level,
        current_turn: currentTurn,
        max_turns: sequence.max_socratic_turns,
        conversation_history: convHistory,
        last_student_answer: teacherAnswer
      })
    })
    const data = await res.json()
    setQuestion(data.question)
    setLoading(false)
  }

  async function handleNextTurn() {
    const newHistory = question
      ? [...history, { role: 'assistant', content: question }]
      : history
    setHistory(newHistory)
    setCurrentTurn(t => t + 1)
    await fetchNextQuestion(null, newHistory)
  }

  async function handleRevealHint() {
    if (step.explicit_hint) { setHint(step.explicit_hint); setPhase('hint'); return }
    const res = await fetch('/api/classify-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_answer: teacherAnswer, expected_answer: step.expected_answer,
        procedure_steps: step.procedure_steps, teacher_hypothesis: step.error_type_hypothesis,
        distraction_errors: step.distraction_errors, hint_mode: true
      })
    })
    const data = await res.json()
    setHint(data.hint)
    setPhase('hint')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="px-8 py-5 border-b border-gray-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-teal rounded-full" />
        <span className="font-bold text-xl">SocraActif</span>
        <span className="text-gray-400 ml-4">{sequence.title}</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 space-y-10">
        <div className="text-center max-w-2xl">
          <p className="text-gray-400 text-sm mb-4 uppercase tracking-wide">Étape {step.position}</p>
          <p className="text-3xl leading-relaxed">{step.content}</p>
        </div>

        {phase === 'input' && (
          <form onSubmit={handleClassify} className="w-full max-w-md space-y-4">
            <input value={teacherAnswer} onChange={e => setTeacherAnswer(e.target.value)} required
              placeholder="Saisir la réponse d'un élève…"
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-3 text-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-teal" />
            <button type="submit" disabled={loading}
              className="w-full bg-teal py-3 rounded-md font-medium text-lg hover:opacity-90 disabled:opacity-50">
              {loading ? 'Analyse…' : 'Analyser et démarrer le dialogue'}
            </button>
          </form>
        )}

        {phase === 'dialogue' && question && (
          <div className="max-w-2xl w-full">
            <div className="bg-teal/20 border border-teal/50 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm mb-4">Question {currentTurn}/{sequence.max_socratic_turns}</p>
              <p className="text-2xl leading-relaxed">{question}</p>
            </div>
            {loading && <p className="text-center text-gray-400 mt-4">Génération…</p>}
          </div>
        )}

        {phase === 'hint' && hint && (
          <div className="max-w-2xl w-full bg-amber-900/30 border border-amber-500/50 rounded-xl p-8 text-center">
            <p className="text-amber-400 text-sm mb-4 uppercase tracking-wide">Indice</p>
            <p className="text-2xl leading-relaxed">{hint}</p>
          </div>
        )}
      </main>

      <TeacherPanel
        classification={classification}
        onNextTurn={handleNextTurn}
        onRevealHint={handleRevealHint}
        loading={loading}
      />
    </div>
  )
}
