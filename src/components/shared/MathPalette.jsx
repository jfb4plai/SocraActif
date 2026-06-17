// Palette de symboles mathématiques — insertion au curseur dans l'input/textarea actif
// onMouseDown preventDefault conserve le focus sur le champ cible

const ROWS = [
  { label: 'Opérateurs', syms: ['×', '÷', '±', '=', '≠', '≈', '<', '>', '≤', '≥'] },
  { label: 'Exposants / racines', syms: ['²', '³', '⁴', '√', 'π', '∞', 'Δ', '%'] },
  { label: 'Fractions courantes', syms: ['½', '⅓', '¼', '⅔', '¾', '⅛', '⅜', '⅝', '⅞'] },
  { label: 'Ensembles / parenthèses', syms: ['(', ')', '[', ']', '{', '}', '∈', '∉', '∅'] },
]

function insertAtCursor(sym) {
  const el = document.activeElement
  if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? start
  const val = el.value
  const newVal = val.slice(0, start) + sym + val.slice(end)
  // Déclenche onChange React sur un input contrôlé
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set
  nativeSetter.call(el, newVal)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + sym.length
    el.focus()
  })
}

export default function MathPalette() {
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem',
      marginBottom: '1rem'
    }}>
      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        Symboles mathématiques — cliquer pour insérer dans le champ actif
      </p>
      {ROWS.map(row => (
        <div key={row.label} style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
          {row.syms.map(sym => (
            <button
              key={sym}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => insertAtCursor(sym)}
              style={{
                fontFamily: 'monospace', fontSize: 15, lineHeight: 1,
                padding: '4px 8px', borderRadius: 4,
                border: '1px solid var(--border2)', background: 'var(--surface)',
                color: 'var(--text)', cursor: 'pointer', transition: 'background 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              {sym}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
