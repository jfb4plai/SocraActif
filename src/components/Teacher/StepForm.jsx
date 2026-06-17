// src/components/Teacher/StepForm.jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { SCAFFOLDING } from '../../lib/constants'
import MathPalette from '../shared/MathPalette'

const hint = { fontSize: 12, color: 'var(--text3)', marginTop: 4, lineHeight: 1.5 }
const sep = { borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.25rem' }

function Field({ label, name, value, onChange, placeholder, required, multiline, helpText }) {
  return (
    <div>
      <label htmlFor={name} className="plai-label">
        {label}{required && ' *'}
      </label>
      {multiline
        ? <textarea id={name} value={value} onChange={e => onChange(e.target.value)} required={required}
            placeholder={placeholder} rows={3} className="plai-input" />
        : <input id={name} value={value} onChange={e => onChange(e.target.value)} required={required}
            placeholder={placeholder} className="plai-input" />
      }
      {helpText && <p style={hint}>{helpText}</p>}
    </div>
  )
}

export default function StepForm({ sequenceId, position, onSaved, onCancel }) {
  const [form, setForm] = useState({
    content: '',
    expected_answer: '',
    procedure_steps: '',
    error_type_hypothesis: 'technique',
    rupture_point: '',
    distraction_errors: '',
    scaffolding_level: SCAFFOLDING.explicite,
    explicit_hint: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(field) { return val => setForm(f => ({ ...f, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { data, error } = await supabase
      .from('socra_steps')
      .insert({ ...form, sequence_id: sequenceId, position })
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
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--text)', marginBottom: '0.4rem' }}>
        Étape {position}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Décrivez une situation mathématique précise. Vos réponses guident directement les questions que
        l'IA posera à l'élève — plus votre description est ancrée dans ce que font vos élèves réels,
        plus le dialogue sera pertinent.
      </p>

      <MathPalette />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <Field label="Énoncé de l'étape" name="content" value={form.content} onChange={set('content')}
          placeholder="ex: Calcule 1/4 + 1/3"
          required multiline
          helpText="La situation ou l'exercice tel que l'élève le voit. Soyez précis : l'IA s'appuie sur cet énoncé pour formuler ses questions." />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Résultat attendu" name="expected_answer" value={form.expected_answer}
            onChange={set('expected_answer')} placeholder="ex: 7/12"
            required
            helpText="La réponse correcte. Utilisée pour valider la progression de l'élève." />
          <div>
            <label className="plai-label">Type d'erreur visé *</label>
            <select value={form.error_type_hypothesis} onChange={e => set('error_type_hypothesis')(e.target.value)}
              className="plai-input">
              <option value="technique">Technique — erreur de procédure</option>
              <option value="technologie">Technologie — erreur de concept</option>
            </select>
            <p style={hint}>
              {form.error_type_hypothesis === 'technique'
                ? "L'élève connaît la règle mais l'applique mal. Ex : additionne les dénominateurs au lieu de les réduire au même."
                : "L'élève n'a pas compris le concept sous-jacent. Ex : croit qu'additionner des fractions revient à additionner numérateurs et dénominateurs séparément."}
            </p>
          </div>
        </div>

        <div style={sep}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '1rem' }}>
            Contexte pédagogique — votre 20 % de singularité
          </p>
          <p style={{ ...hint, marginBottom: '1rem', marginTop: 0 }}>
            Ces trois champs sont votre apport irremplaçable. L'IA ne peut pas les inventer — elle a besoin
            de ce que vous observez dans votre classe.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Field label="Étapes clés de la procédure" name="procedure_steps" value={form.procedure_steps}
              onChange={set('procedure_steps')}
              placeholder="ex: 1) trouver le dénominateur commun (PPCM) → 2) convertir chaque fraction → 3) additionner les numérateurs → 4) simplifier"
              required multiline
              helpText="Listez les sous-étapes dans l'ordre logique. L'IA s'en sert pour décomposer le guidage et ne pas brûler les étapes." />

            <Field label="Point de rupture typique" name="rupture_point" value={form.rupture_point}
              onChange={set('rupture_point')}
              placeholder="ex: confond addition des dénominateurs avec celle des numérateurs — écrit 1/4 + 1/3 = 2/7"
              required multiline
              helpText="L'erreur la plus fréquente que vous observez chez vos élèves sur cette étape. C'est le coeur du dialogue socratique : l'IA part de cette rupture pour construire ses questions." />

            <Field label="Erreurs de distraction fréquentes" name="distraction_errors"
              value={form.distraction_errors} onChange={set('distraction_errors')}
              placeholder="ex: oublie de simplifier le résultat final (7/12 reste 7/12, mais 4/8 devrait devenir 1/2)"
              multiline
              helpText="Erreurs secondaires, souvent d'inattention. L'IA les garde en mémoire pour ne pas les confondre avec le point de rupture principal. Optionnel." />
          </div>
        </div>

        <div style={sep}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '1rem' }}>
            Paramètres du dialogue
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="plai-label">Niveau d'étayage</label>
              <select value={form.scaffolding_level} onChange={e => set('scaffolding_level')(e.target.value)}
                className="plai-input">
                <option value="explicite">Explicite — l'IA guide pas à pas vers la prochaine micro-étape</option>
                <option value="inductif">Inductif — l'IA pose une question ouverte, l'élève cherche</option>
              </select>
              <p style={hint}>
                {form.scaffolding_level === 'explicite'
                  ? "Adapté aux élèves en grande difficulté ou en début d'apprentissage. L'IA décompose et balise chaque sous-étape."
                  : "Adapté aux élèves qui ont déjà rencontré la notion. L'IA questionne sans donner la direction."}
              </p>
            </div>

            <Field label="Indice final si tous les tours sont épuisés" name="explicit_hint"
              value={form.explicit_hint} onChange={set('explicit_hint')}
              placeholder="ex: Pour additionner des fractions, les dénominateurs doivent être identiques. Commence par trouver le PPCM de 4 et 3, c'est-à-dire le plus petit nombre divisible par 4 et par 3."
              multiline
              helpText="Texte dévoilé à l'élève si le dialogue socratique n'a pas suffi. Rédigez-le comme vous l'expliqueriez à voix haute. Optionnel — si absent, l'IA formule elle-même un indice de dernier recours." />
          </div>
        </div>

      </div>

      {error && <p className="plai-error" style={{ marginTop: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
        <button type="submit" disabled={saving} className="plai-btn">
          {saving ? 'Enregistrement…' : "Ajouter l'étape"}
        </button>
        <button type="button" onClick={onCancel} className="plai-btn-ghost">
          Annuler
        </button>
      </div>
    </form>
  )
}
