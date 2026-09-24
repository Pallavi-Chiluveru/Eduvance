import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { instructorAPI } from '../../services/apiService';
const steps = ['Basic Info', 'Details', 'Content', 'Preview', 'Submit'];
const fallbackCategories = ['Computer Science', 'Programming', 'Data Science', 'Web Development', 'Aptitude', 'AI', 'Other'];
const fieldClass = 'w-full px-3 py-2.5 rounded-lg outline-none border';

export default function CreateCourse() {
    const navigate = useNavigate();
    const base = '/instructor';
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);
    const [categories, setCategories] = useState(fallbackCategories);
    const [form, setForm] = useState({ name: '', code: '', category: 'Computer Science', description: '', fullDescription: '', difficulty: 'beginner', language: 'English', durationHours: 20, prerequisites: '', learningOutcomes: '' });
    useEffect(() => { instructorAPI.getCategories().then(response => { const names = response.data.data.categories.map(item => item.name); if (names.length) setCategories(names); }).catch(() => {}); }, []);
    const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const next = () => {
        if (![form.name, form.code, form.category, form.description].every((value) => value.trim())) return toast.error('Complete all required fields');
        if (!/^[A-Z0-9-]{2,20}$/.test(form.code)) return toast.error('Use 2–20 letters, numbers, or hyphens for the course code');
        setStep(1);
    };
    const create = async () => {
        const outcomes = form.learningOutcomes.split('\n').map((value) => value.trim()).filter(Boolean);
        const checks = [
            [form.name.trim().length >= 3 && form.name.trim().length <= 120, 'Course title must be 3–120 characters.'],
            [/^[A-Z0-9-]{2,20}$/.test(form.code.trim()), 'Course code must use 2–20 letters, numbers, or hyphens.'],
            [form.description.trim().length >= 10 && form.description.trim().length <= 300, 'Short description must be 10–300 characters.'],
            [form.fullDescription.trim().length >= 20 && form.fullDescription.trim().length <= 3000, 'Full description must be 20–3000 characters.'],
            [form.category.trim().length > 0 && form.category.trim().length <= 100, 'Category must be 1–100 characters.'],
            [form.language.trim().length > 0 && form.language.trim().length <= 50, 'Language must be 1–50 characters.'],
            [Number(form.durationHours) >= 1 && Number(form.durationHours) <= 1000, 'Duration must be between 1 and 1000 hours.'],
            [form.prerequisites.trim().length <= 1000, 'Prerequisites must be at most 1000 characters.'],
            [outcomes.every((value) => value.length <= 300), 'Each learning outcome must be at most 300 characters.'],
        ];
        const invalid = checks.find(([valid]) => !valid);
        if (invalid) return toast.error(invalid[1]);
        setSaving(true);
        try {
            const payload = { ...form, name: form.name.trim(), code: form.code.trim(), category: form.category.trim(), description: form.description.trim(), fullDescription: form.fullDescription.trim(), language: form.language.trim(), prerequisites: form.prerequisites.trim(), durationHours: Number(form.durationHours), learningOutcomes: outcomes };
            const response = await instructorAPI.createCourse(payload);
            const id = response.data.data.course._id;
            if (thumbnail) { const data = new FormData(); data.append('thumbnail', thumbnail); await instructorAPI.uploadCourseThumbnail(id, data); }
            toast.success('Draft created. Add your course content.');
            navigate(`${base}/courses/${id}/build`);
        } catch (error) { const details = error.response?.data?.errors; toast.error(Array.isArray(details) && details.length ? details.join(' ') : error.response?.data?.message || 'Unable to create course'); } finally { setSaving(false); }
    };
    return <div className='max-w-4xl mx-auto space-y-6'><StepIndicator active={step} /><div className='rounded-xl p-6' style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>{step === 0 ? <Basic form={form} change={change} thumbnail={thumbnail} setThumbnail={setThumbnail} categories={categories} /> : <Details form={form} change={change} />}
        <div className='flex justify-between mt-6'><button type='button' disabled={step === 0} onClick={() => setStep(0)} className='px-5 py-2 rounded-lg border'>Back</button>{step === 0 ? <button type='button' onClick={next} className='px-5 py-2 rounded-lg text-white gradient-primary'>Continue to Details</button> : <button type='button' disabled={saving} onClick={create} className='px-5 py-2 rounded-lg text-white gradient-primary'>{saving ? 'Creating…' : 'Create & Add Content'}</button>}</div></div></div>;
}

function StepIndicator({ active }) { return <ol className='grid grid-cols-5 gap-2'>{steps.map((label, index) => <li key={label} className={`text-center text-xs md:text-sm p-2 rounded-lg ${index <= active ? 'gradient-primary text-white' : ''}`} style={index > active ? { background: 'var(--bg-card)', color: 'var(--text-muted)' } : {}}><span className='block font-bold'>{index + 1}</span>{label}</li>)}</ol>; }
function Field({ label, children, wide = false }) { return <label className={`space-y-1 ${wide ? 'md:col-span-2' : ''}`}><span className='text-sm font-medium'>{label}</span>{children}</label>; }
function Basic({ form, change, thumbnail, setThumbnail, categories }) { return <div><h1 className='text-2xl font-bold mb-1'>Basic Information</h1><p className='text-sm mb-6' style={{ color: 'var(--text-muted)' }}>Create the information students will first see.</p><div className='grid md:grid-cols-2 gap-5'><Field label='Course Title *'><input minLength='3' maxLength='120' className={fieldClass} value={form.name} onChange={change('name')} placeholder='Operating Systems' /></Field><Field label='Course Code *'><input className={fieldClass} value={form.code} onChange={(e) => change('code')({ target: { value: e.target.value.toUpperCase() } })} placeholder='OS101' /></Field><Field label='Category *'><select className={fieldClass} value={form.category} onChange={change('category')}>{categories.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label='Course Cover'><input type='file' accept='image/png,image/jpeg,image/webp' className={fieldClass} onChange={(e) => setThumbnail(e.target.files?.[0] || null)} /><small>{thumbnail ? thumbnail.name : 'A polished gradient and course icon will be used by default.'}</small></Field><Field label='Short Description *' wide><textarea rows='4' maxLength='300' className={fieldClass} value={form.description} onChange={change('description')} placeholder='Study of OS concepts including process management, memory management, and file systems.' /></Field></div></div>; }
function Details({ form, change }) { return <div><h1 className='text-2xl font-bold mb-1'>Course Details</h1><p className='text-sm mb-6' style={{ color: 'var(--text-muted)' }}>Give students enough information to understand the course.</p><div className='grid md:grid-cols-2 gap-5'><Field label='Full Course Description *' wide><textarea rows='6' minLength='20' maxLength='3000' className={fieldClass} value={form.fullDescription} onChange={change('fullDescription')} /></Field><Field label='Difficulty *'><select className={fieldClass} value={form.difficulty} onChange={change('difficulty')}>{['beginner', 'intermediate', 'advanced'].map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></Field><Field label='Language *'><input maxLength='50' className={fieldClass} value={form.language} onChange={change('language')} /></Field><Field label='Estimated Duration (Hours) *'><input type='number' min='1' max='1000' className={fieldClass} value={form.durationHours} onChange={change('durationHours')} /></Field><Field label='Prerequisites'><textarea maxLength='1000' className={fieldClass} value={form.prerequisites} onChange={change('prerequisites')} /></Field><Field label='Learning Outcomes (one per line)' wide><textarea rows='4' className={fieldClass} value={form.learningOutcomes} onChange={change('learningOutcomes')} /></Field></div></div>; }
