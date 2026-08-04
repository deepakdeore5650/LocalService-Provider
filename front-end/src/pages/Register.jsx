import { useState } from 'react'
import api from '../api/api'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Loader2 } from 'lucide-react'
import Reveal from '../components/home/Reveal'

const inputClass = 'input-glass w-full rounded-xl px-4 py-2.5 text-sm'
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-300'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    address: '',
    district: '',
    phoneNo: '',
    pincode: '',
    serviceType: '',
    serviceName: '',
    serviceDescription: '',
    pricingPerHour: '',
    serviceStatus: 'AVAILABLE',
    state: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    const phoneRe = /^\d{10}$/
    const pinRe = /^\d{6}$/
    if (!form.name) { toast.error('Name is required'); return }
    if (!form.email) { toast.error('Email is required'); return }
    if (!form.password) { toast.error('Password is required'); return }
    if (form.role === 'USER' && !form.address) { toast.error('Address is required for users'); return }
    if (form.phoneNo && !phoneRe.test(form.phoneNo)) { toast.error('Phone number must be 10 digits'); return }
    if (form.pincode && !pinRe.test(form.pincode)) { toast.error('Pincode must be 6 digits'); return }
    if (form.role === 'PROVIDER') {
      if (!form.serviceType && !form.serviceName) { toast.error('Service name or type is required for providers'); return }
      if (!form.state) { toast.error('State is required for providers'); return }
      if (!form.pricingPerHour) { toast.error('Pricing per hour is required for providers'); return }
    }
    setSubmitting(true)
    try {
      const payload = { ...form }
      if (form.role !== 'PROVIDER') {
        delete payload.serviceName
        delete payload.serviceDescription
        delete payload.pricingPerHour
        delete payload.serviceStatus
      }
      const res = await api.post('/api/users/register', payload)
      toast.success('Registered successfully!')
      login(res.data)
      if (res.data.role?.toUpperCase() === 'PROVIDER') navigate('/provider/dashboard')
      else navigate('/user/dashboard')
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-bg relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-600/25 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl animate-blob [animation-delay:3s]" />
      </div>

      <Reveal scale className="glass-strong relative w-full max-w-lg rounded-2xl p-8 shadow-glow">
        <div className="btn-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
          <UserPlus className="h-5 w-5 text-white" />
        </div>
        <h2 className="mt-5 text-center font-display text-2xl font-bold text-white">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-400">Join Local Guardian as a homeowner or a service provider</p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your full name"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              type="email"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              type="password"
              placeholder="Enter password"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className={inputClass}
            >
              <option className="bg-ink-800" value="ADMIN">Admin</option>
              <option className="bg-ink-800" value="USER">User</option>
              <option className="bg-ink-800" value="PROVIDER">Provider</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <input
              placeholder="Address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="District"
              value={form.district}
              onChange={e => setForm({ ...form, district: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Phone No"
              value={form.phoneNo}
              onChange={e => setForm({ ...form, phoneNo: e.target.value })}
              className={inputClass}
              type="tel"
            />
            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={e => setForm({ ...form, pincode: e.target.value })}
              className={inputClass}
            />
            {form.role === 'PROVIDER' && (
              <>
                <input
                  placeholder="Service Name (e.g. Electrician)"
                  value={form.serviceName}
                  onChange={e => setForm({ ...form, serviceName: e.target.value })}
                  className={inputClass}
                  required
                />
                <input
                  placeholder="Service Type (optional)"
                  value={form.serviceType}
                  onChange={e => setForm({ ...form, serviceType: e.target.value })}
                  className={inputClass}
                />
                <input
                  placeholder="Pricing per hour (INR)"
                  value={form.pricingPerHour}
                  onChange={e => setForm({ ...form, pricingPerHour: e.target.value })}
                  className={inputClass}
                  type="number"
                  step="0.01"
                  required
                />
                <select
                  value={form.serviceStatus}
                  onChange={e => setForm({ ...form, serviceStatus: e.target.value })}
                  className={inputClass}
                >
                  <option className="bg-ink-800" value="AVAILABLE">Available</option>
                  <option className="bg-ink-800" value="NOT_AVAILABLE">Not available</option>
                </select>
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className={inputClass}
                  required
                />
                <textarea
                  placeholder="Short service description"
                  value={form.serviceDescription}
                  onChange={e => setForm({ ...form, serviceDescription: e.target.value })}
                  className={`${inputClass} col-span-1 md:col-span-2`}
                  rows={3}
                />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-400">
            Login
          </Link>
        </p>
      </Reveal>
    </div>
  )
}
