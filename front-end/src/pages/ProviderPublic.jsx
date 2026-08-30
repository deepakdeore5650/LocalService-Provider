import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { toast } from 'react-toastify'
import BookingForm from '../components/BookingForm'
import { Star, IndianRupee } from 'lucide-react'

// Small reusable star rating display (read-only)
function StarRow({ value, size = 'h-4 w-4' }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(value || 0) ? 'fill-accent-400 text-accent-400' : 'text-gray-600'}`} />
      ))}
    </div>
  )
}

export default function ProviderPublic() {
  const { id } = useParams()
  const { user } = useAuth()

  const [provider, setProvider] = useState(null)
  const [providerLoading, setProviderLoading] = useState(true)
  const [providerError, setProviderError] = useState(null)
  const [services, setServices] = useState([])

  const [rating, setRating] = useState({ average: 0, count: 0 })
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState(null)

  // The logged-in user's existing review for this provider (if any).
  // undefined = not checked yet, null = checked and none found, object = found.
  const [myReview, setMyReview] = useState(undefined)

  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const isCustomer = !!user && user.role !== 'PROVIDER'

  const loadReviewData = useCallback(async () => {
    setReviewsLoading(true)
    setReviewsError(null)
    try {
      const [ratingRes, reviewsRes] = await Promise.all([
        api.get(`/api/providers/${id}/rating`),
        api.get(`/api/providers/${id}/reviews`)
      ])
      setRating(ratingRes.data || { average: 0, count: 0 })
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : [])
    } catch {
      setReviewsError('Failed to load reviews. Please try again.')
    } finally {
      setReviewsLoading(false)
    }
  }, [id])

  const loadMyReview = useCallback(async () => {
    if (!isCustomer) { setMyReview(null); return }
    try {
      const res = await api.get(`/api/providers/${id}/reviews/me`, { params: { userId: user.id } })
      setMyReview(res.data && res.data.reviewed ? res.data : null)
    } catch {
      // If the check fails, fall back to allowing the form; the backend still enforces
      // the one-review-per-user rule on submit.
      setMyReview(null)
    }
  }, [id, isCustomer, user])

  useEffect(() => {
    if (!id) {
      setProvider(null)
      setProviderLoading(false)
      setProviderError('Provider not found')
      return
    }

    let isMounted = true

    setProviderLoading(true)
    setProviderError(null)

    api.get(`/api/users/${id}`)
      .then(r => {
        if (!isMounted) return
        const nextProvider = r?.data || null
        setProvider(nextProvider)
        setProviderError(nextProvider ? null : 'Provider not found')
      })
      .catch(err => {
        if (!isMounted) return
        setProvider(null)
        if (err?.response?.status === 404) {
          setProviderError('Provider not found')
        } else {
          setProviderError('Failed to load provider details')
        }
      })
      .finally(() => {
        if (isMounted) setProviderLoading(false)
      })

    api.get('/api/services', { params: { providerId: id } })
      .then(r => {
        if (!isMounted) return
        setServices(Array.isArray(r.data) ? r.data : [])
      })
      .catch(() => {
        if (!isMounted) return
        setServices([])
      })

    loadReviewData()

    return () => {
      isMounted = false
    }
  }, [id, loadReviewData])

  useEffect(() => {
    loadMyReview()
  }, [loadMyReview])

  const submitReview = async () => {
    if (!user || !user.id) return toast.error('Please login to submit a review')
    try {
      const url = `/api/providers/${id}/reviews`
      const payload = { userId: user.id, rating: newRating, comment: newComment }
      const res = await api.post(url, payload)
      toast.success('Review submitted')
      setNewComment('')
      setNewRating(5)
      // Reflect the new review immediately so the form is replaced by the status message,
      // then refresh the aggregate rating and review list from the server.
      setMyReview({ ...res.data, reviewed: true })
      loadReviewData()
    } catch (e) {
      const status = e.response?.status
      const serverMsg = e.response?.data?.error || e.response?.data || e.message
      if (status) toast.error(`Review failed (${status}): ${String(serverMsg)}`)
      else toast.error(String(serverMsg || 'Failed to submit review'))
      // In case a duplicate slipped through (e.g. two tabs), re-sync the "already reviewed" state.
      if (status === 400) loadMyReview()
    }
  }

  if (providerLoading) {
    return (
      <div className="app-bg min-h-[calc(100vh-4rem)] p-8 text-center text-gray-400">
        Loading provider details...
      </div>
    )
  }

  if (providerError) {
    return <div className="app-bg min-h-[calc(100vh-4rem)] p-8 text-center text-gray-400">{providerError}</div>
  }

  if (!provider) {
    return <div className="app-bg min-h-[calc(100vh-4rem)] p-8 text-center text-gray-400">Provider not found</div>
  }

  return (
    <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="glass-strong mx-auto max-w-4xl rounded-2xl p-6 shadow-glow md:p-8">
        {/* ---------------- Existing booking section (unchanged) ---------------- */}
        <h2 className="font-display text-2xl font-bold text-white">{provider.name}</h2>
        <div className="mt-1 text-sm text-gray-400">{provider.email} &bull; {provider.pincode}</div>
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-300">
          Average Rating: {rating.average ?? 0} ({rating.count ?? 0} reviews)
          <StarRow value={rating.average} />
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
                {isCustomer ? (
                  <BookingForm service={s} onBooked={() => toast.success('Booked successfully')} />
                ) : (
                  <div className="mt-2 text-sm text-gray-500">Login as a user to book this service.</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- Rate & Review Provider ---------------- */}
        <h3 className="mt-8 font-display text-lg font-semibold text-white">Rate &amp; Review Provider</h3>

        {!user ? (
          <div className="glass mt-3 rounded-2xl p-4 text-sm text-gray-400">
            Please <a href="/login" className="font-medium text-primary-500 hover:text-primary-400">login</a> to rate and review this provider.
          </div>
        ) : !isCustomer ? (
          <div className="glass mt-3 rounded-2xl p-4 text-sm text-gray-400">
            Only customers can rate and review providers.
          </div>
        ) : myReview === undefined ? (
          <div className="glass mt-3 animate-pulse rounded-2xl p-4" style={{ minHeight: 96 }} />
        ) : myReview ? (
          <div className="glass mt-3 rounded-2xl p-4">
            <div className="text-sm font-medium text-primary-400">You have already reviewed this provider.</div>
            <div className="mt-3 flex items-center gap-2">
              <StarRow value={myReview.rating} />
              <span className="text-sm text-gray-300">{myReview.rating} / 5</span>
            </div>
            {myReview.comment && <div className="mt-2 text-sm text-gray-300">{myReview.comment}</div>}
            {myReview.createdAt && (
              <div className="mt-2 text-xs text-gray-500">{new Date(myReview.createdAt).toLocaleString()}</div>
            )}
          </div>
        ) : (
          <div className="glass mt-3 rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Your Rating:</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" onClick={() => setNewRating(v)} className="px-0.5" aria-label={`Rate ${v} star${v > 1 ? 's' : ''}`}>
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

        {/* ---------------- Provider average rating ---------------- */}
        <div className="glass mt-6 flex items-center gap-4 rounded-2xl p-4">
          {rating.count > 0 ? (
            <>
              <div className="text-center">
                <div className="flex items-center gap-1 font-display text-3xl font-bold text-white">
                  {(rating.average || 0).toFixed(1)} <Star className="h-6 w-6 fill-accent-400 text-accent-400" />
                </div>
              </div>
              <div>
                <StarRow value={rating.average} size="h-4 w-4" />
                <div className="mt-1 text-sm text-gray-400">Based on {rating.count} review{rating.count === 1 ? '' : 's'}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400">No ratings yet</div>
          )}
        </div>

        {/* ---------------- Customer reviews (scrollable) ---------------- */}
        <h3 className="mt-8 font-display text-lg font-semibold text-white">Customer Reviews</h3>

        {reviewsLoading ? (
          <div className="mt-3 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass animate-pulse rounded-2xl" style={{ minHeight: 76 }} />
            ))}
          </div>
        ) : reviewsError ? (
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <span>{reviewsError}</span>
            <button onClick={loadReviewData} className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-medium text-gray-200">Retry</button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-3 text-gray-400">No reviews yet.</div>
        ) : (
          <div className="mt-3 max-h-96 space-y-3 overflow-y-auto pr-1">
            {reviews.map(r => (
              <div key={r.id} className="glass rounded-2xl p-4">
                <div className="mb-1 flex items-center justify-between">
                  <div className="font-medium text-white">{r.user?.name || 'Anonymous'}</div>
                  <div className="flex items-center gap-1 text-sm text-accent-400">
                    {r.rating} <Star className="h-3.5 w-3.5 fill-accent-400" />
                  </div>
                </div>
                {r.comment && <div className="mb-1 text-sm text-gray-300">{r.comment}</div>}
                <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
