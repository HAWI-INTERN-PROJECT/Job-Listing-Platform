import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditProfilePage from './EditProfilePage'

describe('EditProfilePage', () => {
  it('renders the page title', () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  it('renders personal information fields', () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText(/Full Name/)).toBeInTheDocument()
    expect(screen.getByText(/Email Address/)).toBeInTheDocument()
  })

  it('renders skills section', () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders save and cancel buttons', () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })
})