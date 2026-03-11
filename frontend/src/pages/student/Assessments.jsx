import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { studentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineClipboardCheck, HiOutlineClock, HiOutlinePlay } from 'react-icons/hi';

export default function StudentAssessments() {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTest, setActiveTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [reviewData, setReviewData] = useState(null);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await studentAPI.getAssessments({ type: 'final' });
                const loadedAssessments = res.data.data.assessments || [];
                console.log('Loaded Assessments:', loadedAssessments); // DEBUG: Check if latestScore and attempts are present
                setAssessments(loadedAssessments);

                // Check for auto-start
                const startId = searchParams.get('start');
                if (startId) {
                    const found = loadedAssessments.find(a => a._id === startId);
                    if (found) {
                        startTest(found);
                    }
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [searchParams]);

    const startTest = async (assessment) => {
        try {
            const res = await studentAPI.getQuestions(assessment._id);
            setQuestions(res.data.data.questions || []);
            setActiveTest(assessment);
            setAnswers({});
            setReviewData(null);
        } catch (err) {
            toast.error('Failed to load questions');
        }
    };

    const viewReview = async (submissionId) => {
        setLoading(true);
        try {
            const res = await studentAPI.getSubmissionReview(submissionId);
            setReviewData(res.data.data.submission);
        } catch (err) {
            toast.error('Failed to load review data');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (qId, value) => {
        setAnswers((prev) => ({ ...prev, [qId]: value }));
    };

    const submitTest = async () => {
        setSubmitting(true);
        try {
            const ansArr = questions.map((q) => ({
                question: q._id,
                ...(q.type === 'mcq'
                    ? { selectedOption: answers[q._id] ?? -1 }
                    : { answerText: answers[q._id] || '' }),
            }));
            const res = await studentAPI.submitTest({
                assessmentId: activeTest._id,
                answers: ansArr,
                timeTaken: 0,
            });
            const result = res.data.data;
            toast.success(`Submitted! Score: ${result.percentage}%`);
            setActiveTest(null);
            setQuestions([]);
            setAnswers({});
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    // If taking a test
    if (activeTest) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeTest.title}</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {questions.length} questions · {activeTest.duration} min · {activeTest.totalMarks} marks
                        </p>
                    </div>
                    <button onClick={() => setActiveTest(null)} className="text-sm text-red-500 hover:text-red-400">Cancel</button>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div
                            key={q._id}
                            className="rounded-xl p-5"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                        >
                            <p className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                                <span className="text-indigo-500 font-bold">Q{idx + 1}.</span> {q.questionText}
                            </p>
                            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    q.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>{q.difficulty}</span>
                                <span>{q.marks} marks</span>
                            </div>

                            {q.type === 'mcq' ? (
                                <div className="space-y-2">
                                    {q.options?.map((opt, oi) => (
                                        <label
                                            key={oi}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${answers[q._id] === oi ? 'ring-2 ring-indigo-500' : ''
                                                }`}
                                            style={{ background: answers[q._id] === oi ? 'rgba(99,102,241,0.1)' : 'var(--bg-tertiary)' }}
                                        >
                                            <input
                                                type="radio"
                                                name={q._id}
                                                checked={answers[q._id] === oi}
                                                onChange={() => handleAnswer(q._id, oi)}
                                                className="accent-indigo-500"
                                            />
                                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{opt.text}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    value={answers[q._id] || ''}
                                    onChange={(e) => handleAnswer(q._id, e.target.value)}
                                    rows={4}
                                    placeholder="Write your answer here..."
                                    className="w-full p-3 rounded-lg text-sm outline-none resize-y focus:ring-2 focus:ring-indigo-500"
                                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={submitTest}
                    disabled={submitting}
                    className="w-full py-3 rounded-lg text-sm font-semibold text-white gradient-primary hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {submitting ? 'Submitting...' : 'Submit Test'}
                </button>
            </div>
        );
    }

    // If viewing review
    if (reviewData) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <div className="flex items-center justify-between sticky top-0 bg-[var(--bg-main)] py-4 z-10">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Review: {reviewData.assessment?.title}</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Score: <span className="font-bold text-indigo-500">{reviewData.totalMarks} / {reviewData.assessment?.totalMarks} ({reviewData.percentage}%)</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setReviewData(null)}
                        className="px-4 py-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all font-medium"
                    >
                        Back to List
                    </button>
                </div>

                <div className="space-y-6">
                    {reviewData.answers?.map((ans, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl overflow-hidden shadow-sm animate-slide-up"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                        >
                            <div className="p-5">
                                <p className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                                    <span className="text-indigo-500 mr-2">Q{idx + 1}.</span> {ans.questionId?.questionText}
                                </p>

                                {ans.questionId?.type === 'mcq' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {ans.questionId.options?.map((opt, oi) => {
                                            const isSelected = ans.selectedOption === oi;
                                            const isCorrect = opt.isCorrect;
                                            let borderStyle = 'border-[var(--border-color)]';
                                            let bgStyle = 'var(--bg-tertiary)';
                                            let textColor = 'var(--text-primary)';

                                            if (isCorrect) {
                                                borderStyle = 'border-emerald-500';
                                                bgStyle = 'rgba(16, 185, 129, 0.1)';
                                            } else if (isSelected && !isCorrect) {
                                                borderStyle = 'border-rose-500';
                                                bgStyle = 'rgba(244, 63, 94, 0.1)';
                                            }

                                            return (
                                                <div
                                                    key={oi}
                                                    className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${borderStyle}`}
                                                    style={{ background: bgStyle }}
                                                >
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCorrect ? 'bg-emerald-500 text-white' :
                                                        isSelected ? 'bg-rose-500 text-white' : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)]'
                                                        }`}>
                                                        {String.fromCharCode(65 + oi)}
                                                    </div>
                                                    <span className="text-sm" style={{ color: textColor }}>{opt.text}</span>
                                                    {isSelected && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">(Your Choice)</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Answer</p>
                                            <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>{ans.answerText || 'No answer provided'}</p>
                                        </div>
                                    </div>
                                )}

                                {ans.questionId?.explanation && (
                                    <div className="mt-6 p-4 rounded-xl border-l-4 border-indigo-500" style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            💡 Explanation
                                        </p>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            {ans.questionId.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const typeColors = {
        practice: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        chapter_test: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        final: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📝 Assessments</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {assessments.map((a) => (
                    <div
                        key={a._id}
                        className="rounded-xl p-5 animate-slide-up"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.title}</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.course?.name}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${typeColors[a.type]}`}>
                                {a.type.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <div className="flex items-center gap-2"><HiOutlineClock className="w-4 h-4" />{a.duration} minutes</div>
                            <div className="flex items-center gap-2"><HiOutlineClipboardCheck className="w-4 h-4" />{a.totalMarks} marks (pass: {a.passingMarks})</div>
                            <div>Attempts: {a.attempts || 0} / {a.maxAttempts >= 999 ? '∞' : a.maxAttempts}</div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => startTest(a)}
                                disabled={a.attempts > 0 || (a.attempts >= a.maxAttempts && a.maxAttempts < 999)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-all ${a.attempts > 0
                                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                    : 'gradient-primary hover:opacity-90'
                                    }`}
                            >
                                <HiOutlinePlay className="w-4 h-4" />
                                Start Test
                            </button>
                            {a.attempts > 0 && a.latestSubmissionId && (
                                <button
                                    onClick={() => viewReview(a.latestSubmissionId)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <HiOutlineClipboardCheck className="w-4 h-4" />
                                    Review
                                </button>
                            )}
                        </div>
                        {a.attempts > 0 && (
                            <div className="mt-2 text-center border-t border-[var(--border-color)] pt-2">
                                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                    Latest: <span className="text-indigo-500">{a.obtainedMarks} / {a.totalMarks}</span>
                                    <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500">{a.latestScore}%</span>
                                </span>
                            </div>
                        )}
                    </div>
                ))}
                {assessments.length === 0 && (
                    <div className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>
                        No assessments available yet.
                    </div>
                )}
            </div>
        </div>
    );
}
