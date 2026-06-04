import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { TOKEN_KEY } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // `loading` starts true only if there's a token to hydrate; otherwise
  // ProtectedRoute should be free to redirect immediately.
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.data)
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    return me.data
  }, [])

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    return me.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const changePassword = useCallback(async (current, next) => {
    await api.post('/auth/change-password', {
      current_password: current,
      new_password: next,
    })
  }, [])

  const updateUserRole = useCallback(async (newRole) => {
    const { data } = await api.put('/auth/profile/role', { role: newRole })
    setUser(prev => prev ? { ...prev, role: newRole } : null)
    return data
  }, [])

  const refreshUser = useCallback(async () => {
    const me = await api.get('/auth/me')
    setUser(me.data)
    return me.data
  }, [])

  const value = { user, loading, login, signup, logout, changePassword, updateUserRole, refreshUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
