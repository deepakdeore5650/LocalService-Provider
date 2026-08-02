// Services.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import BookingForm from '../components/BookingForm'
import Reveal from '../components/home/Reveal'
import { Search, MapPin, Loader2, IndianRupee } from 'lucide-react'

export default function Services() {
  const [services, setServices] = useState([])
  const [q, setQ] = useState('')
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/services', {
        params: { q: q || undefined, pincode: pincode || undefined }
      })
      const items = Array.isArray(res.data) ? res.data : (res.data.value || [])
      setServices(items)
    } catch (err) {
      setError(err.message || 'Failed to load services')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [q, pincode])

  return (
    <div className="app-bg relative min-h-[calc(100vh-4rem)] py-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl animate-blob" />
      </div>

      <div className="container relative mx-auto px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500">Browse</span>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Find a service near you</h1>
          <p className="mt-3 text-gray-400">Search by service type or pincode to see verified providers.</p>
        </Reveal>

        <Reveal delay={80} className="glass mx-auto mt-8 flex max-w-3xl flex-col items-stretch gap-3 rounded-2xl p-4 shadow-card sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search service type"
              className="input-glass w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
          <div className="relative sm:w-44">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              placeholder="Pincode"
              className="input-glass w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
          <button
            onClick={fetchServices}
            className="btn-primary btn-ripple flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </Reveal>

        {loading && (
          <div className="mt-10 flex justify-center text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {error && <div className="mt-6 text-center text-red-400">Error: {error}</div>}
        {!loading && !error && services.length === 0 && (
          <div className="glass mx-auto mt-10 max-w-lg rounded-2xl p-8 text-center text-gray-400">
            No active providers found for the selected criteria.
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 60}>
              <div className="glass group h-full rounded-2xl p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
                <h3 className="font-display text-lg font-semibold text-white">{s.serviceName}</h3>
                <p className="mt-1 text-sm text-gray-400">{s.description}</p>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-accent-400">
                  <IndianRupee className="h-3.5 w-3.5" /> {s.pricingPerHour ?? '—'}/hr
                </div>
                {s.provider && (
                  <div className="mt-2 text-sm text-gray-400">
                    Provider:{' '}
                    <Link to={`/providers/${s.provider.id}`} className="font-medium text-primary-500 hover:text-primary-400">
                      {s.provider.name}
                    </Link>{' '}
                    &mdash; {s.provider.pincode ?? 'pincode N/A'}
                  </div>
                )}
                <BookingForm service={s} onBooked={() => {}} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}
