import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    HiOutlineBell,
    HiOutlineMoon,
    HiOutlineSun,
    HiOutlineMenu,
    HiOutlineLogout,
    HiOutlineUser,
} from 'react-icons/hi';
import Logo from './Logo';
import { studentAPI, parentAPI } from '../../services/apiService';
import toast from 'react-hot-toast';

export default function Navbar({ onToggleSidebar }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const fetchNotifications = async () => {
        if (!user || (user.role !== 'student' && user.role !== 'parent')) return;

        try {
            setLoadingNotifications(true);
            const api = user.role === 'student' ? studentAPI : parentAPI;
            const res = await api.getNotifications();
            setNotifications(res.data.data.notifications || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoadingNotifications(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 2 minutes
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, [user?.role]);

    const handleMarkAsRead = async (id) => {
        try {
            const api = user.role === 'student' ? studentAPI : parentAPI;
            await api.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            toast.error('Failed to mark notification as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const roleColors = {
        student: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
        teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        parent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-6"
            style={{
                height: 'var(--navbar-height)',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <HiOutlineMenu className="w-5 h-5" />
                </button>
                <Link to={`/${user?.role}`} className="flex items-center gap-2">
                    <Logo size="sm" variant="dark" />
                </Link>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
                {/* Dark mode toggle */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? (
                        <HiOutlineSun className="w-5 h-5 text-amber-400" />
                    ) : (
                        <HiOutlineMoon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                    )}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setNotificationsOpen(!notificationsOpen);
                            setDropdownOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                        aria-label="Notifications"
                    >
                        <HiOutlineBell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </button>

                    {notificationsOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                            <div
                                className="absolute right-0 top-full mt-2 w-80 rounded-xl z-50 overflow-hidden animate-fade-in"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-lg)',
                                }}
                            >
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {loadingNotifications && notifications.length === 0 ? (
                                        <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            Loading...
                                        </div>
                                    ) : notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className={`p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                                                        <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                                                            {new Date(n.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(n._id)}
                                                            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium"
                                                        >
                                                            Mark read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <HiOutlineBell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
                                    <Link
                                        to={`/${user?.role}/notifications`}
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                        onClick={() => setNotificationsOpen(false)}
                                    >
                                        View All Notifications
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setDropdownOpen(!dropdownOpen);
                            setNotificationsOpen(false);
                        }}
                        className="flex items-center gap-2 p-1.5 pl-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleColors[user?.role]}`}>
                                {user?.role}
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                        </div>
                    </button>

                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                            <div
                                className="absolute right-0 top-full mt-2 w-48 rounded-xl z-50 overflow-hidden animate-fade-in"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-lg)',
                                }}
                            >
                                <Link
                                    to={`/${user?.role}/profile`}
                                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    style={{ color: 'var(--text-primary)' }}
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <HiOutlineUser className="w-4 h-4" />
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-3 text-sm w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                >
                                    <HiOutlineLogout className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
