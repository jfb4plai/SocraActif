import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const styles = `
  .sa-root {
    font-family: 'DM Sans', sans-serif;
    background: #faf9f7;
    color: #1a1814;
    min-height: 100vh;
  }
  .sa-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,249,247,0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #e8e4dd;
    padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 52px;
  }
  .sa-nav-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 18px; color: #1a1814; text-decoration: none;
    display: flex; align-items: center; gap: 10px;
  }
  .sa-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;
    color: #9a958c; border: 1px solid #d4cfc6;
    padding: 4px 14px; border-radius: 20px; margin-bottom: 1.5rem;
    font-family: 'DM Sans', sans-serif;
  }
  .sa-banner {
    background: #e1f5ee; border-bottom: 1px solid #1d9e75;
    padding: 0.65rem 2rem; text-align: center;
    font-size: 13px; color: #0f6e56;
    font-family: 'DM Sans', sans-serif;
  }
  .sa-banner a { color: #0f6e56; font-weight: 500; }
  .sa-container { max-width: 720px; margin: 0 auto; padding: 0 1.5rem; }
  .sa-hero {
    padding: 5rem 0 3rem; text-align: center;
  }
  .sa-hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(36px, 6vw, 54px); line-height: 1.1;
    letter-spacing: -1px; margin-bottom: 1rem;
  }
  .sa-hero h1 em { font-style: italic; color: #5a564f; }
  .sa-hero-sub {
    font-size: 17px; color: #5a564f; max-width: 480px; margin: 0 auto 2rem;
    font-family: 'DM Serif Display', serif; font-style: italic; line-height: 1.5;
  }
  .sa-section {
    padding: 3rem 0 2.5rem;
    border-top: 1px solid #e8e4dd;
  }
  .sa-section h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 22px; margin-bottom: 1.25rem; color: #1a1814;
  }
  .sa-cards {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem; margin-bottom: 1.5rem;
  }
  .sa-card {
    background: #fff; border: 1px solid #e8e4dd; border-radius: 10px;
    padding: 1.25rem; font-size: 14px; line-height: 1.6;
  }
  .sa-card-title {
    font-weight: 500; color: #0f6e56; margin-bottom: 0.35rem; font-size: 13px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .sa-ref {
    background: #f4f2ee; border-radius: 8px; padding: 1rem 1.25rem;
    margin-bottom: 0.75rem; font-size: 13px; line-height: 1.6;
  }
  .sa-ref-id {
    font-size: 11px; font-weight: 500; color: #0f6e56;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;
  }
  .sa-ref-cite { color: #5a564f; font-style: italic; margin-bottom: 0.35rem; }
  .sa-ref-content { color: #1a1814; }
  .sa-login-wrap {
    max-width: 380px; margin: 0 auto;
    background: #fff; border: 1px solid #e8e4dd; border-radius: 12px;
    padding: 2rem;
  }
  .sa-login-wrap h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 20px; margin-bottom: 1.25rem; text-align: center;
  }
  .sa-field { margin-bottom: 1rem; }
  .sa-label { display: block; font-size: 13px; font-weight: 500; color: #5a564f; margin-bottom: 4px; }
  .sa-input {
    width: 100%; border: 1px solid #d4cfc6; border-radius: 7px;
    padding: 9px 12px; font-size: 15px; font-family: 'DM Sans', sans-serif;
    background: #faf9f7; color: #1a1814; box-sizing: border-box;
    outline: none; transition: border 0.15s;
  }
  .sa-input:focus { border-color: #0f6e56; box-shadow: 0 0 0 3px rgba(15,110,86,0.1); }
  .sa-btn {
    width: 100%; background: #0f6e56; color: #fff;
    border: none; border-radius: 7px; padding: 11px;
    font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: opacity 0.15s; margin-top: 0.5rem;
  }
  .sa-btn:hover { opacity: 0.88; }
  .sa-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .sa-error { color: #a32d2d; font-size: 13px; margin-bottom: 0.75rem; }
  .sa-footer {
    text-align: center; padding: 3rem 0 2.5rem;
    font-size: 13px; color: #9a958c;
    border-top: 1px solid #e8e4dd; margin-top: 1rem;
  }
  .sa-footer a { color: #5a564f; }
`

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
    setLoading(false)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="sa-root">

        <nav className="sa-nav">
          <a className="sa-nav-logo" href="/">
            <img src="/plai-logo.jpg" alt="PLAI" style={{ height: 32, width: 'auto', verticalAlign: 'middle' }} />
            SocraActif · PLAI
          </a>
        </nav>

        <div className="sa-banner">
          Pour toute question ou accompagnement — à distance ou en présentiel — contacter le <strong>référent numérique du PLAI</strong> : <a href="mailto:jeanfrancois.beguin@ens.ecl.be">jeanfrancois.beguin@ens.ecl.be</a>
        </div>

        <div className="sa-container">

          <div className="sa-hero">
            <div className="sa-badge">🎓 Outil enseignants · Écoles coopérantes du PLAI</div>
            <h1>SocraActif<br /><em>Remédiation socratique</em></h1>
            <p className="sa-hero-sub">
              L'IA classifie l'erreur de l'élève, l'enseignant fixe le contexte. Le dialogue fait le reste.
            </p>
          </div>

          <div className="sa-section">
            <h2>Ce que SocraActif fait</h2>
            <div className="sa-cards">
              <div className="sa-card">
                <div className="sa-card-title">Classifier l'erreur</div>
                Faute d'inattention, erreur de technique (procédure) ou erreur de technologie (concept) — trois réponses pédagogiques différentes.
              </div>
              <div className="sa-card">
                <div className="sa-card-title">Dialogue socratique</div>
                Une question à la fois, jamais la réponse directe. Étayage explicite ou inductif selon le choix de l'enseignant.
              </div>
              <div className="sa-card">
                <div className="sa-card-title">Split 80/20</div>
                L'IA génère les questions. L'enseignant apporte le point de rupture typique de ses élèves réels — la singularité du terrain.
              </div>
              <div className="sa-card">
                <div className="sa-card-title">Deux modes</div>
                Autonomie (code élève, navigation individuelle) et projection (tableau collectif, enseignant aux commandes).
              </div>
            </div>
          </div>

          <div className="sa-section">
            <h2>Fondements scientifiques</h2>
            <div className="sa-ref">
              <div className="sa-ref-id">RISS · hal-05361521</div>
              <div className="sa-ref-cite">Fouchet-Isambard & Millon Faure (2025). Feedback adaptatif et taxonomie des erreurs en mathématiques.</div>
              <div className="sa-ref-content">Distingue faute, erreur de technique et erreur de technologie — les trois niveaux du moteur de classification de SocraActif.</div>
            </div>
            <div className="sa-ref">
              <div className="sa-ref-id">RISS · hal-04925060</div>
              <div className="sa-ref-cite">Fanton-Bayrou & Lafont (2023). Étayage contingent et guidage dans les situations d'apprentissage.</div>
              <div className="sa-ref-content">L'étayage doit s'adapter à l'état réel de l'apprenant. SocraActif propose deux niveaux : explicite (micro-étape suivante) et inductif (question ouverte).</div>
            </div>
            <div className="sa-ref">
              <div className="sa-ref-id">RISS · dumas-04390536</div>
              <div className="sa-ref-cite">Hofseth (2022). Remédiation comme nouvelle médiation — ancrage dans Brousseau.</div>
              <div className="sa-ref-content">La remédiation n'est pas une répétition à l'identique mais une re-médiation : recréer les conditions d'un obstacle franchissable sans donner la réponse.</div>
            </div>
          </div>

          <div className="sa-section">
            <div className="sa-login-wrap">
              <h2>Connexion enseignant</h2>
              <form onSubmit={handleSubmit}>
                <div className="sa-field">
                  <label className="sa-label" htmlFor="email">Email</label>
                  <input id="email" className="sa-input" type="email" value={email}
                    onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="sa-field">
                  <label className="sa-label" htmlFor="password">Mot de passe</label>
                  <input id="password" className="sa-input" type="password" value={password}
                    onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                {error && <p className="sa-error">{error}</p>}
                <button type="submit" className="sa-btn" disabled={loading}>
                  {loading ? 'Connexion…' : 'Se connecter'}
                </button>
              </form>
            </div>
          </div>

          <div className="sa-footer">
            <img src="/plai-logo.jpg" alt="PLAI" style={{ height: 40, width: 'auto', display: 'block', margin: '0 auto 8px' }} />
            <strong>SocraActif — Écoles coopérantes du PLAI</strong><br />
            Pôle Liégeois d'Accompagnement vers une École Inclusive · <a href="https://portail-plai.vercel.app">Portail PLAI</a>
          </div>

        </div>
      </div>
    </>
  )
}
