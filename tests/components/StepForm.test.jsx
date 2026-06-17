// tests/components/StepForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepForm from '../../src/components/Teacher/StepForm'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
        }))
      }))
    }))
  }
}))

describe('StepForm', () => {
  it('affiche les champs obligatoires', () => {
    render(<StepForm sequenceId="test-id" position={1} onSaved={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/Énoncé/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Résultat attendu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Étapes clés/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Point de rupture/i)).toBeInTheDocument()
  })

  it('bloque la soumission si point de rupture est vide', () => {
    render(<StepForm sequenceId="test-id" position={1} onSaved={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/Point de rupture/i)).toBeRequired()
  })
})
