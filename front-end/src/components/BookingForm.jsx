import { useState } from 'react'
import api from '../api/api'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { CalendarCheck, Loader2 } from 'lucide-react'

export default function BookingForm({ service, onBooked }) {
  const [address, setAddress] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const submit = async e => {
    e.preventDefault()
    if (!user) { toast.error('Please login to book'); return }
    if (!service || !service.id) { toast.error('Invalid service selected'); return }
    setSubmitting(true)
    try {
      const payload = { userId: user.id, serviceId: service.id, date: date || new Date().toISOString(), status: 'BOOKED', address, userNote: note }
      const res = await api.post('/api/bookings', payload)
      toast.success('Booking created')
      onBooked && onBooked(res.data)
    } catch (err) {
      toast.error('Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <input
        value={address}
        onChange={e => setAddress(e.target.value)}
        placeholder="Service address"
        className="input-glass w-full rounded-xl px-3.5 py-2.5 text-sm"
      />
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add a note for provider (optional)"
        className="input-glass w-full rounded-xl px-3.5 py-2.5 text-sm"
        rows={2}
      />
      <input
        value={date}
        onChange={e => setDate(e.target.value)}
        type="datetime-local"
        className="input-glass w-full rounded-xl px-3.5 py-2.5 text-sm"
      />
      <button
        disabled={submitting}
        className="btn-primary btn-ripple flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
        {submitting ? 'Booking…' : 'Book'}
      </button>
    </form>
  )
}
