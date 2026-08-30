import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/register', label: 'Become a Provider' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAdmin, isProvider, isUser } = useAuth()
  const navigate = useNavigate()

  const getDashboardPath = () => {
    if (isAdmin()) return '/admin/dashboard'
    if (isProvider()) return '/provider/dashboard'
    if (isUser()) return '/user/dashboard'
    return '/'
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-white">
          Local Guardian
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? 'text-primary-500' : 'text-gray-300 hover:text-white'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to={getDashboardPath()} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                <UserCircle className="h-4 w-4" />
                {user.name || 'Dashboard'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 transition hover:text-white">Login</Link>
              <Link to="/register" className="rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 p-2 text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-primary-500' : 'text-gray-300'}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user ? (
              <>
                <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)} className="text-sm text-gray-200">
                  Dashboard
                </Link>
                <button type="button" onClick={handleLogout} className="text-left text-sm text-gray-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-gray-200">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm text-gray-200">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
