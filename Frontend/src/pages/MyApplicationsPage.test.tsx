import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import MyApplicationsPage from './MyApplicationsPage'

describe('MyApplicationsPage', () => {
  it('renders the page title and applications', () => {
    render(
      <MemoryRouter>
        <MyApplicationsPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('My Applications')).toBeInTheDocument()
    expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument()
  })
})