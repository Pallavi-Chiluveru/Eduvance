import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { studentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CourseCard from '../../components/common/CourseCard';
import CourseInfoModal from '../../components/common/CourseInfoModal';

export default function StudentCourses() {
    const navigate = useNavigate();
    const [enrolled, setEnrolled] = useState([]);
    const [available, setAvailable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('enrolled');
    const [selected, setSelected] = useState(null);
    const load = async () => {
        try { const [myCourses, catalog] = await Promise.all([studentAPI.getCourses(), studentAPI.getAvailableCourses()]); setEnrolled(myCourses.data.data.enrollments || []); setAvailable(catalog.data.data.courses || []); }
        catch { toast.error('Unable to load courses'); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);
    const enroll = async (id) => { try { await studentAPI.enrollCourse(id); toast.success('Enrolled successfully'); await load(); setTab('enrolled'); } catch (error) { toast.error(error.response?.data?.message || 'Enrollment failed'); } };
    if (loading) return <LoadingSpinner />;
    const items = tab === 'enrolled' ? enrolled : available;
    return <div className='space-y-6'><h1 className='text-2xl font-bold'>📚 Courses</h1><div className='flex gap-2'>{['enrolled', 'available'].map((value) => <button key={value} onClick={() => setTab(value)} className={`px-4 py-2 rounded-lg ${tab === value ? 'gradient-primary text-white' : ''}`}>{value === 'enrolled' ? `My Courses (${enrolled.length})` : `Available (${available.length})`}</button>)}</div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch'>{items.map((item) => { const course = item.course || item; return <CourseCard key={item._id} course={course} variant={tab === 'enrolled' ? 'enrolled' : 'available'} progress={item.progress || 0} onInfoClick={() => setSelected(course)} onEnroll={enroll} onContinue={() => navigate(`/student/courses/${course._id}`)} />; })}{items.length === 0 ? <div className='col-span-full text-center py-12' style={{ color: 'var(--text-muted)' }}><HiOutlineBookOpen className='w-12 h-12 mx-auto mb-3 opacity-40' /><p>{tab === 'enrolled' ? 'No enrolled courses yet.' : 'No courses are currently available.'}</p></div> : null}</div>
        <CourseInfoModal course={selected} onClose={() => setSelected(null)} />
    </div>;
}
