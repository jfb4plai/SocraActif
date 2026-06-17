import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const styles = `
  .rp-root { font-family: 'DM Sans', sans-serif; background: #faf9f7; color: #1a1814; min-height: 100vh; display: flex; flex-direction: column; }
  .rp-nav { position: sticky; top: 0; background: rgba(250,249,247,0.92); backdrop-filter: blur(8px); border-bottom: 1px solid #e8e4dd; padding: 0 2rem; display: flex; align-items: center; height: 52px; }
  .rp-nav-logo { font-family: 'DM Serif Display', serif; font-size: 18px; color: #1a1814; text-decoration: none; display: flex; align-items: center; gap: 10px; }
  .rp-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 1.5rem; }
  .rp-card { background: #fff; border: 1px solid #e8e4dd; border-radius: 12px; padding: 2rem; width: 100%; max-width: 380px; }
  .rp-card h2 { font-family: 'DM Serif Display', serif; font-size: 20px; margin-bottom: 1.25rem; text-align: center; }
  .rp-field { margin-bottom: 1rem; }
  .rp-label { display: block; font-size: 13px; font-weight: 500; color: #5a564f; margin-bottom: 4px; }
  .rp-input { width: 100%; border: 1px solid #d4cfc6; border-radius: 7px; padding: 9px 12px; font-size: 15px; font-family: 'DM Sans', sans-serif; background: #faf9f7; color: #1a1814; box-sizing: border-box; outline: none; transition: border 0.15s; }
  .rp-input:focus { border-color: #0f6e56; box-shadow: 0 0 0 3px rgba(15,110,86,0.1); }
  .rp-btn { width: 100%; background: #0f6e56; color: #fff; border: none; border-radius: 7px; padding: 11px; font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.15s; margin-top: 0.5rem; }
  .rp-btn:hover { opacity: 0.88; }
  .rp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .rp-btn-ghost { width: 100%; background: none; border: 1px solid #d4cfc6; border-radius: 7px; padding: 10px; font-size: 14px; color: #5a564f; font-family: 'DM Sans', sans-serif; cursor: pointer; margin-top: 0.75rem; transition: background 0.15s; }
  .rp-btn-ghost:hover { background: #f4f2ee; }
  .rp-error { color: #a32d2d; font-size: 13px; margin-bottom: 0.75rem; }
  .rp-success { color: #0f6e56; font-size: 14px; text-align: center; }
  .rp-center { text-align: center; padding: 1.5rem 0; }
`

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6) { setError('Minimum 6 caractères.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message) } else { setSuccess(true) }
    setLoading(false)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="rp-root">
        <nav className="rp-nav">
          <a className="rp-nav-logo" href="/">
            <img src="/plai-logo.jpg" alt="PLAI" style={{ height: 32, width: 'auto' }} />
            SocraActif · PLAI
          </a>
        </nav>

        <div className="rp-main">
          <div className="rp-card">
            <h2>Nouveau mot de passe</h2>

            {success ? (
              <div className="rp-center">
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p className="rp-success">Mot de passe modifié avec succès.</p>
                <button className="rp-btn-ghost" style={{ marginTop: '1.25rem' }}
                  onClick={() => window.location.href = '/'}>
                  Retour à la connexion
                </button>
              </div>
            ) : !validSession ? (
              <div className="rp-center">
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: '#5a564f', fontSize: 14 }}>Lien invalide ou expiré.<br />Recommencez la procédure depuis la page de connexion.</p>
                <button className="rp-btn-ghost" style={{ marginTop: '1.25rem' }}
                  onClick={() => window.location.href = '/'}>
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="rp-pwd">Nouveau mot de passe</label>
                  <input id="rp-pwd" className="rp-input" type="password" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
                </div>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="rp-confirm">Confirmer</label>
                  <input id="rp-confirm" className="rp-input" type="password" value={confirm}
                    onChange={e => setConfirm(e.target.value)} required minLength={6} placeholder="••••••••" />
                </div>
                {error && <p className="rp-error">{error}</p>}
                <button type="submit" className="rp-btn" disabled={loading}>
                  {loading ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
