import { useState } from 'react'
import { supabase } from '../lib/supabase'
import SequenceList from '../components/Teacher/SequenceList'
import SequenceForm from '../components/Teacher/SequenceForm'
import StepManager from '../components/Teacher/StepManager'

export default function TeacherDashboard({ session }) {
  const [view, setView] = useState('list')     // 'list' | 'new' | 'steps'
  const [activeSequence, setActiveSequence] = useState(null)

  function handleSequenceSaved(seq) {
    setActiveSequence(seq)
    setView('steps')
  }

  function handleSequenceSelected(seq) {
    setActiveSequence(seq)
    setView('steps')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-teal rounded-full" />
          <button onClick={() => setView('list')} className="font-bold text-gray-800 hover:text-teal">
            SocraActif
          </button>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-gray-500 hover:text-gray-700">
          Déconnexion
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        {view === 'list' && (
          <SequenceList onSelect={handleSequenceSelected} onNew={() => setView('new')} />
        )}
        {view === 'new' && (
          <SequenceForm onSaved={handleSequenceSaved} onCancel={() => setView('list')} />
        )}
        {view === 'steps' && activeSequence && (
          <StepManager sequence={activeSequence} onBack={() => setView('list')} />
        )}
      </main>
    </div>
  )
}
