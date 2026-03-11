import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SecurePDFViewer from '../../components/common/SecurePDFViewer';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlinePlay, HiOutlineDocumentText, HiOutlineClipboardList, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

export default function CourseDetail() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lectures, setLectures] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('topics');
    const [selectedPDF, setSelectedPDF] = useState(null);
    const [expandedTopics, setExpandedTopics] = useState({});
    const [assessments, setAssessments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            const [courseRes, lecturesRes, assessmentsRes] = await Promise.all([
                studentAPI.getCourses(),
                studentAPI.getLectures(courseId),
                studentAPI.getAssessments({ type: 'practice,topic_test' }),
            ]);

            const courseData = courseRes.data.data.enrollments.find(
                e => e.course._id === courseId
            );
            setCourse(courseData);
            setLectures(lecturesRes.data.data.lectures);

            // Filter assessments
            const allAssessments = assessmentsRes.data.data.assessments || [];
            const courseAssessments = allAssessments.filter(
                a => (a.course._id || a.course) === courseId
            );
            setAssessments(courseAssessments);

            // Expand first topic by default
            const firstTopic = Object.keys(lecturesRes.data.data.lectures)[0];
            if (firstTopic) {
                setExpandedTopics({ [firstTopic]: true });
            }
        } catch (err) {
            console.error('Failed to load course:', err);
            toast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const toggleTopic = (topic) => {
        setExpandedTopics(prev => ({
            ...prev,
            [topic]: !prev[topic]
        }));
    };

    if (loading) return <LoadingSpinner />;

    if (!course) {
        return (
            <div className="text-center py-12">
                <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Course not found</p>
                <Link to="/student/courses" className="text-indigo-500 mt-2 inline-block">← Back to Courses</Link>
            </div>
        );
    }

    const topics = Object.keys(lectures).sort((a, b) => a.localeCompare(b));
    const allLectures = Object.values(lectures).flat();
    const videoLectures = allLectures.filter(l => l.type === 'video');
    const pdfLectures = allLectures.filter(l => l.type === 'pdf' || l.type === 'document');

    return (
        <>
            <div className="space-y-6">
                {/* Breadcrumb */}
                <Link to="/student/courses" className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Back to Courses
                </Link>

                {/* Course Header */}
                <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                {course.course?.name}
                            </h1>
                            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                                {course.course?.code} • {course.course?.teacher?.firstName} {course.course?.teacher?.lastName}
                            </p>
                            {course.course?.description && (
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {course.course.description}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Progress</p>
                            <p className="text-3xl font-bold text-indigo-500">{course.progress || 0}%</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <TabButton
                        active={activeTab === 'topics'}
                        onClick={() => setActiveTab('topics')}
                        label="Topics"
                        count={topics.length}
                    />
                    <TabButton
                        active={activeTab === 'quizzes'}
                        onClick={() => setActiveTab('quizzes')}
                        label="Quizzes"
                        count={assessments.length}
                    />
                    <TabButton
                        active={activeTab === 'pdfs'}
                        onClick={() => setActiveTab('pdfs')}
                        label="PDFs"
                        count={pdfLectures.length}
                    />
                </div>

                {/* Content */}
                {activeTab === 'topics' && (
                    <div className="space-y-3">
                        {topics.length === 0 ? (
                            <EmptyState message="No topics available yet" />
                        ) : (
                            topics.map((topic) => (
                                <TopicSection
                                    key={topic}
                                    topic={topic}
                                    lectures={lectures[topic]}
                                    expanded={expandedTopics[topic]}
                                    onToggle={() => toggleTopic(topic)}
                                    getYouTubeEmbedUrl={getYouTubeEmbedUrl}
                                    onPDFClick={setSelectedPDF}
                                />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'quizzes' && (
                    <div className="space-y-4">
                        {assessments.length === 0 ? (
                            <EmptyState message="No quizzes available yet" icon={HiOutlineClipboardList} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assessments.map((a) => (
                                    <div
                                        key={a._id}
                                        className="rounded-xl p-5"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${a.type === 'practice' ? 'bg-emerald-100 text-emerald-700' :
                                                a.type === 'chapter_test' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {a.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                                            <div className="flex items-center gap-2"><HiOutlinePlay className="w-4 h-4" />{a.duration} mins</div>
                                            <div className="flex items-center gap-2"><HiOutlineClipboardList className="w-4 h-4" />{a.totalMarks} marks</div>
                                            <div>Attempts: {a.attempts || 0} / {a.maxAttempts >= 999 ? '∞' : a.maxAttempts}</div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/student/assessments?start=${a._id}`)}
                                            className="w-full py-2 rounded-lg text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
                                        >
                                            {a.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pdfs' && (
                    <div className="space-y-3">
                        {pdfLectures.length === 0 ? (
                            <EmptyState message="No PDFs available yet" icon={HiOutlineDocumentText} />
                        ) : (
                            pdfLectures.map((lecture) => (
                                <PDFListItem
                                    key={lecture._id}
                                    lecture={lecture}
                                    onView={() => setSelectedPDF(lecture)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Secure PDF Viewer */}
            {selectedPDF && (
                <SecurePDFViewer
                    lectureId={selectedPDF._id}
                    role="student"
                    title={selectedPDF.title}
                    onClose={() => setSelectedPDF(null)}
                />
            )}
        </>
    );
}

function TabButton({ active, onClick, label, count }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${active
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent hover:border-gray-300'
                }`}
            style={{ color: active ? undefined : 'var(--text-muted)' }}
        >
            {label} {count > 0 && `(${count})`}
        </button>
    );
}

function TopicSection({ topic, lectures, expanded, onToggle, getYouTubeEmbedUrl, onPDFClick }) {
    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
            {/* Topic Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                        <HiOutlineDocumentText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {topic}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {lectures.length} {lectures.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <HiOutlineChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                ) : (
                    <HiOutlineChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                )}
            </button>

            {/* Topic Content */}
            {expanded && (
                <div className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                    {lectures.map((lecture, idx) => (
                        <LectureListItem
                            key={lecture._id}
                            lecture={lecture}
                            index={idx + 1}
                            getYouTubeEmbedUrl={getYouTubeEmbedUrl}
                            onPDFClick={onPDFClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function LectureListItem({ lecture, index, getYouTubeEmbedUrl, onPDFClick }) {
    const [showVideo, setShowVideo] = useState(false);
    const embedUrl = lecture.type === 'video' ? getYouTubeEmbedUrl(lecture.videoUrl) : null;

    return (
        <div className="border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="flex items-start gap-3">
                    {/* Index */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        {index}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {lecture.title}
                                </h4>
                                {lecture.description && (
                                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        {lecture.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {lecture.type === 'video' ? (
                                        <>
                                            <span className="flex items-center gap-1">
                                                <HiOutlinePlay className="w-4 h-4" /> Video
                                            </span>
                                            {lecture.duration && <span>{lecture.duration}</span>}
                                        </>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <HiOutlineDocumentText className="w-4 h-4" /> Document
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            {lecture.type === 'video' && embedUrl ? (
                                <button
                                    onClick={() => {
                                        if (!showVideo) {
                                            studentAPI.viewLecture(lecture._id).catch(console.error);
                                        }
                                        setShowVideo(!showVideo);
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 transition-colors flex items-center gap-2"
                                >
                                    <HiOutlinePlay className="w-4 h-4" />
                                    {showVideo ? 'Hide' : 'Watch'}
                                </button>
                            ) : lecture.fileUrl ? (
                                <button
                                    onClick={() => {
                                        studentAPI.viewLecture(lecture._id).catch(console.error);
                                        onPDFClick(lecture);
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors flex items-center gap-2"
                                >
                                    <HiOutlineDocumentText className="w-4 h-4" />
                                    View
                                </button>
                            ) : null}
                        </div>

                        {/* Video Player */}
                        {lecture.type === 'video' && embedUrl && showVideo && (
                            <div className="mt-3 rounded-lg overflow-hidden" style={{ background: '#000' }}>
                                <iframe
                                    width="100%"
                                    height="400"
                                    src={embedUrl}
                                    title={lecture.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PDFListItem({ lecture, onView }) {
    return (
        <div
            className="rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            onClick={() => {
                studentAPI.viewLecture(lecture._id).catch(console.error);
                onView(lecture);
            }}
        >
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <HiOutlineDocumentText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {lecture.title}
                    </h4>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        Topic: {lecture.topic}
                    </p>
                    {lecture.description && (
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {lecture.description}
                        </p>
                    )}
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors">
                    View
                </button>
            </div>
        </div>
    );
}

function EmptyState({ message, icon: Icon = HiOutlineDocumentText }) {
    return (
        <div className="text-center py-16 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Icon className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{message}</p>
        </div>
    );
}
