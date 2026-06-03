import axios from 'axios'

export const TOKEN_KEY = 'certaintyai_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
    'X-Tunnel-Skip-AntiPhishing-Threshold': 'true',
    'X-Tunnel-Skip-AntiPhishing-Page': 'true'
  },
})

// Attach Bearer token from localStorage to every outgoing request.
api.interceptors.request.use((config) => {
  config.headers['X-Tunnel-Skip-AntiPhishing-Threshold'] = 'true'
  config.headers['X-Tunnel-Skip-AntiPhishing-Page'] = 'true'
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear the token and bounce to /login — but only if the failing
// request wasn't itself an auth attempt (otherwise wrong-password attempts
// would force a redirect loop) and we're not already on an auth page.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/signup')
    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem(TOKEN_KEY)
      const onAuthPage = ['/login', '/signup'].includes(window.location.pathname)
      if (!onAuthPage) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
