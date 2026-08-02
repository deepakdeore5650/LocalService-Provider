import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { toast } from 'react-toastify'
import { Star, Lock, Edit3 } from 'lucide-react'

const inputClass = 'input-glass w-full rounded-xl px-3.5 py-2.5 text-sm mt-1'

export default function ProviderProfile() {
  const { user, login, normalizeAndLogin } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [address, setAddress] = useState(user?.address ?? '')
  const [district, setDistrict] = useState(user?.district ?? '')
  const [pincode, setPincode] = useState(user?.pincode ?? '')
  const [role] = useState(user?.role ?? 'PROVIDER')
  const [services, setServices] = useState([])
  const [rating, setRating] = useState({ average: 0, count: 0 })
  const [reviews, setReviews] = useState([])
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    district: user?.district ?? '',
    pincode: user?.pincode ?? ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!user || !user.id) return
    api
      .get('/api/services', { params: { providerId: user.id } })
      .then(r => setServices(Array.isArray(r.data) ? r.data : (r.data.value || [])))
      .catch(() => setServices([]))
    api.get(`/api/providers/${user.id}/rating`).then(r => setRating(r.data)).catch(() => setRating({ average: 0, count: 0 }))
    api.get(`/api/providers/${user.id}/reviews`).then(r => setReviews(Array.isArray(r.data) ? r.data : [])).catch(() => setReviews([]))
  }, [user])

  const save = async values => {
    setSaving(true)
    try {
      const vals = values ?? { name, email, phone, address, district, pincode, role }
      if (user && user.id) {
        try {
          await api.put(`/api/users/${user.id}`, {
            name: vals.name,
            email: vals.email,
            phoneNo: vals.phone,
            address: vals.address,
            district: vals.district,
            pincode: vals.pincode,
            role: vals.role
          })
          toast.success('Profile updated successfully!')
        } catch (e) {
          toast.error(e.response?.data || 'Failed to update profile')
          return
        }
      }
      const updated = { ...user, ...vals }
      if (typeof normalizeAndLogin === 'function') normalizeAndLogin(updated)
      else login(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!user)
    return (
      <div className="app-bg flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <h2 className="mb-3 font-display text-3xl font-bold text-white">Provider Profile</h2>
        <p className="text-gray-400">You must be logged in to view your profile.</p>
      </div>
    )

  return (
    <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="glass-strong mx-auto max-w-4xl rounded-2xl p-6 shadow-glow md:p-8">
        <h2 className="text-center font-display text-3xl font-bold text-white">My Provider Profile</h2>

        {/* PASSWORD FORM */}
        <div className="mt-4 flex justify-end">
          <button
            className="btn-primary btn-ripple flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            onClick={() => setShowPasswordForm(s => !s)}
          >
            <Lock className="h-4 w-4" /> {showPasswordForm ? 'Hide Password Form' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <div className="glass mb-6 mt-3 rounded-2xl p-5">
            <h3 className="mb-3 font-display text-lg font-semibold text-white">Change Password</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300">Old Password</label>
                <input type="password" className={inputClass} value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">New Password</label>
                <input type="password" className={inputClass} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                <input type="password" className={inputClass} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="btn-primary btn-ripple rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                onClick={async () => {
                  if (!oldPassword || !newPassword) return toast.error('Please fill all fields')
                  if (newPassword !== confirmPassword) return toast.error('Passwords do not match')
                  try {
                    await api.post(`/api/users/${user.id}/change-password`, { oldPassword, newPassword })
                    toast.success('Password changed successfully!')
                    setOldPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setShowPasswordForm(false)
                  } catch (e) {
                    toast.error(e.response?.data || 'Failed to change password')
                  }
                }}
              >
                Change Password
              </button>
              <button className="btn-secondary rounded-xl px-4 py-2 text-sm font-medium text-gray-200" onClick={() => setShowPasswordForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* PROFILE DETAILS */}
        {!editing ? (
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField label="Name" value={user.name} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="Phone" value={user.phone ?? '—'} />
              <ProfileField label="Address" value={user.address ?? '—'} />
              <ProfileField label="District" value={user.district ?? '—'} />
              <ProfileField label="Pincode" value={user.pincode ?? '—'} />
              <ProfileField label="Role" value={user.role ?? 'PROVIDER'} />
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setDraft({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    district: user.district,
                    pincode: user.pincode
                  })
                  setEditing(true)
                }}
                className="btn-accent btn-ripple inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-900 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Edit3 className="h-4 w-4" /> Edit Profile
              </button>
            </div>

            {/* SERVICES LIST */}
            <div className="mt-8">
              <h3 className="mb-3 font-display text-xl font-semibold text-white">My Services</h3>
              {services.length === 0 ? (
                <p className="glass rounded-2xl py-4 text-center text-gray-400">No services yet.</p>
              ) : (
                <div className="space-y-4">
                  {services.map(s => (
                    <div key={s.id} className="glass rounded-2xl p-4 shadow-card">
                      <ServiceItem
                        service={s}
                        onUpdated={updated =>
                          setServices(list => list.map(x => (x.id === updated.id ? updated : x)))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* REVIEWS & RATING */}
            <div className="mt-8">
              <h3 className="mb-3 font-display text-xl font-semibold text-white">Ratings &amp; Reviews</h3>
              <div className="mb-4 flex items-center gap-3 text-gray-300">
                <span className="text-lg font-medium text-white">Average Rating: {rating.average ?? 0}</span>
                <span className="text-sm text-gray-400">({rating.count ?? 0} reviews)</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(rating.average) ? 'fill-accent-400 text-accent-400' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>

              {/* Review submission: only allow non-provider users to submit */}
              {user && user.role !== 'PROVIDER' && (
                <div className="glass mb-4 rounded-2xl p-4">
                  <h4 className="mb-2 font-medium text-white">Leave a review</h4>
                  <div className="mb-2 flex items-center gap-2">
                    <label className="text-sm text-gray-300">Rating:</label>
                    <div className="flex">
                      {[5, 4, 3, 2, 1].map(v => (
                        <button key={v} onClick={() => setNewRating(v)} className="px-0.5">
                          <Star className={`h-5 w-5 ${v <= newRating ? 'fill-accent-400 text-accent-400' : 'text-gray-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write your review" className="input-glass w-full rounded-xl px-3.5 py-2.5 text-sm" rows={3} />
                  <div className="mt-3 flex gap-2">
                    <button onClick={async () => {
                      if (!user || !user.id) return toast.error('Please login to submit a review')
                      try {
                        await api.post(`/api/providers/${user.id}/reviews`, { userId: user.id, rating: newRating, comment: newComment })
                        toast.success('Review submitted')
                        const r1 = await api.get(`/api/providers/${user.id}/reviews`)
                        setReviews(Array.isArray(r1.data) ? r1.data : [])
                        const r2 = await api.get(`/api/providers/${user.id}/rating`)
                        setRating(r2.data)
                        setNewComment('')
                        setNewRating(5)
                      } catch (e) {
                        toast.error(e.response?.data?.error || 'Failed to submit review')
                      }
                    }} className="btn-primary btn-ripple rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">Submit Review</button>
                    <button onClick={() => { setNewComment(''); setNewRating(5) }} className="btn-secondary rounded-xl px-4 py-2 text-sm font-medium text-gray-200">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-gray-400">No reviews yet.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="glass rounded-2xl p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="font-medium text-white">{r.user?.name}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-300">{r.rating} <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" /></div>
                      </div>
                      <div className="mb-1 text-sm text-gray-300">{r.comment}</div>
                      <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <EditProfileForm
            draft={draft}
            setDraft={setDraft}
            save={save}
            saving={saving}
            cancel={() => setEditing(false)}
            role={role}
            user={user}
          />
        )}
      </div>
    </div>
  )
}

function ProfileField({ label, value }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="font-medium text-white">{value}</div>
    </div>
  )
}

function EditProfileForm({ draft, setDraft, save, saving, cancel, role }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {['name', 'email', 'phone', 'address', 'district', 'pincode'].map(field => (
        <div key={field}>
          <label className="text-sm font-medium capitalize text-gray-300">{field}</label>
          <input
            className={inputClass}
            value={draft[field]}
            onChange={e => setDraft(d => ({ ...d, [field]: e.target.value }))}
          />
        </div>
      ))}
      <div>
        <label className="text-sm font-medium text-gray-300">Role</label>
        <input className={`${inputClass} opacity-60`} value={role} disabled />
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={() => save(draft)}
          disabled={saving}
          className="btn-primary btn-ripple rounded-xl px-5 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={cancel} className="btn-secondary rounded-xl px-5 py-2 text-sm font-medium text-gray-200">
          Cancel
        </button>
      </div>
    </div>
  )
}

function ServiceItem({ service, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    description: service.description ?? '',
    pricingPerHour: service.pricingPerHour ?? '',
    status: service.status ?? ''
  })

  const save = async () => {
    try {
      const res = await api.put(`/api/services/${service.id}`, draft)
      onUpdated(res.data || res)
      setEditing(false)
      toast.success('Service updated!')
    } catch (e) {
      toast.error(e.response?.data || 'Failed to update service')
    }
  }

  return (
    <div>
      <div className="mb-1 font-display text-lg font-semibold text-white">{service.serviceName}</div>
      {!editing ? (
        <div className="space-y-1 text-sm text-gray-300">
          <p>{service.description}</p>
          <p>Pricing: &#8377;{service.pricingPerHour}</p>
          <p>Status: {service.status}</p>
          <button
            onClick={() => setEditing(true)}
            className="mt-2 text-sm font-medium text-primary-500 hover:text-primary-400"
          >
            Edit Service
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium text-gray-300">Description</label>
            <input className={inputClass} value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Pricing per hour (&#8377;)</label>
            <input className={inputClass} value={draft.pricingPerHour} onChange={e => setDraft(d => ({ ...d, pricingPerHour: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Status</label>
            <select className={inputClass} value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}>
              <option className="bg-ink-800" value="ACTIVE">ACTIVE</option>
              <option className="bg-ink-800" value="INACTIVE">INACTIVE</option>
              <option className="bg-ink-800" value="PENDING">PENDING</option>
            </select>
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={save} className="btn-primary btn-ripple rounded-xl px-3 py-1.5 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5">
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setDraft({
                  description: service.description ?? '',
                  pricingPerHour: service.pricingPerHour ?? '',
                  status: service.status ?? ''
                })
              }}
              className="btn-secondary rounded-xl px-3 py-1.5 text-sm font-medium text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
