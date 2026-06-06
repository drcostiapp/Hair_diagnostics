import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MedicalDisclaimer } from '../../components/ui/MedicalDisclaimer'

describe('MedicalDisclaimer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows disclaimer on first visit (no localStorage)', async () => {
    render(<MedicalDisclaimer />)
    // useEffect fires on mount; wait for it
    expect(await screen.findByText('Medical Disclaimer')).toBeInTheDocument()
    expect(screen.getByText('I Understand & Accept')).toBeInTheDocument()
  })

  it('hides disclaimer after acceptance', async () => {
    const user = userEvent.setup()
    render(<MedicalDisclaimer />)

    const button = await screen.findByText('I Understand & Accept')
    await user.click(button)

    expect(screen.queryByText('Medical Disclaimer')).not.toBeInTheDocument()
    expect(localStorage.getItem('dr-costi-disclaimer-accepted')).toBe('true')
  })

  it('does not show disclaimer when previously accepted', () => {
    localStorage.setItem('dr-costi-disclaimer-accepted', 'true')
    render(<MedicalDisclaimer />)

    // Initial render has accepted=true (default), so nothing shows
    expect(screen.queryByText('Medical Disclaimer')).not.toBeInTheDocument()
  })

  it('shows key disclaimer points', async () => {
    render(<MedicalDisclaimer />)

    expect(await screen.findByText(/not a substitute/i)).toBeInTheDocument()
    expect(screen.getByText(/AI assistant, not a live doctor/i)).toBeInTheDocument()
    expect(screen.getByText(/stored securely/i)).toBeInTheDocument()
  })
})
