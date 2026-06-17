// src/components/Teacher/StepForm.jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { SCAFFOLDING } from '../../lib/constants'

function Field({ label, name, value, onChange, placeholder, required, multiline }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && ' *'}
      </label>
      {multiline
        ? <textarea id={name} value={value} onChange={e => onChange(e.target.value)} required={required}
            placeholder={placeholder} rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-base" />
        : <input id={name} value={value} onChange={e => onChange(e.target.value)} required={required}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-base" />
      }
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
      .from('steps')
      .insert({ ...form, sequence_id: sequenceId, position })
      .select()
      .single()
    if (error) { setError(error.message); setSaving(false); return }
    onSaved(data)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
      <h3 className="font-medium text-gray-800">Étape {position}</h3>

      <Field label="Énoncé" name="content" value={form.content} onChange={set('content')}
        placeholder="ex: Calcule 1/4 + 1/3" required multiline />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Résultat attendu" name="expected_answer" value={form.expected_answer}
          onChange={set('expected_answer')} placeholder="ex: 7/12" required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type d'erreur visé</label>
          <select value={form.error_type_hypothesis} onChange={e => set('error_type_hypothesis')(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-base">
            <option value="technique">Technique (procédure)</option>
            <option value="technologie">Technologie (concept)</option>
          </select>
        </div>
      </div>

      <Field label="Étapes clés de la procédure" name="procedure_steps" value={form.procedure_steps}
        onChange={set('procedure_steps')}
        placeholder="ex: trouver dénominateur commun → convertir → additionner numérateurs" required multiline />

      <Field label="Point de rupture typique" name="rupture_point" value={form.rupture_point}
        onChange={set('rupture_point')}
        placeholder="ex: confond addition des dénominateurs avec celle des numérateurs" required multiline />

      <Field label="Erreurs de distraction fréquentes (optionnel)" name="distraction_errors"
        value={form.distraction_errors} onChange={set('distraction_errors')}
        placeholder="ex: oublie de simplifier le résultat final" multiline />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étayage</label>
        <select value={form.scaffolding_level} onChange={e => set('scaffolding_level')(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-base">
          <option value="explicite">Explicite (guidage pas à pas)</option>
          <option value="inductif">Inductif (l'élève cherche)</option>
        </select>
      </div>

      <Field label="Hint explicite si tous les tours échoués (optionnel)" name="explicit_hint"
        value={form.explicit_hint} onChange={set('explicit_hint')}
        placeholder="ex: Pour additionner des fractions, les dénominateurs doivent être identiques. Commence par trouver le PPCM de 4 et 3."
        multiline />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-teal text-white px-4 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? 'Enregistrement…' : "Ajouter l'étape"}
        </button>
        <button type="button" onClick={onCancel} className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100">
          Annuler
        </button>
      </div>
    </form>
  )
}
