// api/classify-error.js
import Anthropic from '@anthropic-ai/sdk'

const REQUIRED_FIELDS = ['student_answer', 'expected_answer', 'procedure_steps', 'teacher_hypothesis']

const SYSTEM_PROMPT = `Tu es un didacticien des mathématiques. Tu analyses la réponse d'un élève
pour classifier l'erreur selon quatre catégories exclusives.
Catégories :
- "faute" : écart ponctuel, non reproductible, l'élève connaît la procédure (inattention, calcul mental, recopie)
- "technique" : procédure mal appliquée de façon systématique (mauvais ordre des étapes, étape manquante ou erronée)
- "technologie" : concept sous-jacent incompris (l'élève ne sait pas POURQUOI la technique fonctionne)
- "correct" : réponse juste

Réponds UNIQUEMENT en JSON valide, sans texte autour :
{"type":"faute|technique|technologie|correct","confidence":0.0-1.0,"match_hypothesis":true|false,"reasoning":"une phrase max"}`

const HINT_SYSTEM_PROMPT = `Tu es un enseignant de mathématiques. À partir des étapes clés d'une procédure,
génère un hint explicite court (2-3 phrases) qui guide l'élève sans donner la réponse finale.
Réponds uniquement avec le texte du hint, sans introduction ni conclusion.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { student_answer, expected_answer, procedure_steps, teacher_hypothesis,
          distraction_errors, hint_mode } = body

  for (const field of REQUIRED_FIELDS) {
    if (!body[field]) {
      res.status(400).json({ error: `Champ manquant : ${field}` })
      return
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  if (hint_mode) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: HINT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Étapes clés : ${procedure_steps}` }]
    })
    res.json({ hint: response.content[0].text })
    return
  }

  const userMessage = `Résultat attendu : ${expected_answer}
Étapes clés : ${procedure_steps}
Réponse élève : ${student_answer}
Hypothèse enseignant : ${teacher_hypothesis}
Erreurs de distraction connues : ${distraction_errors || 'aucune précisée'}`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  })

  const result = JSON.parse(response.content[0].text)
  res.json(result)
}
