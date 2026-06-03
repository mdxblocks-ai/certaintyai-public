import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

const TIER_BADGE = {
  'Low / Foundational':    'border-rose-700 text-rose-300 bg-rose-950/30',
  'Moderate / Developing': 'border-amber-700 text-amber-300 bg-amber-950/30',
  'High / Ready':          'border-cyan-700 text-cyan-300 bg-cyan-950/30',
  'Advanced / Scalable':   'border-emerald-700 text-emerald-300 bg-emerald-950/30',
}

function AssessmentCard({ a }) {
  const tierBadge = TIER_BADGE[a.maturity_tier] || 'border-slate-700 text-slate-300 bg-slate-900/30'
  const score = typeof a.total_score === 'number' ? Math.round(a.total_score) : '—'
  const created = a.created_at ? new Date(a.created_at).toLocaleString() : ''
  const domains = (a.domains || []).join(' · ') || 'No industry tagged'
  const company = a.company_name || 'Untitled assessment'

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {a.maturity_tier && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${tierBadge}`}>
              {a.maturity_tier}
            </span>
          )}
          <span className="text-sm text-slate-200 font-medium">{company}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{domains} · {created}</p>
        <div className="mt-2 text-xs text-slate-400">
          Readiness score <span className="text-slate-100 font-mono">{score}</span>
          <span className="text-slate-600">/100</span>
        </div>
      </div>
      <div className="shrink-0">
        {a.has_report && a.anon_token ? (
          <Link
            to={`/report/${a.anon_token}`}
            className="inline-block px-3 py-1.5 rounded-lg text-sm bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition"
          >
            View report
          </Link>
        ) : (
          <span className="text-xs text-slate-500">Report not generated</span>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, changePassword } = useAuth()
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')

  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState('')

  useEffect(() => {
    let cancelled = false
    api.get('/report')
      .then((res) => { if (!cancelled) setReports(res.data || []) })
      .catch(() => { if (!cancelled) setReportsError("Couldn't load your assessments.") })
      .finally(() => { if (!cancelled) setReportsLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function onSubmit(values) {
    setServerError('')
    setSuccess('')
    try {
      await changePassword(values.current_password, values.new_password)
      setSuccess('Password updated.')
      reset()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') setServerError(detail)
      else if (Array.isArray(detail) && detail[0]?.msg) {
        setServerError(detail.map((d) => d.msg).join(' • '))
      } else setServerError('Could not change password.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-1">Your profile</h1>
        <p className="text-sm text-slate-400">Account details, assessments, and security.</p>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Account</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><dt className="text-slate-500">Email</dt><dd className="text-slate-200">{user?.email}</dd></div>
          <div><dt className="text-slate-500">Full name</dt><dd className="text-slate-200">{user?.full_name || <span className="text-slate-500 italic">not set</span>}</dd></div>
          <div><dt className="text-slate-500">Role</dt><dd className="text-slate-200">{user?.role}</dd></div>
          <div><dt className="text-slate-500">Joined</dt><dd className="text-slate-200">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</dd></div>
        </dl>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Your assessments</h2>
          <Link to="/survey" className="text-sm text-cyan-400 hover:text-cyan-300 transition">
            + New assessment
          </Link>
        </div>
        {reportsLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {!reportsLoading && reportsError && <p className="text-sm text-rose-400">{reportsError}</p>}
        {!reportsLoading && !reportsError && reports.length === 0 && (
          <div className="text-sm text-slate-500 border border-dashed border-slate-800 rounded-xl p-6 text-center">
            No assessments yet.{' '}
            <Link to="/survey" className="text-cyan-400 hover:underline">Take the 2-minute assessment</Link>{' '}
            to generate your first report.
          </div>
        )}
        {!reportsLoading && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((a) => <AssessmentCard key={a.id} a={a} />)}
          </div>
        )}
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Change password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label htmlFor="current_password" className="text-sm text-slate-300">Current password</label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              {...register('current_password', { required: 'Current password is required' })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none transition"
            />
            {errors.current_password && <p className="text-xs text-rose-400">{errors.current_password.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="new_password" className="text-sm text-slate-300">New password</label>
            <input
              id="new_password"
              type="password"
              autoComplete="new-password"
              {...register('new_password', {
                required: 'New password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none transition"
            />
            {errors.new_password && <p className="text-xs text-rose-400">{errors.new_password.message}</p>}
          </div>
          {serverError && (
            <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-md px-3 py-2">{serverError}</p>
          )}
          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-md px-3 py-2">{success}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>
    </div>
  )
}
