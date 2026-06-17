import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DEFAULTS, MODE } from '../../lib/constants'

const hint = { fontSize: 12, color: 'var(--text3)', marginTop: 4, lineHeight: 1.5 }

export default function SequenceForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    subject: '',
    mode: MODE.autonomie,
    validation_threshold: DEFAULTS.validation_threshold,
    blocking_mode: DEFAULTS.blocking_mode,
    max_socratic_turns: DEFAULTS.max_socratic_turns
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data, error } = await supabase
      .from('socra_sequences')
      .insert({ ...form, user_id: user.id, session_code: sessionCode })
      .select()
      .single()
    if (error) { setError(error.message); setSaving(false); return }
    onSaved(data)
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1.75rem 2rem'
    }}>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--text)', marginBottom: '0.5rem' }}>
        Nouveau parcours
      </p>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
        Un parcours regroupe une séquence d'étapes mathématiques. Vous y ajouterez les étapes après la création.
        Le code de session permettra aux élèves de rejoindre le parcours.
      </p>

      <div style={{ marginBottom: '1.25rem' }}>
        <label className="plai-label">Titre du parcours *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} required
          placeholder="ex: Fractions — addition de fractions hétéronymes"
          className="plai-input" />
        <p style={hint}>Choisissez un titre précis qui identifie la compétence travaillée.</p>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label className="plai-label">Sous-thème mathématique *</label>
        <input value={form.subject} onChange={e => set('subject', e.target.value)} required
          placeholder="ex: Addition de fractions — dénominateurs différents"
          className="plai-input" />
        <p style={hint}>Précisez la notion ou la procédure ciblée (sera utilisée par l'IA pour calibrer ses questions).</p>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <label className="plai-label">Mode de déploiement</label>
        <select value={form.mode} onChange={e => set('mode', e.target.value)} className="plai-input">
          <option value="autonomie">Autonomie — l'élève travaille seul avec un code de session</option>
          <option value="projection">Projection — l'enseignant pilote au tableau collectif</option>
        </select>
        <p style={hint}>
          {form.mode === 'autonomie'
            ? "Un code à 6 lettres sera généré. Distribuez-le aux élèves pour qu'ils rejoignent le parcours sur leur appareil."
            : "Vous projetez le parcours au tableau. Vous contrôlez le rythme, les élèves participent à l'oral."}
        </p>
      </div>

      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '0.9rem' }}>
          Paramètres pédagogiques — valeurs par défaut recommandées
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>
            <label className="plai-label">Tours socratiques max</label>
            <input type="number" min="2" max="6" value={form.max_socratic_turns}
              onChange={e => set('max_socratic_turns', parseInt(e.target.value))}
              className="plai-input" />
            <p style={hint}>Nombre de questions que l'IA pose avant de dévoiler l'indice. Entre 2 (rapide) et 6 (approfondi). Défaut : 4.</p>
          </div>
          <div>
            <label className="plai-label">Seuil de validation (%)</label>
            <input type="number" min="50" max="100" value={form.validation_threshold}
              onChange={e => set('validation_threshold', parseInt(e.target.value))}
              className="plai-input" />
            <p style={hint}>Score minimum pour valider une étape. À 70 %, l'élève peut avancer avec 7 réponses correctes sur 10. Défaut : 70 %.</p>
          </div>
          <div>
            <label className="plai-label">Mode de blocage</label>
            <select value={form.blocking_mode} onChange={e => set('blocking_mode', e.target.value)}
              className="plai-input">
              <option value="soft">Doux — avertissement, l'élève peut continuer</option>
              <option value="strict">Strict — l'élève doit réussir avant d'avancer</option>
            </select>
            <p style={hint}>Doux : conseillé pour la découverte. Strict : pour les révisions ou les évaluations formatives.</p>
          </div>
        </div>
      </div>

      {error && <p className="plai-error">{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" disabled={saving} className="plai-btn">
          {saving ? 'Création…' : 'Créer le parcours'}
        </button>
        <button type="button" onClick={onCancel} className="plai-btn-ghost">
          Annuler
        </button>
      </div>
    </form>
  )
}
