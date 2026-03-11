import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ role: '', search: '', page: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'student' });

    const load = async () => {
        try {
            const res = await adminAPI.getUsers(filters);
            setUsers(res.data.data.users || []);
            setPagination(res.data.data.pagination || {});
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filters.page, filters.role]);

    const handleSearch = () => { setFilters({ ...filters, page: 1 }); load(); };

    const openCreate = () => {
        setEditUser(null);
        setForm({ firstName: '', lastName: '', email: '', password: 'demo123', role: 'student' });
        setShowModal(true);
    };

    const openEdit = (u) => {
        setEditUser(u);
        setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, password: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editUser) {
                await adminAPI.updateUser(editUser._id, form);
                toast.success('User updated!');
            } else {
                await adminAPI.createUser(form);
                toast.success('User created!');
            }
            setShowModal(false);
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deactivate this user?')) return;
        try {
            await adminAPI.deleteUser(id);
            toast.success('User deactivated');
            load();
        } catch (err) { toast.error('Failed'); }
    };

    if (loading) return <LoadingSpinner />;

    const roleColors = {
        student: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        parent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>👥 User Management</h1>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white gradient-primary hover:opacity-90">
                    <HiOutlinePlus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <input
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search name or email..."
                        className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <button onClick={handleSearch} className="p-2 rounded-lg gradient-primary text-white"><HiOutlineSearch className="w-4 h-4" /></button>
                </div>
                <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                    className="px-4 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                    <option value="">All roles</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="parent">Parents</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr style={{ background: 'var(--bg-tertiary)' }}>
                            {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                                                <span className="text-white text-xs font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                                            </div>
                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${roleColors[u.role]}`}>{u.role}</span></td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full ${u.isActive !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                            {u.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><HiOutlinePencil className="w-4 h-4 text-indigo-500" /></button>
                                            <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><HiOutlineTrash className="w-4 h-4 text-rose-500" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
                        <div className="flex gap-1">
                            <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-3 py-1 rounded text-xs disabled:opacity-40" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Prev</button>
                            <button disabled={filters.page >= pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-3 py-1 rounded text-xs disabled:opacity-40" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="relative w-full max-w-md rounded-xl p-6 space-y-4 animate-slide-up z-50" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)' }}>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editUser ? 'Edit User' : 'Create User'}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First Name" required className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last Name" required className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        </div>
                        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" required className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        {!editUser && <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Password" required className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />}
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="parent">Parent</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
                            <button type="submit" className="flex-1 py-2 rounded-lg text-sm font-semibold text-white gradient-primary hover:opacity-90">{editUser ? 'Update' : 'Create'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
