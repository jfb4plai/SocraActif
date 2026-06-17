// api/socratic-turn.js
import Anthropic from '@anthropic-ai/sdk'

const REQUIRED_FIELDS = ['error_type', 'rupture_point', 'scaffolding_level', 'current_turn', 'max_turns', 'last_student_answer']

function buildSystemPrompt(error_type, scaffolding_level, current_turn, max_turns) {
  const typeGuidance = error_type === 'technique'
    ? 'questions procédurales (ex: "Quelle est la première étape ?", "Que fais-tu avec le dénominateur à ce stade ?")'
    : 'questions conceptuelles (ex: "Que représente le dénominateur ?", "Pourquoi ces fractions ne peuvent-elles pas s\'additionner directement ?")'

  const scaffoldingGuidance = scaffolding_level === 'explicite'
    ? 'Guide vers la prochaine micro-étape — question plus dirigée.'
    : 'Laisse l\'élève chercher — question plus ouverte.'

  const turnGuidance = current_turn >= max_turns
    ? 'C\'est le dernier tour. Ta question peut être plus directive mais ne donne toujours pas la réponse.'
    : `Tour ${current_turn}/${max_turns}.`

  return `Tu es un enseignant qui pratique la maïeutique socratique en mathématiques.
Règles absolues :
- Ne jamais donner la réponse ni l'étape suivante directement
- Poser UNE seule question courte par tour (max 20 mots)
- Utiliser des ${typeGuidance}
- ${scaffoldingGuidance}
- ${turnGuidance}

Réponds uniquement avec la question, sans introduction ni ponctuation finale superflue.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { error_type, rupture_point, scaffolding_level, current_turn,
          max_turns, conversation_history, last_student_answer } = body

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null) {
      res.status(400).json({ error: `Champ manquant : ${field}` })
      return
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const messages = [
    ...(conversation_history || []).map(turn => ({
      role: turn.role,
      content: turn.content
    })),
    {
      role: 'user',
      content: `Point de rupture : ${rupture_point}\nDernière réponse élève : ${last_student_answer}`
    }
  ]

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: buildSystemPrompt(error_type, scaffolding_level, current_turn, max_turns),
    messages
  })

  res.json({
    question: response.content[0].text,
    turn: current_turn
  })
}
