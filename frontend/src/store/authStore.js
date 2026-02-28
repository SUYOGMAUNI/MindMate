import { create } from 'zustand'
import client from '../api/client'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('mm_token') || null,
  user: null,
  loading: false,
  error: null,

  register: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await client.post('/auth/register', { email, password })
      localStorage.setItem('mm_token', data.access_token)
      set({ token: data.access_token, loading: false })
      return { ok: true }
    } catch (e) {
      const msg = e.response?.data?.detail || 'Registration failed'
      set({ error: msg, loading: false })
      return { ok: false, error: msg }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await client.post('/auth/login', { email, password })
      localStorage.setItem('mm_token', data.access_token)
      set({ token: data.access_token, loading: false })
      return { ok: true }
    } catch (e) {
      const msg = e.response?.data?.detail || 'Invalid credentials'
      set({ error: msg, loading: false })
      return { ok: false, error: msg }
    }
  },

  logout: () => {
    localStorage.removeItem('mm_token')
    set({ token: null, user: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore