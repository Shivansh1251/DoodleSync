import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthService from '../utils/AuthService'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      if (token) {
        try {
          AuthService.setToken(token)
          const user = await AuthService.getCurrentUser()
          AuthService.setUser(user)
          navigate('/')
        } catch (err) {
          setError('Failed to authenticate. Please try again.')
          setTimeout(() => navigate('/login'), 3000)
        }
      } else {
        setError('No authentication token received.')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-600 dark:text-red-400 text-lg">
              {error}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Completing authentication...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
