import { useEffect, useState } from 'react';
import { reviewerAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const labels = { approved: 'Approved', changes_requested: 'Changes Requested', rejected: 'Rejected' };
export default function ReviewHistory(){
  const [reviews,setReviews]=useState(null),[error,setError]=useState('');
  useEffect(()=>{reviewerAPI.getHistory().then(r=>setReviews(r.data.data.reviews)).catch(e=>setError(e.response?.data?.message||'Unable to load history'))},[]);
  if(!reviews&&!error)return <div className="reviewer-loading"><LoadingSpinner text="Loading review history..."/></div>;
  return <div className="reviewer-page"><header className="reviewer-header"><span className="reviewer-eyebrow">Decision archive</span><h1>Review History</h1><p>An immutable record of your course-review decisions.</p></header>{error&&<div className="reviewer-error" role="alert">{error}</div>}<div className="reviewer-panel reviewer-table-wrap"><table className="reviewer-table"><thead><tr>{['Course','Instructor','Submission','Decision','Comments','Date'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{reviews?.map(r=><tr key={r._id}><td className="reviewer-table-title">{r.course?.name}</td><td>{r.instructor?.firstName} {r.instructor?.lastName}</td><td>#{r.submissionNumber}</td><td><span className={`reviewer-badge reviewer-badge--${r.decision}`}>{labels[r.decision]||r.decision.replaceAll('_',' ')}</span></td><td className="reviewer-table-comments">{r.comments||'—'}</td><td>{new Date(r.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{reviews?.length===0&&<p className="reviewer-empty">No review history yet.</p>}</div></div>;
}
