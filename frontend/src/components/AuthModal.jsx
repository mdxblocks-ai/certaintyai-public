import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const { login, signup, changePassword, user } = useAuth()
  const [mode, setMode] = useState(initialMode) // 'signin' | 'signup' | 'forgot' | 'sent' | 'changepass' | 'changed'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Form states
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
      await login(email, password)
      onClose()
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
      await signup({ email, password, full_name: fullName })
      onClose()
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
    // Simulate forgot password action
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14161A]/60 backdrop-blur-sm p-4">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] bg-[#FBF8F0] border border-[#14161A]/14 rounded-2xl p-8 shadow-2xl relative text-[#14161A] font-sans-brand"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#73706A] hover:text-[#14161A] transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#14161A]">Sign in to CertaintyAI</h3>
              <p className="text-xs text-[#73706A] mt-1">Review saved reports and manage your settings.</p>
            </div>
            {error && (
              <div className="text-xs text-[#7C5723] bg-[#ECE5D6] border border-[#A87C3C]/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">Work email *</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A]">Password *</label>
                  <button 
                    type="button" 
                    onClick={() => resetForm('forgot')}
                    className="text-xs text-[#A87C3C] hover:text-[#7C5723] font-semibold"
                  >
                    Forgot?
                  </button>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] font-semibold hover:bg-[#7C5723] hover:text-white transition disabled:opacity-50 text-sm mt-2 shadow"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <div className="text-center text-xs text-[#73706A] pt-2 border-t border-[#14161A]/6">
              Need an account?{' '}
              <button 
                type="button" 
                onClick={() => resetForm('signup')}
                className="text-[#A87C3C] hover:text-[#7C5723] font-bold"
              >
                Create one now
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#14161A]">Create your account</h3>
              <p className="text-xs text-[#73706A] mt-1">Get board-ready AI readiness reports in minutes.</p>
            </div>
            {error && (
              <div className="text-xs text-[#7C5723] bg-[#ECE5D6] border border-[#A87C3C]/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">Full name *</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Okafor" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">Work email *</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">Password *</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">Confirm password *</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] font-semibold hover:bg-[#7C5723] hover:text-white transition disabled:opacity-50 text-sm mt-2 shadow"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <div className="text-center text-xs text-[#73706A] pt-2 border-t border-[#14161A]/6">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => resetForm('signin')}
                className="text-[#A87C3C] hover:text-[#7C5723] font-bold"
              >
                Sign in instead
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#14161A]">Reset your password</h3>
              <p className="text-xs text-[#73706A] mt-1">Enter your email and we'll send you a password reset link.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">Work email *</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-3 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] font-semibold hover:bg-[#7C5723] hover:text-white transition text-sm mt-2 shadow"
            >
              Send reset link
            </button>
            <div className="text-center text-xs text-[#73706A] pt-2">
              <button 
                type="button" 
                onClick={() => resetForm('signin')}
                className="text-[#A87C3C] hover:text-[#7C5723] font-bold"
              >
                ← Back to sign in
              </button>
            </div>
          </form>
        )}

        {mode === 'sent' && (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#1E3A36]/10 text-[#2F7D6B] flex items-center justify-center border border-[#2F7D6B]/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#14161A]">Check your inbox</h3>
              <p className="text-xs text-[#73706A] mt-2 max-w-sm mx-auto leading-relaxed">
                If an account exists for {email}, a password reset link is on its way.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => resetForm('signin')}
              className="w-full py-2.5 px-6 rounded-lg border border-[#14161A]/14 text-[#14161A] font-semibold hover:bg-[#ECE5D6]/30 transition text-sm shadow-sm"
            >
              Back to sign in
            </button>
          </div>
        )}

        {mode === 'changepass' && (
          <form onSubmit={handleChangePw} className="space-y-4">
            <div>
              <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#14161A]">Change password</h3>
              <p className="text-xs text-[#73706A] mt-1">Update the password for {user?.email}.</p>
            </div>
            {error && (
              <div className="text-xs text-[#7C5723] bg-[#ECE5D6] border border-[#A87C3C]/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">Current password *</label>
                <input 
                  type="password" 
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">New password *</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#73706A] block mb-1">Confirm new password *</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password" 
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ECE5D6]/30 border border-[#14161A]/14 focus:border-[#A87C3C] focus:outline-none transition text-sm text-[#14161A]"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] font-semibold hover:bg-[#7C5723] hover:text-white transition disabled:opacity-50 text-sm mt-2 shadow"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        )}

        {mode === 'changed' && (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#1E3A36]/10 text-[#2F7D6B] flex items-center justify-center border border-[#2F7D6B]/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif-brand text-2xl font-semibold tracking-tight text-[#14161A]">Password updated</h3>
              <p className="text-xs text-[#73706A] mt-2">Your password has been changed successfully.</p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] font-semibold hover:bg-[#7C5723] hover:text-white transition text-sm shadow"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
