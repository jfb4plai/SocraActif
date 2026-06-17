// tests/api/classify-error.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn()
    }
  }))
}))

import Anthropic from '@anthropic-ai/sdk'

const mockCreate = vi.fn()
Anthropic.mockImplementation(function() { return { messages: { create: mockCreate } } })

async function callHandler(body) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    setHeader: vi.fn()
  }

  process.env.ANTHROPIC_API_KEY = 'test-key'
  const { default: handler } = await import('../../api/classify-error.js?' + Date.now())
  await handler({ method: 'POST', body: JSON.stringify(body) }, res)
  return res
}

describe('classify-error', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({
      content: [{ text: JSON.stringify({
        type: 'technique',
        confidence: 0.9,
        match_hypothesis: true,
        reasoning: 'L élève additionne les dénominateurs'
      }) }]
    })
  })

  it('retourne une classification JSON valide', async () => {
    const res = await callHandler({
      student_answer: '4/8',
      expected_answer: '3/4',
      procedure_steps: 'trouver dénominateur commun → convertir → additionner numérateurs',
      teacher_hypothesis: 'technique',
      distraction_errors: 'oublie de simplifier'
    })

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      type: 'technique',
      confidence: expect.any(Number),
      match_hypothesis: expect.any(Boolean)
    }))
  })

  it('retourne 400 si champs obligatoires manquants', async () => {
    const res = await callHandler({ student_answer: '4/8' })
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
