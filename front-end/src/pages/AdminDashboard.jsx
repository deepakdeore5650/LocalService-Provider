import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { ShieldCheck, Users, ClipboardList } from 'lucide-react';

const TABS = [
  { key: 'pending', label: 'Pending Providers', icon: ShieldCheck },
  { key: 'users', label: 'Users Management', icon: Users },
  { key: 'bookings', label: 'All Bookings', icon: ClipboardList },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

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
      // failed to update status
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
    </div>
  );
};

export default AdminDashboard;
