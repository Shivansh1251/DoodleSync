import { useLocation, useNavigate } from 'react-router-dom'

export default function ErrorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const code = Number(location.state?.code) || 500
  const title = code === 404 ? 'Page not found' : 'Something went wrong'
  const message =
    location.state?.message ||
    'An unexpected error occurred. Please try again or go back to the home page.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-orange-100 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-xl rounded-2xl shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur p-8 text-center">
        <p className="text-sm uppercase tracking-widest font-semibold text-rose-600 dark:text-rose-400">Error {code}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-4 text-gray-700 dark:text-gray-300 break-words">{message}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="px-5 py-2.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors duration-300"
          >
            Go to Home
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}