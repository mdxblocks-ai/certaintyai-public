import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })
  const { signup, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const claimToken = searchParams.get('claim')
  const [serverError, setServerError] = useState('')

  async function onSubmit(values) {
    setServerError('')
    try {
      const signedUpUser = await signup({
        email: values.email,
        password: values.password,
        full_name: values.full_name || '',
      })
      if (claimToken) {
        try {
          await api.post(`/auth/claim-report/${claimToken}`)
          await refreshUser()
        } catch { }
        navigate(`/dashboard?tab=readiness&reportToken=${claimToken}`, { replace: true })
      } else {
        if (signedUpUser && !signedUpUser.first_assessment_completed) {
          navigate('/dashboard?tab=readiness', { replace: true })
        } else {
          navigate('/dashboard?tab=home', { replace: true })
        }
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') setServerError(detail)
      else if (Array.isArray(detail) && detail[0]?.msg) {
        setServerError(detail.map((d) => d.msg).join(' • '))
      } else setServerError('Sign-up failed. Please try again.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-slate-400">
            {claimToken
              ? '💾 Save your AI Readiness Report and track changes over time.'
              : 'Two minutes to your first AI Readiness Report.'}
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="full_name" className="text-sm text-slate-300">Full name</label>
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            {...register('full_name')}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none transition"
          />
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
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
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
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-sm text-slate-400 text-center">
          Already have an account?{' '}
          <Link to={`/login${claimToken ? `?claim=${claimToken}` : ''}`} className="text-cyan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
