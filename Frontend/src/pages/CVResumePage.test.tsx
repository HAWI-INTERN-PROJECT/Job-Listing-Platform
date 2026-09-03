import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CVResumePage from './CVResumePage'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { name: 'Lidiya Getachew', email: 'lidiya.getachew@gmail.com' },
    logout: vi.fn(),
  }),
}))

afterEach(() => {
  vi.useRealTimers()
})

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/cv-resume']}>
      <CVResumePage />
    </MemoryRouter>,
  )

describe('CVResumePage', () => {
  it('renders the CV/Resume Management heading and sections', () => {
    renderPage()
    expect(screen.getByText('CV/Resume Management')).toBeTruthy()
    expect(screen.getByText('Active CV/Resume')).toBeTruthy()
    expect(screen.getByText('Upload Status Examples')).toBeTruthy()
    expect(screen.getByText('Drag and drop your CV here')).toBeTruthy()
    expect(screen.getByText('Supported format: PDF (Max 2MB)')).toBeTruthy()
  })

  it('shows the active CV file with actions', () => {
    renderPage()
    expect(screen.getByText('Lidiya_Getachew_CV.pdf')).toBeTruthy()
    expect(screen.getByText('View')).toBeTruthy()
    expect(screen.getByText('Download')).toBeTruthy()
    expect(screen.getByText('Delete')).toBeTruthy()
  })

  it('rejects non-PDF files', () => {
    renderPage()
    const input = screen.getByTestId('cv-input')
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText('Only PDF files are allowed')).toBeTruthy()
  })

  it('rejects PDF files larger than 2MB', () => {
    renderPage()
    const input = screen.getByTestId('cv-input')
    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'big.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(input, { target: { files: [big] } })
    expect(screen.getAllByText('File size exceeds 2MB limit').length).toBe(2)
  })

  it('uploads a valid PDF and shows it as active', () => {
    vi.useFakeTimers()
    renderPage()
    const input = screen.getByTestId('cv-input')
    const pdf = new File([new Uint8Array(100 * 1024)], 'My_CV.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(input, { target: { files: [pdf] } })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('My_CV.pdf')).toBeTruthy()
  })
})