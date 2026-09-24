import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReviewerActivity() {
  const { id } = useParams();
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { adminAPI.getReviewerActivity(id).then(r => setData(r.data.data)).catch(e => setError(e.response?.data?.message || 'Unable to load reviewer activity')); }, [id]);
  if (!data && !error) return <LoadingSpinner />;
  if (error) return <p role="alert" className="rounded-xl border p-6">{error}</p>;
  const { reviewer, reviews } = data;
  return <div className="space-y-6"><header><Link to="/admin/reviewers" className="text-sm text-indigo-500">Back to reviewers</Link><h1 className="mt-2 text-2xl font-bold">{reviewer.firstName} {reviewer.lastName}</h1><p style={{color:'var(--text-muted)'}}>{reviewer.email} · {reviewer.isActive ? 'Active' : 'Inactive'} · {reviews.length} reviews</p></header><div className="overflow-x-auto rounded-xl border" style={{borderColor:'var(--border-color)'}}><table className="w-full text-sm"><thead style={{background:'var(--bg-tertiary)'}}><tr>{['Course','Instructor','Attempt','Decision','Comments','Date'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{reviews.map(review=><tr key={review._id} className="border-t" style={{borderColor:'var(--border-color)'}}><td className="p-3 font-medium">{review.course?.name}<small className="block" style={{color:'var(--text-muted)'}}>{review.course?.code}</small></td><td className="p-3">{review.instructor?.firstName} {review.instructor?.lastName}</td><td className="p-3">#{review.submissionNumber}</td><td className="p-3 capitalize">{review.decision.replaceAll('_',' ')}</td><td className="max-w-sm whitespace-pre-wrap p-3">{review.comments || '—'}</td><td className="p-3">{new Date(review.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{!reviews.length&&<p className="p-10 text-center">No review activity yet.</p>}</div></div>;
}