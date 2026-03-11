import { useEffect, useState } from 'react';
import { parentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineBell, HiOutlineCheck } from 'react-icons/hi';

export default function ParentNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await parentAPI.getNotifications();
            setNotifications(res.data.data.notifications);
        } catch (err) {
            console.error('Failed to load notifications:', err);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await parentAPI.markNotificationRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            toast.success('Notification marked as read');
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            toast.error('Failed to update notification');
        }
    };

    if (loading) return <LoadingSpinner />;

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🔔 Notifications</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Unread</h3>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {unreadNotifications.map((n) => (
                            <div key={n._id} className="p-4 hover:bg-opacity-50 transition-colors" style={{ background: 'var(--bg-tertiary)' }}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.type === 'attendance' ? 'bg-rose-500' :
                                            n.type === 'result' ? 'bg-emerald-500' :
                                                'bg-indigo-500'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                                                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => markAsRead(n._id)}
                                                className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                                                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                                            >
                                                <HiOutlineCheck className="w-4 h-4" />
                                                Mark Read
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Read</h3>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {readNotifications.map((n) => (
                            <div key={n._id} className="p-4 opacity-60">
                                <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.type === 'attendance' ? 'bg-rose-500' :
                                            n.type === 'result' ? 'bg-emerald-500' :
                                                'bg-indigo-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {notifications.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <HiOutlineBell className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No notifications yet</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        You'll receive notifications about your children's attendance and performance here
                    </p>
                </div>
            )}
        </div>
    );
}
