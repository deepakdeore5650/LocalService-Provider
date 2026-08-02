import { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { CalendarDays, MapPin, ClipboardList, User, FileText } from 'lucide-react'

export default function UserDashboard() {
  const [bookings, setBookings] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    api.get('/api/bookings', { params: { userId: user.id } })
      .then(r => {
        setBookings(Array.isArray(r.data) ? r.data : (r.data.value || []))
      })
      .catch(e => {
      })
  }, [user])

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => reject(false)
      document.body.appendChild(script)
    })
  }

  const payBooking = async (b) => {
    try {
      const ok = await loadRazorpayScript()
      if (!ok) { alert('Failed to load payment SDK'); return }
      // get order info from backend
      const r = await api.get(`/api/bookings/${b.id}/order`)
      const info = r.data
      if (!info || !info.orderId) { alert('Payment not available for this booking'); return }

      const options = {
        key: info.keyId || process.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round((info.amount || b.providerAmount || 0) * 100),
        currency: info.currency || 'INR',
        name: 'Local Guardian',
        description: `Payment for booking ${b.id}`,
        order_id: info.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post(`/api/bookings/${b.id}/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
            alert('Payment successful')
            const updated = await api.get('/api/bookings', { params: { userId: user.id } })
            setBookings(Array.isArray(updated.data) ? updated.data : (updated.data.value || []))
          } catch (e) {
            alert('Payment verification failed')
          }
        }
      }

      const rz = new window.Razorpay(options)
      rz.open()
    } catch (e) {
      alert('Payment initialization failed')
    }
  }
  if (!user) {
    return (
      <div className="app-bg flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <h2 className="font-display text-3xl font-bold text-white">My Bookings</h2>
        <p className="mt-4 text-lg text-gray-400">
          You must be logged in to see your bookings.{' '}
          <a href="/login" className="font-medium text-primary-500 hover:text-primary-400">Login</a>
        </p>
      </div>
    )
  }

  const statusBadge = (status) => {
    if (status === 'COMPLETED') return 'bg-emerald-400/10 text-emerald-300'
    if (status === 'PENDING') return 'bg-accent-500/10 text-accent-400'
    return 'bg-primary-500/10 text-primary-400'
  }

  return (
    <div className="app-bg min-h-[calc(100vh-4rem)] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-3xl font-bold text-white">My Bookings</h2>

        {bookings.length === 0 ? (
          <div className="glass mt-8 rounded-2xl py-12 text-center text-gray-400">
            <ClipboardList className="mx-auto mb-3 text-gray-500" size={40} />
            <p className="text-lg">You have no bookings yet.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {bookings.map(b => (
              <div
                key={b.id}
                className="glass rounded-2xl p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="font-display text-lg font-semibold text-white">
                    {b.service?.serviceName}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadge(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                {b.status === 'AWAITING_PAYMENT' && (b.providerAmount || b.providerAmount === 0) && (
                  <button
                    onClick={() => payBooking(b)}
                    className="btn-accent btn-ripple mb-4 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-ink-900 transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Pay &#8377;{b.providerAmount}
                  </button>
                )}

                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-primary-500" />
                    <span>Provider: {b.service?.provider?.name ?? '—'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-primary-500" />
                    <span>{new Date(b.date).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary-500" />
                    <span>{b.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary-500" />
                    <span>Description: {b.service?.description ?? '—'}</span>
                  </div>

                  {b.providerNote && (
                    <div className="mt-2 rounded-xl border-l-4 border-primary-500 bg-primary-500/10 p-3">
                      <p className="text-sm text-gray-200">
                        <strong className="text-white">Provider note:</strong> {b.providerNote}
                      </p>
                    </div>
                  )}
                  {b.userNote && (
                    <div className="mt-2 rounded-xl border-l-4 border-white/20 bg-white/5 p-3">
                      <p className="text-sm text-gray-200">
                        <strong className="text-white">Your note:</strong> {b.userNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
