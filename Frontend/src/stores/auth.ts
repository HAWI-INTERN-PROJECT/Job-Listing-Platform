import { create } from 'zustand'
import type { User, UserRole, LoginRequest, RegisterRequest, AuthResponse } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<User>
  register: (data: RegisterRequest) => Promise<User>
  logout: () => Promise<void>
  getProfile: () => Promise<User | null>
  initialize: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isInitialized: false,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (data: LoginRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/login', data)
      const resData = response.data
      const authData: AuthResponse = resData.data ?? resData
      const { user, access_token } = authData

      localStorage.setItem('token', access_token)
      set({ user, token: access_token, isAuthenticated: true, isLoading: false, isInitialized: true })
      return user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/register', data)
      const resData = response.data
      const authData: AuthResponse = resData.data ?? resData
      const { user, access_token } = authData

      localStorage.setItem('token', access_token)
      set({ user, token: access_token, isAuthenticated: true, isLoading: false, isInitialized: true })
      return user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
    }
  },

  getProfile: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/profile')
      const resData = response.data
      const userData: User = resData.data ?? resData
      set({ user: userData, isLoading: false })
      return userData
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isInitialized: true, isAuthenticated: false, user: null })
      return
    }

    try {
      const response = await api.get('/profile')
      const resData = response.data
      const userData: User = resData.data ?? resData
      set({ user: userData, isAuthenticated: true, isInitialized: true })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
    }
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const user = get().user
    if (!user || !user.role) return false
    const allowed = Array.isArray(roles) ? roles : [roles]
    return allowed.includes(user.role)
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
  },
}))
