import { useEffect, useState } from 'react';
import { teacherAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

export default function AssessmentBuilder() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', courseId: '', type: 'practice', description: '', totalMarks: 20, passingMarks: 8, duration: 30, difficulty: 'medium', maxAttempts: 999,
    });
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        teacherAPI.getCourses().then((r) => setCourses(r.data.data.courses || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    const addQuestion = () => {
        setQuestions([...questions, { type: 'mcq', questionText: '', marks: 5, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }] }]);
    };

    const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

    const updateQuestion = (idx, field, value) => {
        const updated = [...questions];
        updated[idx] = { ...updated[idx], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIdx, oIdx, field, value) => {
        const updated = [...questions];
        if (field === 'isCorrect') {
            updated[qIdx].options = updated[qIdx].options.map((o, i) => ({ ...o, isCorrect: i === oIdx }));
        } else {
            updated[qIdx].options[oIdx] = { ...updated[qIdx].options[oIdx], [field]: value };
        }
        setQuestions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questions.length === 0) return toast.error('Add at least one question');
        setSubmitting(true);
        try {
            await teacherAPI.createAssessment({ ...form, questions });
            toast.success('Assessment created!');
            setForm({ title: '', courseId: '', type: 'practice', description: '', totalMarks: 20, passingMarks: 8, duration: 30, difficulty: 'medium', maxAttempts: 999 });
            setQuestions([]);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📝 Assessment Builder</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Meta */}
                <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Assessment Details</h3>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assessment Title" required className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <div className="grid grid-cols-2 gap-3">
                        <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required className="px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                            <option value="">Select Course</option>
                            {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                            <option value="practice">Practice</option>
                            <option value="chapter_test">Chapter Test</option>
                            <option value="final">Final</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: +e.target.value })} placeholder="Total Marks" className="px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        <input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: +e.target.value })} placeholder="Passing" className="px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} placeholder="Duration (min)" className="px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div key={idx} className="rounded-xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-indigo-500">Question {idx + 1}</span>
                                <button type="button" onClick={() => removeQuestion(idx)} className="text-rose-500 hover:text-rose-400"><HiOutlineTrash className="w-4 h-4" /></button>
                            </div>
                            <textarea value={q.questionText} onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)} placeholder="Question text" rows={2} required className="w-full px-4 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                            <input type="number" value={q.marks} onChange={(e) => updateQuestion(idx, 'marks', +e.target.value)} placeholder="Marks" className="w-32 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                            <div className="space-y-2">
                                {q.options.map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-2">
                                        <input type="radio" checked={opt.isCorrect} onChange={() => updateOption(idx, oi, 'isCorrect', true)} className="accent-emerald-500" />
                                        <input value={opt.text} onChange={(e) => updateOption(idx, oi, 'text', e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} required className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addQuestion} className="w-full py-3 rounded-lg text-sm font-medium border-2 border-dashed flex items-center justify-center gap-2" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    <HiOutlinePlus className="w-4 h-4" /> Add Question
                </button>

                <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg text-sm font-semibold text-white gradient-primary hover:opacity-90 disabled:opacity-50">
                    {submitting ? 'Creating...' : 'Create Assessment'}
                </button>
            </form>
        </div>
    );
}
