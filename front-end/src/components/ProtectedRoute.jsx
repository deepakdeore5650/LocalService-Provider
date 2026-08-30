import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute wraps components that require authentication
 * Optionally enforces a specific role
 * 
 * @param {Object} props
 * @param {ReactNode} props.element - Component to render if authorized
 * @param {string} props.requiredRole - 'ADMIN', 'PROVIDER', or 'USER' (optional)
 */
export function ProtectedRoute({ element, requiredRole }) {
  const { user, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="app-bg flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white">Checking authentication...</h2>
          <p className="mt-2 text-gray-400">Please wait</p>
        </div>
      </div>
    )
  }

  // Not authenticated at all - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role if specified
  if (requiredRole && user.role !== requiredRole) {
    // User is authenticated but doesn't have the required role
    // Redirect to appropriate dashboard based on their actual role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (user.role === 'PROVIDER') {
      return <Navigate to="/provider/dashboard" replace />
    } else {
      return <Navigate to="/user/dashboard" replace />
    }
  }

  // Authorized - render the component
  return element
}
