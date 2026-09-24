import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewerAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { HiOutlineClipboardList, HiOutlineEye, HiOutlineCheckCircle, HiOutlineRefresh, HiOutlineXCircle } from 'react-icons/hi';

function useCountUp(value, duration = 650) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { const reducedFrame = requestAnimationFrame(() => setDisplay(value)); return () => cancelAnimationFrame(reducedFrame); }
    let frame; const start = performance.now();
    const tick = now => { const progress = Math.min((now - start) / duration, 1); setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return display;
}

const labels = { approved: 'Approved', changes_requested: 'Changes Requested', rejected: 'Rejected' };
const StatusBadge = ({ decision }) => <span className={`reviewer-badge reviewer-badge--${decision}`}>{labels[decision] || decision?.replaceAll('_', ' ')}</span>;

export default function ReviewerDashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  const load = () => { setError(''); reviewerAPI.getDashboard().then(r => setData(r.data.data)).catch(e => setError(e.response?.data?.message || 'Unable to load dashboard')); };
  useEffect(() => { reviewerAPI.getDashboard().then(r => setData(r.data.data)).catch(e => setError(e.response?.data?.message || 'Unable to load dashboard')); }, []);
  const stats = data?.stats || {};
  const values = [useCountUp(stats.pendingReviews || 0), useCountUp(stats.underReview || 0), useCountUp(stats.approvedCourses || 0), useCountUp(stats.changesRequested || 0), useCountUp(stats.rejectedCourses || 0)];
  if (!data && !error) return <div className="reviewer-loading"><LoadingSpinner text="Preparing your review workspace..." /></div>;
  if (error) return <div role="alert" className="reviewer-error">{error} <button onClick={load} className="reviewer-link">Try again</button></div>;
  const cards = [['Pending Reviews', values[0], HiOutlineClipboardList, 'amber'], ['Under Review', values[1], HiOutlineEye, 'indigo'], ['Approved', values[2], HiOutlineCheckCircle, 'emerald'], ['Changes Requested', values[3], HiOutlineRefresh, 'cyan'], ['Rejected', values[4], HiOutlineXCircle, 'rose']];
  return <div className="reviewer-page">
    <header className="reviewer-header"><span className="reviewer-eyebrow">Quality workspace</span><h1>Content Reviewer Dashboard</h1><p>Review submitted learning content and maintain quality standards.</p></header>
    <div className="reviewer-stat-grid">{cards.map(([title,value,icon,color], index) => <StatCard key={title} title={title} value={value} icon={icon} color={color} reviewer delay={index * 65} />)}</div>
    <section className="reviewer-panel reviewer-activity-panel"><div className="reviewer-panel-head"><div><span className="reviewer-eyebrow">Latest decisions</span><h2>Recent Review Activity</h2></div><Link className="reviewer-link" to="/reviewer/history">View History <span aria-hidden="true">→</span></Link></div>
      <div className="reviewer-activity-list">{data.recent?.map((r,index)=><article key={r._id} className="reviewer-activity" style={{animationDelay:`${180 + index * 55}ms`}}><div className="reviewer-activity-mark" aria-hidden="true"><HiOutlineClipboardList /></div><div className="reviewer-activity-copy"><p>{r.course?.name}</p><time>{new Date(r.createdAt).toLocaleString()}</time></div><StatusBadge decision={r.decision}/></article>)}{!data.recent?.length&&<p className="reviewer-empty">No reviews completed yet.</p>}</div>
    </section>
  </div>;
}
