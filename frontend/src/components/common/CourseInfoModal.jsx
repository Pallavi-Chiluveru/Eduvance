import { HiOutlineCheckCircle, HiOutlineUserCircle } from 'react-icons/hi';
const topicCountFor = (course) => course?.topicCount ?? (course?.modules?.length ? course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) : course?.topics?.length || course?.chapters?.length || 0);

export default function CourseInfoModal({ course, onClose }) {
    if (!course) return null;
    const language = course.language || 'English';
    const code = language.slice(0, 2).toUpperCase();
    const instructor = course.instructor ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() : 'Instructor';
    return <div role='dialog' aria-modal='true' aria-label={`${course.name} information`} className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}><div className='rounded-xl max-w-md w-full p-6 space-y-4' style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }} onClick={(event) => event.stopPropagation()}>
        <div className='flex justify-between'><h3 className='text-xl font-bold'>{course.name}</h3><button type='button' aria-label='Close' onClick={onClose}>×</button></div>
        <div className='grid grid-cols-3 gap-4 py-4 border-y'><Metric label='TOPICS' value={topicCountFor(course)} /><Metric label='DURATION' value={course.durationHours || '—'} suffix='Hours' /><Metric label='LANGUAGE' value={code} suffix={language} /></div>
        <div className='grid grid-cols-2 gap-4'><Info icon={<HiOutlineCheckCircle className='w-6 h-6 text-emerald-500' />} label='STATUS' value={course.status === 'published' ? 'Active' : course.status?.replaceAll('_', ' ')} /><Info icon={<HiOutlineUserCircle className='w-6 h-6 text-indigo-500' />} label='INSTRUCTOR' value={instructor} /></div>
        <div><p className='text-sm font-medium mb-2'>Description</p><p className='text-sm' style={{ color: 'var(--text-secondary)' }}>{course.fullDescription || course.description}</p></div>
    </div></div>;
}

function Metric({ label, value, suffix }) { return <div className='text-center'><p className='text-xs'>{label}</p><p className='text-2xl font-bold'>{value}</p>{suffix ? <p className='text-xs'>{suffix}</p> : null}</div>; }
function Info({ icon, label, value }) { return <div className='text-center p-3 rounded-lg' style={{ background: 'var(--bg-tertiary)' }}><div className='flex justify-center'>{icon}</div><p className='text-xs'>{label}</p><p className='text-sm font-medium capitalize'>{value}</p></div>; }
