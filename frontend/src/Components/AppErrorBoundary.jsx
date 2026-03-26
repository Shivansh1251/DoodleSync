import { Component } from 'react'
import { Navigate } from 'react-router-dom'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Something went wrong while rendering this page.',
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Navigate
          to="/error"
          replace
          state={{ message: this.state.errorMessage, code: 500 }}
        />
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary