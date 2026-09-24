import { useState } from 'react';
import { HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineInformationCircle, HiOutlinePlus } from 'react-icons/hi';

const topicCountFor = (course) => course?.topicCount ?? (course?.modules?.length ? course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) : course?.topics?.length || course?.chapters?.length || 0);

export default function CourseCard({ course, variant = 'available', progress = 0, onEnroll, onContinue, onInfoClick }) {
    const [imageFailed, setImageFailed] = useState(false);
    const isEnrolled = variant === 'enrolled';
    const isPreview = variant === 'preview';
    const instructor = course?.instructor ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() : 'Instructor';
    const showImage = Boolean(course?.thumbnail) && !imageFailed;
    return <article className='h-full flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1' style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
        <div className={`relative h-40 shrink-0 bg-gradient-to-br ${isEnrolled ? 'from-indigo-500 to-purple-600' : 'from-emerald-500 to-cyan-600'} flex items-center justify-center overflow-hidden`}>
            {showImage ? <img src={course.thumbnail} onError={() => setImageFailed(true)} alt='' className='absolute inset-0 w-full h-full object-cover' /> : null}
            <div className='relative text-center text-white p-4 drop-shadow'><HiOutlineAcademicCap className='w-12 h-12 mx-auto mb-2 opacity-95' /><h3 className='font-bold text-lg line-clamp-2'>{course.name}</h3></div>
            <button type='button' aria-label={`Information about ${course.name}`} onClick={onInfoClick} className='absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30'><HiOutlineInformationCircle className='w-5 h-5 text-white' /></button>
        </div>
        <div className='p-4 flex-1'><p className='text-xs mb-2' style={{ color: 'var(--text-muted)' }}>{course.code}{!isEnrolled ? ` · ${course.category}` : ''}</p><p className='text-sm mb-3 line-clamp-2 min-h-10' style={{ color: 'var(--text-secondary)' }}>{course.description}</p>
            {isEnrolled ? <div className='mb-3'><div className='flex justify-between text-xs mb-1'><span>Progress</span><span className='font-medium'>{progress}%</span></div><div className='h-2 rounded-full' style={{ background: 'var(--bg-tertiary)' }}><div className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600' style={{ width: `${progress}%` }} /></div></div> : null}
            <div className='flex justify-between text-xs' style={{ color: 'var(--text-muted)' }}><span>{topicCountFor(course)} Topics</span><span>👨‍🏫 {instructor}</span></div>
        </div>
        <div className='px-4 pb-4'>{isEnrolled ? <button type='button' onClick={onContinue} className='w-full py-2 rounded-lg text-sm font-medium text-white gradient-primary flex items-center justify-center gap-2'><HiOutlineBookOpen /> Continue Learning</button> : <button type='button' disabled={isPreview} onClick={() => onEnroll?.(course._id)} className='w-full py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-cyan-600 disabled:opacity-70 flex items-center justify-center gap-2'><HiOutlinePlus /> {isPreview ? 'Preview' : 'Enroll Now'}</button>}</div>
    </article>;
}
