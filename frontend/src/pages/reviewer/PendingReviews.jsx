import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewerAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineCollection } from 'react-icons/hi';

export default function PendingReviews(){
  const [courses,setCourses]=useState(null),[error,setError]=useState('');
  const load=()=>{setError('');reviewerAPI.getPendingCourses().then(r=>setCourses(r.data.data.courses)).catch(e=>setError(e.response?.data?.message||'Unable to load courses'));};
  useEffect(() => { reviewerAPI.getPendingCourses().then(r=>setCourses(r.data.data.courses)).catch(e=>setError(e.response?.data?.message||'Unable to load courses')); }, []);
  if(!courses&&!error)return <div className="reviewer-loading"><LoadingSpinner text="Loading pending reviews..."/></div>;
  return <div className="reviewer-page"><header className="reviewer-header"><span className="reviewer-eyebrow">Review queue</span><h1>Pending Reviews</h1><p>Courses submitted by verified instructors.</p></header>
    {error&&<div className="reviewer-error" role="alert">{error} <button className="reviewer-link" onClick={load}>Try again</button></div>}
    <div className="reviewer-course-list">{courses?.map((c,index)=><article key={c._id} className="reviewer-panel reviewer-course-card" style={{animationDelay:`${index*60}ms`}}><div className="reviewer-course-top"><div><span className="reviewer-eyebrow">{c.category}</span><h2>{c.name}</h2><p>{c.code} · {c.instructor?.firstName} {c.instructor?.lastName}</p></div><span className="reviewer-badge reviewer-badge--pending">{c.status.replaceAll('_',' ')}</span></div><div className="reviewer-course-meta"><span><HiOutlineCollection/>{c.modules?.length||c.chapters?.length||0} chapters/modules</span><span><HiOutlineCalendar/>Submitted {c.submittedAt?new Date(c.submittedAt).toLocaleDateString():'—'}</span><span><HiOutlineAcademicCap/>Updated {new Date(c.updatedAt).toLocaleDateString()}</span></div><Link to={`/reviewer/courses/${c._id}/review`} className="reviewer-button reviewer-button--primary">Review Course <span aria-hidden="true">→</span></Link></article>)}{courses?.length===0&&<div className="reviewer-panel reviewer-empty">No courses are currently waiting for review.</div>}</div>
  </div>;
}
