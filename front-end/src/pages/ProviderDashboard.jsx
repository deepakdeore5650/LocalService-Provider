import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  ClipboardList,
  CalendarDays,
  MapPin,
  User,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();
  const [notes, setNotes] = useState({});
  // store per-booking amount inputs when provider accepts a booking
  const [amounts, setAmounts] = useState({});

  useEffect(() => {
    // only load bookings for providers whose account is active
    if (user && user.role === 'PROVIDER' && user.status === 'active') {
      api
        .get("/api/bookings", { params: { providerId: user.id } })
        .then((r) =>
          setBookings(Array.isArray(r.data) ? r.data : r.data.value || [])
        )
        .catch(() => setBookings([]));
    } else {
      // clear bookings if not active or no user
      setBookings([]);
    }
  }, [user]);

  const handleUpdate = async (b, payload, successMessage) => {
    try {
      const res = await api.patch(`/api/bookings/${b.id}`, payload);
      setBookings((bs) => bs.map((x) => (x.id === b.id ? res.data : x)));
      toast.success(successMessage);
      setNotes((n) => ({ ...n, [b.id]: "" }));
    } catch (err) {
      try {
        const params = new URLSearchParams(payload);
        const res = await api.post(
          `/api/bookings/${b.id}/note-form?${params.toString()}`,
          null,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        setBookings((bs) => bs.map((x) => (x.id === b.id ? res.data : x)));
        toast.success(successMessage);
        setNotes((n) => ({ ...n, [b.id]: "" }));
      } catch (e) {
        toast.error("Update failed");
      }
    }
  };

  if (!user)
    return (
      <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-16 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-white">
          Provider Dashboard
        </h2>
        <p className="text-gray-400">You must be logged in to view bookings.</p>
      </div>
    );

  // If provider is not yet active, show approval page only
  if (user.role === 'PROVIDER' && user.status !== 'active') {
    return (
      <div className="app-bg flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="glass-strong w-full max-w-lg rounded-2xl p-8 text-center shadow-glow">
          <h2 className="mb-4 font-display text-2xl font-bold text-white">Account Pending Approval</h2>
          <p className="mb-4 text-gray-400">Your provider account is under review by an administrator.</p>
          <p className="mb-6 text-sm text-gray-500">Current status: <strong className="text-gray-300">{user.status || 'pending'}</strong>{user.status1 ? ` — ${user.status1}` : ''}</p>
          <p className="text-gray-300">You will be notified once your account is approved. In the meantime you cannot access bookings or service pages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-3xl font-bold text-white">
            <ClipboardList size={26} className="text-primary-500" />
            Provider Bookings
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="glass rounded-2xl py-10 text-center text-gray-400 shadow-card">
            No bookings assigned yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="glass rounded-2xl p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                {/* Header */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
                    <FileText size={16} className="text-primary-500" />
                    {b.service?.serviceName || "Unnamed Service"}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      b.status === "IN_PROGRESS"
                        ? "bg-accent-500/10 text-accent-400"
                        : b.status === "COMPLETED"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-white/10 text-gray-300"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Booking details */}
                <div className="space-y-1.5 text-sm text-gray-300">
                  <p className="flex items-center gap-1.5">
                    <User size={14} className="text-primary-500" /> User: {b.user?.name ?? "—"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-primary-500" /> {new Date(b.date).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary-500" /> {b.address}
                  </p>
                  {b.userNote && (
                    <div className="mt-2 rounded-xl border-l-4 border-white/20 bg-white/5 p-3">
                      <p className="text-sm text-gray-200">
                        <strong className="text-white">User note:</strong> {b.userNote}
                      </p>
                    </div>
                  )}

                  {b.providerNote ? (
                    <div className="mt-2 rounded-xl border-l-4 border-primary-500 bg-primary-500/10 p-3">
                      <p className="text-sm text-gray-200">
                        <strong className="text-white">Provider note:</strong> {b.providerNote}
                      </p>
                    </div>
                  ) : (
                    <p className="flex items-center gap-1.5 text-gray-400">
                      <MessageSquare size={14} /> Provider Note: —
                    </p>
                  )}
                </div>

                {/* Note input */}
                <div className="mt-4">
                  <textarea
                    rows="2"
                    placeholder="Write a note (e.g., I'll arrive in 30 mins)"
                    value={notes[b.id] ?? ""}
                    onChange={(e) =>
                      setNotes((n) => ({ ...n, [b.id]: e.target.value }))
                    }
                    className="input-glass w-full rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                {/* Buttons: show actions conditionally based on booking status */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {b.status === 'BOOKED' && (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount (INR)"
                        value={(amounts && amounts[b.id]) ?? ''}
                        onChange={(e) => setAmounts(a => ({ ...(a||{}), [b.id]: e.target.value }))}
                        className="input-glass w-36 rounded-xl px-3 py-2 text-sm"
                      />

                      <button
                        onClick={async () => {
                          const amt = parseFloat((amounts && amounts[b.id]) ?? NaN);
                          if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return }
                          try {
                            const res = await api.post(`/api/bookings/${b.id}/accept`, { amount: amt, providerNote: notes[b.id] ?? '' })
                            const booking = res.data.booking ?? res.data
                            setBookings(bs => bs.map(x => x.id === b.id ? booking : x))
                            toast.success('Booking accepted — payment requested')
                          } catch (e) {
                            toast.error(e.response?.data?.error || 'Failed to accept')
                          }
                        }}
                        className="btn-primary btn-ripple flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          handleUpdate(b, { status: "REJECTED", providerNote: notes[b.id] ?? "" }, "Booking rejected")
                        }
                        className="btn-ripple flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-red-500/20"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {b.status !== 'BOOKED' && b.status !== 'REJECTED' && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdate(
                            b,
                            { status: "IN_PROGRESS", providerNote: notes[b.id] ?? "" },
                            "Marked as In Progress"
                          )
                        }
                        className="btn-accent btn-ripple flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-ink-900 transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        <Clock size={15} /> In Progress
                      </button>

                      <button
                        onClick={() =>
                          handleUpdate(
                            b,
                            { providerNote: notes[b.id] ?? "" },
                            "Note added"
                          )
                        }
                        className="btn-primary btn-ripple flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        <Send size={15} /> Add Note
                      </button>

                      <button
                        onClick={() =>
                          handleUpdate(b, { status: "COMPLETED" }, "Booking marked as Completed")
                        }
                        className="btn-ripple flex items-center gap-1 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-300 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-emerald-400/20"
                      >
                        <CheckCircle size={15} /> Complete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
