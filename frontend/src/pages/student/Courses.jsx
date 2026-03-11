import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlinePlus, HiOutlineAcademicCap, HiOutlineInformationCircle, HiOutlineClock, HiOutlineGlobeAlt, HiOutlineUserCircle, HiOutlineCheckCircle } from 'react-icons/hi';

export default function StudentCourses() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('enrolled');
    const [showInfoModal, setShowInfoModal] = useState(null);

    const load = async () => {
        try {
            const [enrolled, available] = await Promise.all([
                studentAPI.getCourses(),
                studentAPI.getAvailableCourses(),
            ]);
            setEnrolledCourses(enrolled.data.data.enrollments || []);
            setAvailableCourses(available.data.data.courses || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleEnroll = async (courseId) => {
        try {
            await studentAPI.enrollCourse(courseId);
            toast.success('Enrolled successfully!');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Enrollment failed');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📚 Courses</h1>

            {/* Tabs */}
            <div className="flex gap-2">
                {['enrolled', 'available'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t
                            ? 'gradient-primary text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        style={tab !== t ? { color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' } : {}}
                    >
                        {t === 'enrolled' ? `My Courses (${enrolledCourses.length})` : `Available (${availableCourses.length})`}
                    </button>
                ))}
            </div>

            {tab === 'enrolled' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {enrolledCourses.map((e) => (
                        <CourseCard
                            key={e._id}
                            course={e.course}
                            enrollment={e}
                            onInfoClick={() => setShowInfoModal(e.course)}
                        />
                    ))}
                    {enrolledCourses.length === 0 && (
                        <div className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>
                            <HiOutlineBookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>No enrolled courses. Switch to "Available" to find courses!</p>
                        </div>
                    )}
                </div>
            )}

            {tab === 'available' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {availableCourses.map((c) => (
                        <AvailableCourseCard
                            key={c._id}
                            course={c}
                            onEnroll={handleEnroll}
                            onInfoClick={() => setShowInfoModal(c)}
                        />
                    ))}
                    {availableCourses.length === 0 && (
                        <div className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>
                            <p>You're enrolled in all available courses! 🎉</p>
                        </div>
                    )}
                </div>
            )}

            {/* Info Modal */}
            {showInfoModal && (
                <CourseInfoModal
                    course={showInfoModal}
                    onClose={() => setShowInfoModal(null)}
                />
            )}
        </div>
    );
}

function CourseCard({ course, enrollment, onInfoClick }) {
    return (
        <div className="group relative">
            <Link to={`/student/courses/${course._id}`}>
                <div
                    className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
                >
                    {/* Course Image/Thumbnail */}
                    <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <div className="text-center text-white p-4">
                            <HiOutlineBookOpen className="w-12 h-12 mx-auto mb-2 opacity-90" />
                            <h3 className="font-bold text-lg line-clamp-2">{course.name}</h3>
                        </div>
                        {/* Info Icon */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onInfoClick();
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <HiOutlineInformationCircle className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Course Info */}
                    <div className="p-4">
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{course.code}</p>
                        <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {course.description || 'No description available'}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{enrollment.progress || 0}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>{course.topics?.length || 0} Topics</span>
                            {course.teacher && (
                                <span>👨‍🏫 {course.teacher.firstName}</span>
                            )}
                        </div>
                    </div>

                    {/* Start Button */}
                    <div className="px-4 pb-4">
                        <div className="w-full py-2 rounded-lg text-sm font-medium text-center text-white gradient-primary">
                            Continue Learning
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

function AvailableCourseCard({ course, onEnroll, onInfoClick }) {
    return (
        <div className="group relative">
            <div
                className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
            >
                {/* Course Image/Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                        <HiOutlineAcademicCap className="w-12 h-12 mx-auto mb-2 opacity-90" />
                        <h3 className="font-bold text-lg line-clamp-2">{course.name}</h3>
                    </div>
                    {/* Info Icon */}
                    <button
                        onClick={onInfoClick}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <HiOutlineInformationCircle className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Course Info */}
                <div className="p-4">
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{course.code} · {course.category}</p>
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {course.description || 'No description available'}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        <span>{course.topics?.length || 0} Topics</span>
                        {course.teacher && (
                            <span>👨‍🏫 {course.teacher.firstName}</span>
                        )}
                    </div>
                </div>

                {/* Enroll Button */}
                <div className="px-4 pb-4">
                    <button
                        onClick={() => onEnroll(course._id)}
                        className="w-full py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <HiOutlinePlus className="w-4 h-4" /> Enroll Now
                    </button>
                </div>
            </div>
        </div>
    );
}

function CourseInfoModal({ course, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="rounded-xl max-w-md w-full p-6 space-y-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{course.name}</h3>
                    <button
                        onClick={onClose}
                        className="text-2xl leading-none"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        ×
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>TOPICS</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{course.topics?.length || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>DURATION</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {course.duration || '20'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hours</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>LANGUAGE</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>EN</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>English</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                        <HiOutlineCheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>STATUS</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Active</p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                        <HiOutlineUserCircle className="w-6 h-6 mx-auto mb-1 text-indigo-500" />
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>INSTRUCTOR</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {course.teacher?.firstName || 'TBD'}
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Description</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {course.description || 'This course covers fundamental concepts and advanced topics essential for mastering the subject.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
