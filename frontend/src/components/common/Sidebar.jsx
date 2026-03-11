import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    HiOutlineHome,
    HiOutlineBookOpen,
    HiOutlineClipboardCheck,
    HiOutlineChartBar,
    HiOutlineCalendar,
    HiOutlineLightBulb,
    HiOutlineStar,
    HiOutlineChatAlt2,
    HiOutlineUpload,
    HiOutlinePencilAlt,
    HiOutlineUsers,
    HiOutlineAcademicCap,
    HiOutlineCog,
    HiOutlineDocumentReport,
    HiOutlineX,
    HiOutlineBell,
    HiOutlineFire,
} from 'react-icons/hi';

const menuItems = {
    student: [
        { label: 'Dashboard', path: '/student', icon: HiOutlineHome },
        { label: 'Courses', path: '/student/courses', icon: HiOutlineBookOpen },
        { label: 'Assessments', path: '/student/assessments', icon: HiOutlineClipboardCheck },
        { label: 'Performance', path: '/student/performance', icon: HiOutlineChartBar },
        { label: 'Learning Journey', path: '/student/learning-journey', icon: HiOutlineFire },
        { label: 'Flashcards', path: '/student/flashcards', icon: HiOutlineLightBulb },
        { label: 'Rewards', path: '/student/rewards', icon: HiOutlineStar },
        { label: 'AI Assistant', path: '/student/chatbot', icon: HiOutlineChatAlt2 },
    ],
    teacher: [
        { label: 'Dashboard', path: '/teacher', icon: HiOutlineHome },
        { label: 'My Courses', path: '/teacher/courses', icon: HiOutlineBookOpen },
        { label: 'Content Manager', path: '/teacher/content', icon: HiOutlineUpload },
        { label: 'Assessments', path: '/teacher/assessments', icon: HiOutlinePencilAlt },
        { label: 'Grading', path: '/teacher/grading', icon: HiOutlineClipboardCheck },
        { label: 'Analytics', path: '/teacher/analytics', icon: HiOutlineChartBar },
    ],
    parent: [
        { label: 'Dashboard', path: '/parent', icon: HiOutlineHome },
        { label: 'Performance', path: '/parent/performance', icon: HiOutlineChartBar },
        { label: 'Attendance', path: '/parent/attendance', icon: HiOutlineCalendar },
        { label: 'Notifications', path: '/parent/notifications', icon: HiOutlineBell },
    ],
    admin: [
        { label: 'Dashboard', path: '/admin', icon: HiOutlineHome },
        { label: 'User Management', path: '/admin/users', icon: HiOutlineUsers },
        { label: 'Course Management', path: '/admin/courses', icon: HiOutlineAcademicCap },
        { label: 'System Analytics', path: '/admin/analytics', icon: HiOutlineDocumentReport },
    ],
};

export default function Sidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const items = menuItems[user?.role] || [];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{
                    width: 'var(--sidebar-width)',
                    paddingTop: 'var(--navbar-height)',
                    background: 'var(--bg-sidebar)',
                }}
            >
                {/* Close button (mobile) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
                    style={{ top: 'calc(var(--navbar-height) + 8px)' }}
                >
                    <HiOutlineX className="w-5 h-5" />
                </button>

                <nav className="flex flex-col gap-1 px-3 py-4 overflow-y-auto h-full">
                    {items.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === `/${user?.role}`}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-white/15 text-white shadow-md'
                                    : 'text-white/60 hover:text-white hover:bg-white/8'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}
