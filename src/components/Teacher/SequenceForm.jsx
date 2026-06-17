import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DEFAULTS, MODE } from '../../lib/constants'

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
      .from('sequences')
      .insert({ ...form, user_id: user.id, session_code: sessionCode })
      .select()
      .single()
    if (error) { setError(error.message); setSaving(false); return }
    onSaved(data)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Nouveau parcours</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-base" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Matière *</label>
        <input value={form.subject} onChange={e => set('subject', e.target.value)} required
          placeholder="ex: Fractions — addition"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-base" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mode de déploiement</label>
        <select value={form.mode} onChange={e => set('mode', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-base">
          <option value="autonomie">Autonomie (code élève)</option>
          <option value="projection">Projection (tableau collectif)</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seuil validation (%)</label>
          <input type="number" min="50" max="100" value={form.validation_threshold}
            onChange={e => set('validation_threshold', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blocage</label>
          <select value={form.blocking_mode} onChange={e => set('blocking_mode', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-base">
            <option value="soft">Doux (avertissement)</option>
            <option value="strict">Strict (bloquant)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tours socratiques max</label>
          <input type="number" min="2" max="6" value={form.max_socratic_turns}
            onChange={e => set('max_socratic_turns', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-base" />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-teal text-white px-4 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? 'Enregistrement…' : 'Créer le parcours'}
        </button>
        <button type="button" onClick={onCancel}
          className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100">
          Annuler
        </button>
      </div>
    </form>
  )
}
