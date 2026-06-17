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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="plai-nav">
        <button className="plai-nav-logo" onClick={() => setView('list')}>
          <img src="/plai-logo.jpg" alt="PLAI" style={{ height: 32, width: 'auto' }} />
          SocraActif
        </button>
        <div className="plai-nav-actions">
          {view !== 'list' && (
            <button className="plai-nav-link" onClick={() => setView('list')}>
              ← Mes parcours
            </button>
          )}
          <button className="plai-nav-link" onClick={() => supabase.auth.signOut()}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="plai-banner">
        Pour toute question — <a href="mailto:jeanfrancois.beguin@ens.ecl.be">jeanfrancois.beguin@ens.ecl.be</a>
      </div>

      <div className="plai-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        {view === 'list' && (
          <SequenceList onSelect={handleSequenceSelected} onNew={() => setView('new')} />
        )}
        {view === 'new' && (
          <SequenceForm onSaved={handleSequenceSaved} onCancel={() => setView('list')} />
        )}
        {view === 'steps' && activeSequence && (
          <StepManager sequence={activeSequence} onBack={() => setView('list')} />
        )}
      </div>
    </div>
  )
}
