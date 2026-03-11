import { useEffect, useState } from 'react';
import { studentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineRefresh, HiOutlineLightBulb, HiOutlineAcademicCap, HiOutlineClock, HiOutlineX } from 'react-icons/hi';

export default function StudentFlashcards() {
    const [data, setData] = useState({ flashcards: [], dueCount: 0, totalCount: 0 });
    const [loading, setLoading] = useState(true);
    const [flipped, setFlipped] = useState({});
    const [showCreate, setShowCreate] = useState(false);
    const [studyMode, setStudyMode] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [form, setForm] = useState({ front: '', back: '', chapter: '' });

    const load = async () => {
        try {
            const res = await studentAPI.getFlashcards();
            setData(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleFlip = (id) => setFlipped((p) => ({ ...p, [id]: !p[id] }));

    const handleReview = async (id, quality) => {
        try {
            await studentAPI.reviewFlashcard(id, { quality });
            toast.success('Progress saved!');
            if (studyMode) {
                if (currentIndex < dueCards.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setFlipped({ [dueCards[currentIndex + 1]._id]: false });
                } else {
                    setStudyMode(false);
                }
            }
            load();
        } catch (err) { toast.error('Failed to save progress'); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await studentAPI.createFlashcard(form);
            toast.success('Flashcard created!');
            setShowCreate(false);
            setForm({ front: '', back: '', chapter: '' });
            load();
        } catch (err) { toast.error('Creation failed'); }
    };

    if (loading) return <LoadingSpinner />;

    const { flashcards, dueCount } = data;
    const dueCards = (flashcards || []).filter(fc => new Date(fc.nextReview) <= new Date());

    // Mastery stats
    const mastered = flashcards.filter(f => f.interval > 21).length;
    const learning = flashcards.filter(f => f.interval <= 7).length;
    const reviewing = flashcards.length - mastered - learning;

    const currentCard = studyMode ? dueCards[currentIndex] : null;

    return (
        <div className="space-y-8 pb-12">
            <style>
                {`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                `}
            </style>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🃏 Smart Flashcards</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Science-based Spaced Repetition (SM-2 Algorithm)</p>
                </div>
                <div className="flex gap-2">
                    {dueCards.length > 0 && !studyMode && (
                        <button
                            onClick={() => { setStudyMode(true); setCurrentIndex(0); setFlipped({}); }}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white gradient-primary shadow-lg shadow-indigo-500/20"
                        >
                            <HiOutlineAcademicCap className="w-5 h-5" /> Study Due ({dueCards.length})
                        </button>
                    )}
                    <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                        <HiOutlinePlus className="w-4 h-4" /> Create New
                    </button>
                </div>
            </header>

            {/* Mastery Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Learning', count: learning, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Reviewing', count: reviewing, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Mastered', count: mastered, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stat.bg} ${stat.color}`}>{Math.round((stat.count / flashcards.length || 0) * 100)}%</span>
                        </div>
                        <div className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.count}</div>
                    </div>
                ))}
            </div>

            {studyMode && currentCard ? (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
                    <button
                        onClick={() => setStudyMode(false)}
                        className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors"
                    >
                        <HiOutlineX className="w-8 h-8" />
                    </button>

                    <div className="w-full max-w-lg">
                        <div className="flex justify-between items-end mb-4 px-2">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Studying: {currentCard.chapter || 'General'}</span>
                            <span className="text-indigo-400 text-sm font-black">{currentIndex + 1} / {dueCards.length}</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-8">
                            <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}></div>
                        </div>

                        <div
                            onClick={() => handleFlip(currentCard._id)}
                            className="perspective-1000 w-full aspect-[4/3] cursor-pointer"
                        >
                            <div className={`relative w-full h-full text-center transition-transform duration-700 preserve-3d ${flipped[currentCard._id] ? 'rotate-y-180' : ''}`}>
                                {/* Front */}
                                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-12 rounded-3xl bg-white shadow-2xl">
                                    <div className="text-indigo-500/20 mb-4"><HiOutlineLightBulb className="w-16 h-16" /></div>
                                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">{currentCard.front}</h2>
                                    <p className="mt-8 text-xs text-indigo-500/50 font-bold uppercase tracking-widest">Click to reveal answer</p>
                                </div>
                                {/* Back */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-12 rounded-3xl bg-indigo-600 shadow-2xl">
                                    <h2 className="text-2xl font-medium text-white leading-relaxed">{currentCard.back}</h2>
                                    <p className="mt-8 text-xs text-white/40 font-bold uppercase tracking-widest italic">How was it?</p>
                                </div>
                            </div>
                        </div>

                        {flipped[currentCard._id] && (
                            <div className="grid grid-cols-3 gap-4 mt-8 animate-slide-up">
                                {[
                                    { q: 1, label: 'Hard', cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
                                    { q: 3, label: 'Good', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                                    { q: 5, label: 'Easy', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                                ].map((b) => (
                                    <button
                                        key={b.q}
                                        onClick={(e) => { e.stopPropagation(); handleReview(currentCard._id, b.q); }}
                                        className={`py-4 rounded-2xl border text-sm font-bold transition-all active:scale-95 hover:bg-white hover:text-black hover:border-white ${b.cls}`}
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {showCreate && (
                        <form onSubmit={handleCreate} className="rounded-2xl p-6 space-y-4 shadow-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Generate New Flashcard</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} placeholder="Subject/Chapter (e.g. DBMS Indexing)" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                            </div>
                            <textarea value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} placeholder="Front (The Question)" rows={3} required className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-indigo-500/20" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                            <textarea value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} placeholder="Back (The Answer)" rows={3} required className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-indigo-500/20" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 rounded-xl text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Cancel</button>
                                <button type="submit" className="px-8 py-2 rounded-xl text-sm font-bold text-white gradient-primary">Save to Desk</button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {flashcards.map((fc) => (
                            <div
                                key={fc._id}
                                onClick={() => handleFlip(fc._id)}
                                className="perspective-1000 group relative h-64 w-full cursor-pointer"
                            >
                                <div className={`relative h-full w-full transition-transform duration-700 preserve-3d ${flipped[fc._id] ? 'rotate-y-180' : ''}`}>
                                    {/* Front Side */}
                                    <div className="absolute inset-0 backface-hidden p-6 rounded-2xl shadow-sm border flex flex-col justify-between" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <HiOutlineClock className={`w-4 h-4 ${new Date(fc.nextReview) <= new Date() ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{fc.chapter || 'Chapter'}</span>
                                                </div>
                                                {new Date(fc.nextReview) <= new Date() && (
                                                    <span className="text-[10px] font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">DUE</span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold line-clamp-4 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{fc.front}</p>
                                        </div>
                                        <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                            FLIP FOR ANSWER
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-2xl shadow-xl flex flex-col justify-between bg-indigo-600 border border-indigo-500">
                                        <p className="text-sm font-medium text-white/90 leading-relaxed overflow-y-auto custom-scrollbar">{fc.back}</p>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                            <span className="text-[10px] text-white/40 font-bold tracking-widest">REVIEWED {fc.reviewCount}x</span>
                                            <span className="text-[10px] text-white/80 font-bold">NEXT: {new Date(fc.nextReview).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {flashcards.length === 0 && (
                        <div className="text-center py-24 rounded-3xl border-2 border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                            <HiOutlineLightBulb className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
                            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your Desk is Empty</h3>
                            <p className="text-sm px-8" style={{ color: 'var(--text-muted)' }}>Create flashcards to start mastering your subjects with spaced repetition.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
