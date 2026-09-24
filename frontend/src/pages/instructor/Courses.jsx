import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { instructorAPI } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CourseCard from '../../components/common/CourseCard';
import CourseInfoModal from '../../components/common/CourseInfoModal';

export default function InstructorCourses() {
    const { user } = useAuth(); const base = user?.role === 'instructor' ? '/instructor' : '/instructor';
    const [courses, setCourses] = useState([]); const [loading, setLoading] = useState(true); const [selected, setSelected] = useState(null);
    useEffect(() => { instructorAPI.getCourses().then((response) => setCourses(response.data.data.courses || [])).finally(() => setLoading(false)); }, []);
    if (loading) return <LoadingSpinner />;
    return <div className='space-y-6'><div className='flex justify-between items-center'><div><h1 className='text-2xl font-bold'>My Courses</h1><p className='text-sm' style={{ color: 'var(--text-muted)' }}>Create, build, preview, and submit your courses.</p></div><Link to={`${base}/courses/new`} className='px-4 py-2 rounded-lg text-white gradient-primary'>+ Create New Course</Link></div>
        {courses.length ? <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch'>{courses.map((course) => <div key={course._id} className='space-y-3'><CourseCard course={course} variant='preview' onInfoClick={() => setSelected(course)} /><div className='rounded-xl p-4 flex items-center justify-between gap-3' style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}><div><span className='text-xs uppercase font-bold'>{course.status?.replaceAll('_', ' ')}</span><p className='text-xs' style={{ color: 'var(--text-muted)' }}>Updated {new Date(course.updatedAt).toLocaleDateString()}</p></div><div className='flex flex-col items-end gap-1'><Link to={`${base}/courses/${course._id}/build`} className='text-indigo-600 font-medium'>{['draft', 'changes_requested'].includes(course.status) ? 'Continue Editing' : 'Preview'} →</Link>{course.status !== 'draft' && <Link to={`${base}/courses/${course._id}/reviews`} className='text-xs text-indigo-500'>Review history</Link>}</div></div></div>)}</div> : <div className='text-center py-16 rounded-xl' style={{ background: 'var(--bg-card)' }}><HiOutlineBookOpen className='w-12 h-12 mx-auto mb-3 opacity-40' /><h2 className='font-bold'>No courses yet</h2><p className='mb-4'>Create your first course.</p><Link to={`${base}/courses/new`} className='inline-block px-4 py-2 rounded-lg text-white gradient-primary'>+ Create Course</Link></div>}
        <CourseInfoModal course={selected} onClose={() => setSelected(null)} />
    </div>;
}
