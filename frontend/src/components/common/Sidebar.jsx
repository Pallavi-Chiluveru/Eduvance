import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logoImage from '../../assets/logo.png';
import {
    HiOutlineHome,
    HiOutlineBookOpen,
    HiOutlineClipboardCheck,
    HiOutlineChartBar,
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
    HiOutlineFire,
    HiOutlineCode,
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
        { label: 'DSA Arena', path: '/student/dsa-arena', icon: HiOutlineCode },
        { label: 'Mentor Feedback', path: '/student/mentor-feedback', icon: HiOutlineChatAlt2 },
    ],
    instructor: [
        { label: 'Dashboard', path: '/instructor/dashboard', icon: HiOutlineHome },
        { label: 'My Courses', path: '/instructor/courses', icon: HiOutlineBookOpen },
        { label: 'Content Manager', path: '/instructor/content', icon: HiOutlineUpload },
        { label: 'Assessments', path: '/instructor/assessments', icon: HiOutlinePencilAlt },
        { label: 'Grading', path: '/instructor/grading', icon: HiOutlineClipboardCheck },
        { label: 'Analytics', path: '/instructor/analytics', icon: HiOutlineChartBar },
    ],
    admin: [
        { label: 'Dashboard', path: '/admin', icon: HiOutlineHome },
        { label: 'User Management', path: '/admin/users', icon: HiOutlineUsers },
        { label: 'Course Management', path: '/admin/courses', icon: HiOutlineAcademicCap },
        { label: 'System Analytics', path: '/admin/analytics', icon: HiOutlineDocumentReport },
        { label: 'Instructor Requests', path: '/admin/instructors', icon: HiOutlineAcademicCap },
        { label: 'Reviewers', path: '/admin/reviewers', icon: HiOutlineClipboardCheck },
        { label: 'Mentors', path: '/admin/mentors', icon: HiOutlineUsers },
        { label: 'Course Reviews', path: '/admin/course-reviews', icon: HiOutlineBookOpen },
        { label: 'Categories', path: '/admin/categories', icon: HiOutlineCog },
        { label: 'Policies', path: '/admin/policies', icon: HiOutlineDocumentReport },
    ],
    reviewer: [
        { label: 'Dashboard', path: '/reviewer/dashboard', icon: HiOutlineHome },
        { label: 'Pending Reviews', path: '/reviewer/pending', icon: HiOutlineClipboardCheck },
        { label: 'Review History', path: '/reviewer/history', icon: HiOutlineDocumentReport },
    ],
    mentor: [
        { label: 'Dashboard', path: '/mentor/dashboard', icon: HiOutlineHome },
        { label: 'My Learners', path: '/mentor/learners', icon: HiOutlineUsers },
        { label: 'Learner Progress', path: '/mentor/learners', icon: HiOutlineChartBar },
        { label: 'Feedback', path: '/mentor/feedback', icon: HiOutlineChatAlt2 },
        { label: 'Mentoring Sessions', path: '/mentor/sessions', icon: HiOutlineClipboardCheck },
    ],
};

export default function Sidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const items = menuItems[user?.role] || [];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${user?.role === 'reviewer' ? 'reviewer-sidebar-overlay' : ''}`} onClick={onClose} />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-full flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${user?.role === 'reviewer' ? 'reviewer-sidebar' : ''} ${isOpen ? 'translate-x-0' : '-translate-x-full'
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
                    className="absolute right-4 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
                    style={{ top: 'calc(var(--navbar-height) + 8px)' }}
                >
                    <HiOutlineX className="w-5 h-5" />
                </button>

                {/* Logo Section */}
                <div className="flex items-center justify-center pb-6 px-5 shrink-0 -mt-6">
    <div className="bg-white rounded-2xl p-3 shadow-lg w-full flex items-center justify-center">
        <img
            src={logoImage}
            alt="Eduvance Logo"
            className="w-full h-auto max-h-20 object-contain"
        />
    </div>
</div>

                <nav className="flex flex-col gap-1 px-3 pb-4 overflow-y-auto flex-1">
                    {items.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === `/${user?.role}`}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
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
