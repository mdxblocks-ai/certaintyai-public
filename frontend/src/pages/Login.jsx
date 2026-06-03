import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const claimToken = searchParams.get('claim')
  const [serverError, setServerError] = useState('')

  async function onSubmit(values) {
    setServerError('')
    try {
      await login(values.email, values.password)
      if (claimToken) {
        try { await api.post(`/auth/claim-report/${claimToken}`) } catch { }
        navigate(`/dashboard?tab=readiness&reportToken=${claimToken}`, { replace: true })
      } else {
        navigate('/dashboard?tab=home', { replace: true })
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      setServerError(typeof detail === 'string' ? detail : 'Login failed. Check your email and password.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-sm text-slate-400">
            {claimToken ? '💾 Sign in to claim and save your AI Readiness Report.' : 'Welcome back. Use your CertaintyAI credentials.'}
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-slate-300">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none transition"
          />
          {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-slate-300">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Password is required' })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none transition"
          />
          {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        {serverError && (
          <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-md px-3 py-2">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-sm text-slate-400 text-center">
          New to CertaintyAI?{' '}
          <Link to={`/signup${claimToken ? `?claim=${claimToken}` : ''}`} className="text-cyan-400 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  )
}
