import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { toast } from 'react-toastify';
import { Lock, Edit3, User, Mail, Home, Phone, MapPin, Shield } from 'lucide-react';

const inputClass = 'input-glass w-full rounded-xl px-3.5 py-2.5 text-sm mb-3';

export default function UserProfile() {
  const { user, login, normalizeAndLogin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    address: user?.address ?? '',
    district: user?.district ?? '',
    pincode: user?.pincode ?? '',
    phone: user?.phone ?? '',
    role: user?.role ?? 'USER',
  });
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user)
    return (
      <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-16 text-center">
        <h2 className="mb-2 font-display text-2xl font-bold text-white">Profile</h2>
        <p className="text-gray-400">You must be logged in to view your profile.</p>
      </div>
    );

  const saveProfile = async (values) => {
    setSaving(true);
    try {
      const vals = values ?? draft;
      if (user?.id) {
        await api.put(`/api/users/${user.id}`, {
          name: vals.name,
          email: vals.email,
          address: vals.address,
          district: vals.district,
          pincode: vals.pincode,
          phoneNo: vals.phone,
          role: vals.role,
        });
        toast.success('Profile updated');
      }
      const updated = { ...user, ...vals };
      normalizeAndLogin ? normalizeAndLogin(updated) : login(updated);
      setDraft(updated);
      setEditing(false);
    } catch (e) {
      toast.error(e.response?.data || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-10">
      <h2 className="text-center font-display text-2xl font-bold text-white">My Profile</h2>
      <div className="glass-strong mx-auto mt-6 max-w-lg rounded-2xl p-6 shadow-glow">
        {/* Edit / Password buttons */}
        <div className="flex flex-wrap justify-between gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="btn-accent btn-ripple flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-ink-900 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <Edit3 size={15} /> {editing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="btn-primary btn-ripple flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
          >
            <Lock size={15} /> {showPasswordForm ? 'Hide Password' : 'Change Password'}
          </button>
        </div>

        {/* Password Form */}
        {showPasswordForm && (
          <div className="glass mt-4 rounded-2xl p-4">
            <label className="mb-1 block text-sm text-gray-300">Old Password</label>
            <input
              type="password"
              className={inputClass}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <label className="mb-1 block text-sm text-gray-300">New Password</label>
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label className="mb-1 block text-sm text-gray-300">Confirm New Password</label>
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="mt-2 flex gap-2">
              <button
                className="btn-primary btn-ripple rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                onClick={async () => {
                  if (!oldPassword || !newPassword) return toast.error('Please fill both fields');
                  if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
                  try {
                    await api.post(`/api/users/${user.id}/change-password`, { oldPassword, newPassword });
                    toast.success('Password changed');
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setShowPasswordForm(false);
                  } catch (e) {
                    toast.error(e.response?.data || 'Failed to change password');
                  }
                }}
              >
                Change Password
              </button>
              <button
                className="btn-secondary rounded-xl px-4 py-2 text-sm font-medium text-gray-200"
                onClick={() => {
                  setShowPasswordForm(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profile Fields */}
        {!editing ? (
          <div className="mt-5 space-y-3 text-gray-300">
            <p className="flex items-center gap-2"><User size={15} className="text-primary-500" /> <strong className="text-white">Name:</strong> {draft.name}</p>
            <p className="flex items-center gap-2"><Mail size={15} className="text-primary-500" /> <strong className="text-white">Email:</strong> {draft.email}</p>
            <p className="flex items-center gap-2"><Home size={15} className="text-primary-500" /> <strong className="text-white">Address:</strong> {draft.address || '—'}</p>
            <p className="flex items-center gap-2"><Phone size={15} className="text-primary-500" /> <strong className="text-white">Phone:</strong> {draft.phone || '—'}</p>
            <p className="flex items-center gap-2"><MapPin size={15} className="text-primary-500" /> <strong className="text-white">District:</strong> {draft.district || '—'}</p>
            <p className="flex items-center gap-2"><Shield size={15} className="text-primary-500" /> <strong className="text-white">Role:</strong> {draft.role}</p>
          </div>
        ) : (
          <div className="mt-5">
            <input className={inputClass} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Name" />
            <input className={inputClass} value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="Email" />
            <input className={inputClass} value={draft.address} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} placeholder="Address" />
            <input className={inputClass} value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="Phone" />
            <input className={inputClass} value={draft.district} onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value }))} placeholder="District" />
            <input className={inputClass} value={draft.pincode} onChange={(e) => setDraft((d) => ({ ...d, pincode: e.target.value }))} placeholder="Pincode" />
            <div className="mt-2 flex gap-2">
              <button
                className="btn-primary btn-ripple rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                disabled={saving}
                onClick={() => saveProfile(draft)}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="btn-secondary rounded-xl px-4 py-2 text-sm font-medium text-gray-200"
                onClick={() => {
                  setEditing(false);
                  setDraft({
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    district: user.district,
                    pincode: user.pincode,
                    phone: user.phone,
                    role: user.role,
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
