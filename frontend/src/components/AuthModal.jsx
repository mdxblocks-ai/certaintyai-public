import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function AuthModal({ isOpen, onClose, initialMode = 'signin', claimToken = null }) {
  const { login, signup, changePassword, user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState(initialMode)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  if (!isOpen) return null

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loggedInUser = await login(email, password)
      if (claimToken) {
        try {
          await api.post(`/auth/claim-report/${claimToken}`)
          await refreshUser()
        } catch { /* fall through to navigation; report still viewable by token */ }
        onClose()
        navigate(`/dashboard?tab=readiness&reportToken=${claimToken}`, { replace: true })
      } else {
        onClose()
        if (loggedInUser && !loggedInUser.first_assessment_completed) {
          navigate('/dashboard?tab=readiness', { replace: true })
        } else {
          navigate('/dashboard?tab=home', { replace: true })
        }
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const signedUpUser = await signup({ email, password, full_name: fullName })
      if (claimToken) {
        try {
          await api.post(`/auth/claim-report/${claimToken}`)
          await refreshUser()
        } catch { /* fall through to navigation; report still viewable by token */ }
        onClose()
        navigate(`/dashboard?tab=readiness&reportToken=${claimToken}`, { replace: true })
      } else {
        onClose()
        if (signedUpUser && !signedUpUser.first_assessment_completed) {
          navigate('/dashboard?tab=readiness', { replace: true })
        } else {
          navigate('/dashboard?tab=home', { replace: true })
        }
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'An error occurred during account creation.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = (e) => {
    e.preventDefault()
    setError('')
    setMode('sent')
  }

  const handleChangePw = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await changePassword(currentPassword, password)
      setMode('changed')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to update password. Verify current password.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = (newMode) => {
    setMode(newMode)
    setError('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setCurrentPassword('')
  }

  // ----- Shared style tokens for MDxBlocks dark theme -----
  const labelCls = "text-[10px] font-bold uppercase tracking-[0.18em] text-[#D8B679]/85 block mb-1.5"
  const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0E]/70 border border-[#D8B679]/15 focus:border-[#D8B679] focus:bg-[#0A0A0E] focus:outline-none focus:ring-2 focus:ring-[#D8B679]/20 transition text-sm text-[#F4F0E6] placeholder-[#F4F0E6]/30"
  const primaryBtn = "w-full py-3 px-6 rounded-lg bg-gradient-to-br from-[#F0CE8C] via-[#D8B679] to-[#A87C3C] text-[#0A0A0E] font-bold hover:from-[#F4D89A] hover:via-[#E0BD7C] hover:to-[#B8884C] hover:shadow-[0_0_24px_-4px_rgba(216,182,121,0.55)] transition disabled:opacity-50 text-sm mt-2 shadow-[0_4px_18px_-6px_rgba(216,182,121,0.45)]"
  const secondaryBtn = "w-full py-2.5 px-6 rounded-lg border border-[#D8B679]/30 text-[#F4F0E6] font-semibold hover:bg-[#D8B679]/10 hover:border-[#D8B679]/55 transition text-sm shadow-sm"
  const linkCls = "text-[#E0A47C] hover:text-[#F0CE8C] font-bold transition"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0E]/75 backdrop-blur-md p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] bg-[#15161B] border border-[#D8B679]/15 rounded-2xl p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65),0_0_40px_-12px_rgba(216,182,121,0.18)] relative text-[#F4F0E6] font-sans-brand overflow-hidden"
      >
        {/* Subtle gold radial glow */}
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(216,182,121,0.55) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(224,132,67,0.45) 0%, transparent 70%)' }}
        />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 w-7 h-7 inline-flex items-center justify-center rounded-md text-[#F4F0E6]/35 hover:text-[#F4F0E6]/90 hover:bg-[#F4F0E6]/8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D8B679]/40 transition z-10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="relative">
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#F4F0E6]">
                  Sign in to <span className="text-[#D8B679]">CertaintyAI</span>
                </h3>
                <p className="text-xs text-[#F4F0E6]/60 mt-1">Review saved reports and manage your settings.</p>
              </div>
              {error && (
                <div className="text-xs text-[#E0A47C] bg-[#E08443]/12 border border-[#E08443]/35 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Work email *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputCls} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelCls + " mb-0"}>Password *</label>
                    <button type="button" onClick={() => resetForm('forgot')} className="text-xs text-[#E0A47C] hover:text-[#F0CE8C] font-semibold">
                      Forgot?
                    </button>
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <div className="text-center text-xs text-[#F4F0E6]/55 pt-2 border-t border-[#D8B679]/12">
                Need an account?{' '}
                <button type="button" onClick={() => resetForm('signup')} className={linkCls}>
                  Create one now
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#F4F0E6]">
                  Create your <span className="text-[#D8B679]">CertaintyAI</span> account
                </h3>
                <p className="text-xs text-[#F4F0E6]/60 mt-1">Get board-ready AI readiness reports in minutes.</p>
              </div>
              {error && (
                <div className="text-xs text-[#E0A47C] bg-[#E08443]/12 border border-[#E08443]/35 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Full name *</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Okafor" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Work email *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password *</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirm password *</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <div className="text-center text-xs text-[#F4F0E6]/55 pt-2 border-t border-[#D8B679]/12">
                Already have an account?{' '}
                <button type="button" onClick={() => resetForm('signin')} className={linkCls}>
                  Sign in instead
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#F4F0E6]">
                  Reset your password
                </h3>
                <p className="text-xs text-[#F4F0E6]/60 mt-1">Enter your email and we'll send you a password reset link.</p>
              </div>
              <div>
                <label className={labelCls}>Work email *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputCls} />
              </div>
              <button type="submit" className={primaryBtn}>
                Send reset link
              </button>
              <div className="text-center text-xs text-[#F4F0E6]/55 pt-2">
                <button type="button" onClick={() => resetForm('signin')} className={linkCls}>
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}

          {mode === 'sent' && (
            <div className="space-y-6 text-center py-4">
              <div
                className="mx-auto w-14 h-14 rounded-full flex items-center justify-center border"
                style={{
                  background: 'radial-gradient(circle, rgba(216,182,121,0.15) 0%, rgba(47,125,107,0.12) 100%)',
                  borderColor: 'rgba(216,182,121,0.4)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D8B679" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#F4F0E6]">Check your inbox</h3>
                <p className="text-xs text-[#F4F0E6]/65 mt-2 max-w-sm mx-auto leading-relaxed">
                  If an account exists for {email}, a password reset link is on its way.
                </p>
              </div>
              <button type="button" onClick={() => resetForm('signin')} className={secondaryBtn}>
                Back to sign in
              </button>
            </div>
          )}

          {mode === 'changepass' && (
            <form onSubmit={handleChangePw} className="space-y-4">
              <div>
                <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#F4F0E6]">Change password</h3>
                <p className="text-xs text-[#F4F0E6]/60 mt-1">Update the password for {user?.email}.</p>
              </div>
              {error && (
                <div className="text-xs text-[#E0A47C] bg-[#E08443]/12 border border-[#E08443]/35 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Current password *</label>
                  <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>New password *</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirm new password *</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          )}

          {mode === 'changed' && (
            <div className="space-y-6 text-center py-4">
              <div
                className="mx-auto w-14 h-14 rounded-full flex items-center justify-center border"
                style={{
                  background: 'radial-gradient(circle, rgba(216,182,121,0.15) 0%, rgba(47,125,107,0.12) 100%)',
                  borderColor: 'rgba(216,182,121,0.4)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D8B679" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#F4F0E6]">Password updated</h3>
                <p className="text-xs text-[#F4F0E6]/65 mt-2">Your password has been changed successfully.</p>
              </div>
              <button type="button" onClick={onClose} className={primaryBtn}>
                Done
              </button>
            </div>
          )}

          {/* Powered by attribution */}
          <div className="mt-6 pt-4 border-t border-[#D8B679]/8 text-center">
            <span className="text-[9px] uppercase tracking-[0.28em] text-[#F4F0E6]/40">
              Powered by <span className="text-[#D8B679]/85 font-semibold">MDxBlocks Inc.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
