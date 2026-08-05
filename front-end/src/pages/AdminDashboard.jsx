import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShieldCheck, Users, ClipboardList, UserCog, Loader2, Trash2 } from 'lucide-react';

const TABS = [
  { key: 'pending', label: 'Pending Providers', icon: ShieldCheck },
  { key: 'users', label: 'Users Management', icon: Users },
  { key: 'admins', label: 'Admin Management', icon: UserCog },
  { key: 'bookings', label: 'All Bookings', icon: ClipboardList },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [showDeleteOtp, setShowDeleteOtp] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [pendingRes, usersRes, bookingsRes] = await Promise.all([
        api.get('/api/admin/providers/pending'),
        api.get('/api/admin/users'),
        api.get('/api/admin/bookings')
      ]);
      setPendingProviders(pendingRes.data);
      setAllUsers(usersRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
    }
  };

  const handleVerifyProvider = async (providerId) => {
    try {
      await api.post(`/api/admin/providers/${providerId}/verify`);
      loadData();
    } catch (error) {
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await api.post(`/api/admin/users/${userId}/status`, { status });
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const initiateAdminDelete = async (adminId) => {
    try {
      await api.post('/api/otp/send-admin-delete', { adminId });
      setAdminToDelete(adminId);
      setShowDeleteOtp(true);
      toast.success('OTP sent to Admin for deletion confirmation.');
    } catch (error) {
      toast.error('Failed to initiate admin deletion');
    }
  };

  const confirmAdminDelete = async () => {
    if (!deleteOtp) {
      toast.error('Please enter OTP');
      return;
    }
    setIsDeleting(true);
    try {
      await api.delete(`/api/admin/admins/${adminToDelete}?otp=${deleteOtp}`);
      toast.success('Admin deleted successfully');
      setShowDeleteOtp(false);
      setAdminToDelete(null);
      setDeleteOtp('');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete admin');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-bg min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === t.key
                  ? 'btn-primary text-white shadow-glow'
                  : 'glass text-gray-300 hover:text-white'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'pending' && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-white">Pending Providers</h2>
            <div className="mt-4 grid gap-4">
              {pendingProviders.map(provider => (
                <div key={provider.id} className="glass rounded-2xl p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <h3 className="font-display font-semibold text-white">{provider.name}</h3>
                  <p className="mt-1 text-sm text-gray-400">Email: {provider.email}</p>
                  <p className="text-sm text-gray-400">Service: {provider.serviceType}</p>
                  <p className="text-sm text-gray-400">Location: {provider.district}, {provider.state}</p>
                  <button
                    onClick={() => handleVerifyProvider(provider.id)}
                    className="btn-ripple mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-emerald-400/20"
                  >
                    <ShieldCheck className="h-4 w-4" /> Verify Provider
                  </button>
                </div>
              ))}
              {pendingProviders.length === 0 && (
                <div className="glass rounded-2xl py-8 text-center text-gray-400">No pending providers</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-white">Users Management</h2>
            <div className="glass mt-4 overflow-x-auto rounded-2xl shadow-card">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-white/5 backdrop-blur">
                  <tr>
                    <th className="p-4 font-medium text-gray-300">Name</th>
                    <th className="p-4 font-medium text-gray-300">Email</th>
                    <th className="p-4 font-medium text-gray-300">Role</th>
                    <th className="p-4 font-medium text-gray-300">Status</th>
                    <th className="p-4 font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id} className="border-t border-white/10 transition-colors hover:bg-white/5">
                      <td className="p-4 text-white">{u.name}</td>
                      <td className="p-4 text-gray-300">{u.email}</td>
                      <td className="p-4 text-gray-300">{u.role}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.status === 'active' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-gray-300'}`}>
                          {u.status || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role !== 'ADMIN' ? (
                          <div className="flex gap-2">
                            {u.status === 'active' ? (
                              <button
                                onClick={() => handleUpdateStatus(u.id, 'inactive')}
                                className="btn-ripple rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-red-500/20"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(u.id, 'active')}
                                className="btn-ripple rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-emerald-400/20"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-white">Admin Management</h2>
            <div className="glass mt-4 overflow-x-auto rounded-2xl shadow-card">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-white/5 backdrop-blur">
                  <tr>
                    <th className="p-4 font-medium text-gray-300">Name</th>
                    <th className="p-4 font-medium text-gray-300">Email</th>
                    <th className="p-4 font-medium text-gray-300">Role</th>
                    <th className="p-4 font-medium text-gray-300">Created Date</th>
                    <th className="p-4 font-medium text-gray-300">Status</th>
                    <th className="p-4 font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.filter(u => u.role === 'ADMIN').map(u => (
                    <tr key={u.id} className="border-t border-white/10 transition-colors hover:bg-white/5">
                      <td className="p-4 text-white">{u.name}</td>
                      <td className="p-4 text-gray-300">{u.email}</td>
                      <td className="p-4 text-gray-300">{u.role}</td>
                      <td className="p-4 text-gray-300">{u.createdDate ? new Date(u.createdDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.status === 'active' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-gray-300'}`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.id !== u.id && (
                          <button
                            onClick={() => initiateAdminDelete(u.id)}
                            className="btn-ripple flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-white">All Bookings</h2>
            <div className="glass mt-4 overflow-x-auto rounded-2xl shadow-card">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-white/5 backdrop-blur">
                  <tr>
                    <th className="p-4 font-medium text-gray-300">Service</th>
                    <th className="p-4 font-medium text-gray-300">Provider</th>
                    <th className="p-4 font-medium text-gray-300">User</th>
                    <th className="p-4 font-medium text-gray-300">Date</th>
                    <th className="p-4 font-medium text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-t border-white/10 transition-colors hover:bg-white/5">
                      <td className="p-4 text-white">{booking.service.serviceName}</td>
                      <td className="p-4 text-gray-300">{booking.service.provider.name}</td>
                      <td className="p-4 text-gray-300">{booking.user.name}</td>
                      <td className="p-4 text-gray-300">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-primary-500/10 px-2.5 py-1 text-xs font-medium text-primary-400">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showDeleteOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong relative w-full max-w-sm rounded-2xl p-6 shadow-glow">
            <h3 className="font-display text-xl font-bold text-white">Verify Deletion</h3>
            <p className="mt-2 text-sm text-gray-400">Enter the OTP sent to Admin (Deepak Deore) to confirm deletion.</p>
            <input
              type="text"
              value={deleteOtp}
              onChange={(e) => setDeleteOtp(e.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
              className="input-glass mt-4 w-full rounded-xl px-4 py-2.5 text-sm"
            />
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteOtp(false); setDeleteOtp(''); setAdminToDelete(null); }}
                className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAdminDelete}
                disabled={isDeleting || !deleteOtp}
                className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
