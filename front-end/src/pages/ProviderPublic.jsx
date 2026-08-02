import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { toast } from 'react-toastify'
import BookingForm from '../components/BookingForm'
import { Star, IndianRupee } from 'lucide-react'

export default function ProviderPublic() {
  const { id } = useParams()
  const { user } = useAuth()
  const [provider, setProvider] = useState(null)
  const [services, setServices] = useState([])
  const [rating, setRating] = useState({ average: 0, count: 0 })
  const [reviews, setReviews] = useState([])
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/api/users/${id}`).then(r => setProvider(r.data)).catch(() => setProvider(null))
    api.get('/api/services', { params: { providerId: id } }).then(r => setServices(Array.isArray(r.data) ? r.data : [])).catch(() => setServices([]))
    api.get(`/api/providers/${id}/rating`).then(r => setRating(r.data)).catch(() => setRating({ average: 0, count: 0 }))
    api.get(`/api/providers/${id}/reviews`).then(r => setReviews(Array.isArray(r.data) ? r.data : [])).catch(() => setReviews([]))
  }, [id])

  const submitReview = async () => {
    if (!user || !user.id) return toast.error('Please login to submit a review')
    try {
      const url = `/api/providers/${id}/reviews`
      const payload = { userId: user.id, rating: newRating, comment: newComment }
      await api.post(url, payload)
      toast.success('Review submitted')
      const r1 = await api.get(`/api/providers/${id}/reviews`)
      setReviews(Array.isArray(r1.data) ? r1.data : [])
      const r2 = await api.get(`/api/providers/${id}/rating`)
      setRating(r2.data)
      setNewComment('')
      setNewRating(5)
    } catch (e) {
      const status = e.response?.status
      const serverMsg = e.response?.data?.error || e.response?.data || e.message
      if (status) toast.error(`Review failed (${status}): ${String(serverMsg)}`)
      else toast.error(String(serverMsg || 'Failed to submit review'))
    }
  }

  if (!provider) return <div className="app-bg min-h-[calc(100vh-4rem)] p-8 text-center text-gray-400">Provider not found</div>

  return (
    <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="glass-strong mx-auto max-w-4xl rounded-2xl p-6 shadow-glow md:p-8">
        <h2 className="font-display text-2xl font-bold text-white">{provider.name}</h2>
        <div className="mt-1 text-sm text-gray-400">{provider.email} &bull; {provider.pincode}</div>
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-300">
          Average Rating: {rating.average ?? 0} ({rating.count ?? 0} reviews)
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(rating.average) ? 'fill-accent-400 text-accent-400' : 'text-gray-600'}`} />
            ))}
          </div>
        </div>

        <h3 className="mt-6 font-display text-lg font-semibold text-white">Services</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.length === 0 ? (
            <div className="text-gray-400">No services</div>
          ) : services.map(s => (
            <div key={s.id} className="glass rounded-2xl p-4 shadow-card">
              <div className="font-medium text-white">{s.serviceName}</div>
              <div className="mt-1 text-sm text-gray-400">{s.description}</div>
              <div className="mt-2 flex items-center gap-1 text-sm text-accent-400">
                <IndianRupee className="h-3.5 w-3.5" /> {s.pricingPerHour}/hr
              </div>
              <div className="mt-2">
                {user && user.role !== 'PROVIDER' ? (
                  <BookingForm service={s} onBooked={() => toast.success('Booked successfully')} />
                ) : (
                  <div className="mt-2 text-sm text-gray-500">Login as a user to book this service.</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-8 font-display text-lg font-semibold text-white">Reviews</h3>

        {user && user.role !== 'PROVIDER' && (
          <div className="glass mt-3 rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Your Rating:</label>
              <div className="flex">
                {[5, 4, 3, 2, 1].map(v => (
                  <button key={v} type="button" onClick={() => setNewRating(v)} className="px-0.5">
                    <Star className={`h-5 w-5 ${v <= newRating ? 'fill-accent-400 text-accent-400' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="input-glass w-full rounded-xl px-3.5 py-2.5 text-sm"
              placeholder="Write your review (optional)"
              rows={3}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={async () => {
                  if (submittingReview) return
                  setSubmittingReview(true)
                  try { await submitReview() } finally { setSubmittingReview(false) }
                }}
                disabled={submittingReview}
                className="btn-primary btn-ripple rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              <button onClick={() => { setNewComment(''); setNewRating(5) }} className="btn-secondary rounded-xl px-4 py-2 text-sm font-medium text-gray-200">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {reviews.length === 0 ? (
            <div className="text-gray-400">No reviews yet.</div>
          ) : reviews.map(r => (
            <div key={r.id} className="glass rounded-2xl p-4">
              <div className="mb-1 flex items-center justify-between">
                <div className="font-medium text-white">{r.user?.name}</div>
                <div className="flex items-center gap-1 text-sm text-accent-400">{r.rating} <Star className="h-3.5 w-3.5 fill-accent-400" /></div>
              </div>
              <div className="mb-1 text-sm text-gray-300">{r.comment}</div>
              <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
