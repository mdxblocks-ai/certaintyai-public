import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Landing from './Landing'
import AuthModal from '../components/AuthModal'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const claimToken = searchParams.get('claim')

  useEffect(() => {
    const prev = document.title
    document.title = 'Sign in · CertaintyAI'
    return () => { document.title = prev }
  }, [])

  const handleClose = () => {
    navigate('/', { replace: true })
  }

  return (
    <>
      <Landing />
      <AuthModal
        isOpen
        initialMode="signin"
        claimToken={claimToken}
        onClose={handleClose}
      />
    </>
  )
}
