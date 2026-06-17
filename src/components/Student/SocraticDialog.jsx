// src/components/Student/SocraticDialog.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function SocraticDialog({
  errorType, rupturePoint, scaffoldingLevel, maxTurns,
  attemptId, onSolved, onMaxTurnsReached
}) {
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [history, setHistory] = useState([])
  const [currentTurn, setCurrentTurn] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchQuestion([]) }, [])

  async function fetchQuestion(conversationHistory, lastAnswer = '') {
    setLoading(true)
    const res = await fetch('/api/socratic-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_type: errorType,
        rupture_point: rupturePoint,
        scaffolding_level: scaffoldingLevel,
        current_turn: currentTurn,
        max_turns: maxTurns,
        conversation_history: conversationHistory,
        last_student_answer: lastAnswer || '(début du dialogue)'
      })
    })
    const data = await res.json()
    setQuestion(data.question)
    setLoading(false)

    if (attemptId) {
      await supabase.from('socra_conversations').insert({
        attempt_id: attemptId, turn: currentTurn, role: 'assistant', content: data.question
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newHistory = [...history, { role: 'assistant', content: question }, { role: 'user', content: answer }]
    setHistory(newHistory)

    if (attemptId) {
      await supabase.from('socra_conversations').insert({
        attempt_id: attemptId, turn: currentTurn, role: 'student', content: answer
      })
    }

    if (currentTurn >= maxTurns) {
      onMaxTurnsReached()
      return
    }

    setCurrentTurn(t => t + 1)
    setAnswer('')
    await fetchQuestion(newHistory, answer)
  }

  if (loading) return <div className="text-gray-500 py-4">Réflexion en cours…</div>

  return (
    <div className="space-y-4">
      <div className="bg-teal/10 border border-teal/30 rounded-lg p-4">
        <p className="text-sm text-teal font-medium mb-1">Question ({currentTurn}/{maxTurns})</p>
        <p className="text-gray-800 text-lg leading-relaxed">{question}</p>
      </div>

      {history.filter(h => h.role === 'student').length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {history.filter(h => h.role === 'student').map((h, i) => (
            <p key={i} className="text-sm text-gray-500">Toi : {h.content}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input value={answer} onChange={e => setAnswer(e.target.value)} required
          placeholder="Ta réponse…"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal" />
        <button type="submit"
          className="bg-teal text-white px-4 py-2 rounded-md font-medium hover:opacity-90">
          Envoyer
        </button>
      </form>

      <button onClick={onSolved} className="text-sm text-teal underline">
        J'ai trouvé la bonne réponse
      </button>
    </div>
  )
}
