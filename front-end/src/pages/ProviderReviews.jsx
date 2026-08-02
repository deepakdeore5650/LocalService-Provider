// ProviderReviews.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { Star } from 'lucide-react'

export default function ProviderReviews() {
  const { user } = useAuth()
  const [rating, setRating] = useState({ average: 0, count: 0 })
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    if (!user || !user.id) return
    let mounted = true
    const id = user.id
    setLoading(true)
    setError(null)

    Promise.all([
      api.get(`/api/providers/${id}/rating`).then(r => r.data).catch(() => ({ average: 0, count: 0 })),
      api.get(`/api/providers/${id}/reviews`).then(r => Array.isArray(r.data) ? r.data : []).catch(() => [])
    ]).then(([rt, rv]) => {
      if (!mounted) return
      setRating(rt)
      setReviews(rv)
    }).catch(() => {
      if (!mounted) return
      setError('Failed to load reviews')
    }).finally(() => mounted && setLoading(false))

    return () => mounted = false
  }, [user])

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sort === 'highest') return b.rating - a.rating
    if (sort === 'lowest') return a.rating - b.rating
    return 0
  })

  if (!user) return <div className="app-bg min-h-[calc(100vh-4rem)] p-8 text-center text-gray-400">Please login to view your reviews.</div>
  if (user.role !== 'PROVIDER') return <div className="app-bg min-h-[calc(100vh-4rem)] p-8 text-center text-gray-400">Only providers can view this page.</div>

  return (
    <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="glass-strong mx-auto max-w-3xl rounded-2xl p-6 shadow-glow md:p-8">
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Reviews &amp; Ratings</h2>
            <p className="text-sm text-gray-400">What customers said about your services</p>
          </div>

          <div className="mt-4 flex items-center gap-6 md:mt-0">
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-white">{(rating.average || 0).toFixed(1)}</div>
              <div className="mt-1 flex items-center justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(rating.average) ? 'fill-accent-400 text-accent-400' : 'text-gray-600'}`} />
                ))}
              </div>
              <div className="mt-1 text-sm text-gray-400">{rating.count ?? 0} reviews</div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Sort</label>
              <select value={sort} onChange={e => setSort(e.target.value)} className="input-glass rounded-lg px-2.5 py-1.5 text-sm">
                <option className="bg-ink-800" value="newest">Newest</option>
                <option className="bg-ink-800" value="oldest">Oldest</option>
                <option className="bg-ink-800" value="highest">Highest rating</option>
                <option className="bg-ink-800" value="lowest">Lowest rating</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass animate-pulse rounded-2xl" style={{ minHeight: 80 }} />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="space-y-4">
            {sorted.length === 0 ? (
              <div className="text-gray-400">No reviews yet — encourage customers to share feedback after a job.</div>
            ) : sorted.map(r => (
              <div key={r.id} className="glass flex gap-4 rounded-2xl p-4 shadow-card">
                <div className="flex-shrink-0">
                  <div className="btn-primary flex h-12 w-12 items-center justify-center rounded-full font-medium text-white">
                    {(r.user?.name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-white">{r.user?.name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.createdAt))}</div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-200">{r.rating} <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" /></div>
                  </div>

                  <div className="mt-2 text-gray-300">{r.comment}</div>

                  {r.reply && (
                    <div className="mt-3 rounded-xl border-l-4 border-primary-500 bg-primary-500/10 p-3">
                      <div className="text-xs text-gray-400">Your reply</div>
                      <div className="mt-1 text-sm text-gray-200">{r.reply}</div>
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
