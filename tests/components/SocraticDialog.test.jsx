// tests/components/SocraticDialog.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SocraticDialog from '../../src/components/Student/SocraticDialog'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null })
    }))
  }
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SocraticDialog', () => {
  const props = {
    errorType: 'technique',
    rupturePoint: 'confond dénominateurs',
    scaffoldingLevel: 'explicite',
    maxTurns: 4,
    attemptId: 'attempt-1',
    onSolved: vi.fn(),
    onMaxTurnsReached: vi.fn()
  }

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ question: 'Quelle est la première étape ?', turn: 1 })
    })
  })

  it('affiche la première question socratique au chargement', async () => {
    render(<SocraticDialog {...props} />)
    await waitFor(() => {
      expect(screen.getByText('Quelle est la première étape ?')).toBeInTheDocument()
    })
  })

  it('affiche un champ de réponse', async () => {
    render(<SocraticDialog {...props} />)
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })
})
