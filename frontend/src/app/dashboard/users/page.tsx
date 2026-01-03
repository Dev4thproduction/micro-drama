'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Search, Shield, UserCheck, Ban,
  ChevronLeft, ChevronRight, Loader2,
  Edit, Trash2, X
} from 'lucide-react';
import { clsx } from 'clsx';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Map 'User' tab to 'viewer' role for the backend
      let roleParam = undefined;
      if (activeTab === 'User') roleParam = 'viewer';
      if (activeTab === 'Admin') roleParam = 'admin';

      const res = await api.get('/admin/users', {
        params: {
          page,
          search,
          role: roleParam
        }
      });

      setUsers(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);

    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers((prev: any) => prev.map((u: any) =>
        u._id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev: any) => prev.filter((u: any) => u._id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (updatedData: any) => {
    try {
      const res = await api.patch(`/admin/users/${selectedUser._id}`, updatedData);
      setUsers((prev: any) => prev.map((u: any) =>
        u._id === selectedUser._id ? { ...u, ...res.data.data } : u
      ));
      setIsEditModalOpen(false);
      alert('User updated successfully');
    } catch (err) {
      alert('Failed to update user');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto bg-[#161b22] border border-white/5 p-1.5 rounded-xl">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-transparent border-none text-sm text-white placeholder:text-gray-600 focus:ring-0 px-10 py-2 outline-none"
            />
          </div>
          <button type="submit" className="hidden"></button>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">

        {/* TABS - NO CREATOR */}
        <div className="flex items-center gap-6 px-6 border-b border-white/5 text-sm font-medium overflow-x-auto">
          {['All', 'User', 'Admin'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={clsx(
                "py-4 border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab
                  ? "border-primary text-white"
                  : "border-transparent text-gray-500 hover:text-white"
              )}
            >
              {tab}s
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user._id} className="group hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-sm">
                            {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">{user.displayName || 'No Name'}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          user.role === 'admin'
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20" // Default for Viewer/User
                        )}>
                          {user.role === 'admin' ? <Shield size={12} /> : <UserCheck size={12} />}
                          {user.role === 'viewer' ? 'USER' : user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx("text-xs font-bold", user.status === 'active' ? "text-emerald-400" : "text-red-400")}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => toggleStatus(user._id, user.status)}
                            className={clsx(
                              "p-2 rounded-lg transition-colors",
                              user.status === 'active' ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            )}
                            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          >
                            {user.status === 'active' ? <Ban size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="border-t border-white/5 p-4 flex items-center justify-between bg-black/20">
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
}

function EditUserModal({ isOpen, onClose, user, onUpdate }: any) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'viewer'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        role: user.role || 'viewer'
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-white">
      <div className="bg-[#161b22] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-bold">Edit User</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. john@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer text-white"
            >
              <option value="viewer" className="bg-[#161b22]">User (Viewer)</option>
              <option value="admin" className="bg-[#161b22]">Admin</option>
              <option value="creator" className="bg-[#161b22]">Creator</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
