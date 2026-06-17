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
          <>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '1.5rem 1.75rem', marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--text)' }}>
                  Bienvenue dans SocraActif
                </p>
                <span style={{ fontSize: 12, color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 20, padding: '3px 12px', fontWeight: 500 }}>
                  Priorité mathématiques
                </span>
              </div>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--teal)', marginBottom: 6 }}>
                    Pourquoi créer un parcours ?
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
                    Un parcours regroupe les étapes d'une séquence d'apprentissage. Pour chaque étape, l'IA propose une question socratique adaptée à l'erreur identifiée — l'élève cherche, l'enseignant valide.
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--teal)', marginBottom: 6 }}>
                    Points d'attention
                  </p>
                  <ul style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, paddingLeft: '1.1rem', margin: 0 }}>
                    <li>Chaque étape = une compétence ou un sous-objectif précis</li>
                    <li>La "rupture" que vous décrivez oriente toute la question IA</li>
                    <li>Relisez et ajustez la question avant de la projeter</li>
                  </ul>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--teal)', marginBottom: 6 }}>
                    Conseil didactique
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
                    Une bonne question socratique ne donne pas la réponse — elle révèle à l'élève ce qu'il sait déjà. Partez toujours de ce que l'élève a <em>produit</em>, pas de ce qu'il aurait dû faire.
                  </p>
                </div>
              </div>
            </div>
            <SequenceList onSelect={handleSequenceSelected} onNew={() => setView('new')} />
          </>
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
