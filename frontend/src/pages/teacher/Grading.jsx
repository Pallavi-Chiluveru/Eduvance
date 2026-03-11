import { useEffect, useState } from 'react';
import { teacherAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Grading() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState(null);
    const [marks, setMarks] = useState({});

    const load = async () => {
        try {
            const res = await teacherAPI.getSubmissions('pending');
            setSubmissions(res.data.data.submissions || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleGrade = async (submissionId) => {
        try {
            const gradedAnswers = Object.entries(marks).map(([qId, m]) => ({
                questionId: qId,
                marksAwarded: Number(m)
            }));
            await teacherAPI.gradeSubmission(submissionId, { answers: gradedAnswers });
            toast.success('Graded successfully!');
            setGrading(null);
            setMarks({});
            load();
        } catch (err) {
            console.error(err);
            toast.error('Grading failed');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>✅ Grading</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{submissions.length} pending submission(s)</p>

            {grading ? (
                <div className="rounded-xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{grading.assessment?.title}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Student: {grading.student?.firstName} {grading.student?.lastName}</p>
                        </div>
                        <button onClick={() => { setGrading(null); setMarks({}); }} className="text-sm text-red-500">Cancel</button>
                    </div>
                    <div className="space-y-3">
                        {grading.answers?.map((a, i) => (
                            <div key={i} className="p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Q{i + 1}: {a.question?.questionText}</p>
                                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Answer: {a.answerText || `Option ${String.fromCharCode(65 + (a.selectedOption || 0))}`}
                                </p>
                                {a.question?.type === 'descriptive' && (
                                    <input
                                        type="number"
                                        value={marks[a.question?._id] || ''}
                                        onChange={(e) => setMarks({ ...marks, [a.question?._id]: e.target.value })}
                                        placeholder={`Marks (max ${a.question?.marks})`}
                                        className="px-3 py-1.5 rounded-lg text-sm outline-none w-40"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => handleGrade(grading._id)} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white gradient-primary hover:opacity-90">
                        Submit Grades
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {submissions.map((s) => (
                        <div key={s._id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            <div>
                                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{s.assessment?.title}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {s.student?.firstName} {s.student?.lastName} · {new Date(s.submittedAt || s.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => setGrading(s)} className="px-4 py-2 rounded-lg text-xs font-medium text-white gradient-primary hover:opacity-90">
                                Grade
                            </button>
                        </div>
                    ))}
                    {submissions.length === 0 && (
                        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                            <p>No pending submissions to grade 🎉</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
