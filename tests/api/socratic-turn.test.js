// tests/api/socratic-turn.test.js
import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: function() {
    return {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ text: 'Quelle est la première étape pour additionner ces fractions ?' }]
        })
      }
    }
  }
}))

async function callHandler(body) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    setHeader: vi.fn()
  }
  process.env.ANTHROPIC_API_KEY = 'test-key'
  const { default: handler } = await import('../../api/socratic-turn.js?' + Date.now())
  await handler({ method: 'POST', body: JSON.stringify(body) }, res)
  return res
}

describe('socratic-turn', () => {
  it('retourne une question socratique pour une erreur de technique', async () => {
    const res = await callHandler({
      error_type: 'technique',
      rupture_point: 'confond addition des dénominateurs',
      scaffolding_level: 'explicite',
      current_turn: 1,
      max_turns: 4,
      conversation_history: [],
      last_student_answer: '4/8'
    })

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      question: expect.any(String),
      turn: 1
    }))
  })

  it('retourne 400 si error_type manquant', async () => {
    const res = await callHandler({ rupture_point: 'test' })
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
