import { useState } from 'react'
import api from '../api/api'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '../context/AuthContext'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react'
import Reveal from '../components/home/Reveal'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { normalizeAndLogin } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('/api/users/login', { email, password })
      toast.success('Logged in successfully!')
      normalizeAndLogin(res.data)

      const role = (res.data.role || '').toUpperCase()
      if (role === 'ADMIN') navigate('/admin/dashboard')
      else if (role === 'PROVIDER') navigate('/provider/dashboard')
      else navigate('/user/dashboard')
    } catch (err) {
      toast.error(err.response?.data || 'Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-bg relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-500/25 blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl animate-blob [animation-delay:3s]" />
      </div>

      <Reveal scale className="glass-strong relative w-full max-w-md rounded-2xl p-8 shadow-glow">
        <div className="btn-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
          <LogIn className="h-5 w-5 text-white" />
        </div>
        <h2 className="mt-5 text-center font-display text-2xl font-bold text-white">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Login to continue to <span className="font-semibold text-primary-500">Local Guardian</span>
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-glass w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-glass w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&rsquo;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-400">
            Register
          </Link>
        </p>
      </Reveal>
    </div>
  )
}
