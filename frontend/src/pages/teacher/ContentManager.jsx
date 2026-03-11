import { useEffect, useState } from 'react';
import { teacherAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SecurePDFViewer from '../../components/common/SecurePDFViewer';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlinePlay, HiOutlineDocumentText, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';

export default function ContentManager() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [lectures, setLectures] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedPDF, setSelectedPDF] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        topic: '',
        type: 'video',
        videoUrl: '',
        description: '',
        duration: '',
    });
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            loadLectures();
        }
    }, [selectedCourse]);

    // Update preview when video URL changes
    useEffect(() => {
        if (formData.type === 'video' && formData.videoUrl) {
            const embedUrl = getYouTubeEmbedUrl(formData.videoUrl);
            setPreviewUrl(embedUrl);
        } else {
            setPreviewUrl('');
        }
    }, [formData.videoUrl, formData.type]);

    const loadCourses = async () => {
        try {
            const res = await teacherAPI.getCourses();
            setCourses(res.data.data.courses || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const loadLectures = async () => {
        try {
            const res = await teacherAPI.getLectures(selectedCourse);
            setLectures(res.data.data.lectures || {});
        } catch (err) {
            console.error(err);
            toast.error('Failed to load lectures');
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('course', selectedCourse);
            data.append('topic', formData.topic);
            data.append('type', formData.type);
            data.append('description', formData.description);
            data.append('duration', formData.duration);

            if (formData.type === 'video') {
                if (!formData.videoUrl) {
                    toast.error('Please enter a YouTube URL');
                    setUploading(false);
                    return;
                }
                data.append('videoUrl', formData.videoUrl);
            } else if (file) {
                data.append('file', file);
            } else {
                toast.error('Please select a file');
                setUploading(false);
                return;
            }

            await teacherAPI.uploadLecture(data);
            toast.success('Content uploaded successfully!');
            setShowForm(false);
            resetForm();
            loadLectures();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to upload content');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (lectureId) => {
        if (!window.confirm('Are you sure you want to delete this content?')) return;

        try {
            await teacherAPI.deleteLecture(lectureId);
            toast.success('Content deleted');
            loadLectures();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete content');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            topic: '',
            type: 'video',
            videoUrl: '',
            description: '',
            duration: '',
        });
        setFile(null);
        setPreviewUrl('');
    };

    if (loading) return <LoadingSpinner />;

    const selectedCourseObj = courses.find(c => c._id === selectedCourse);
    const topics = Object.keys(lectures).sort((a, b) => a.localeCompare(b));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📤 Content Manager</h1>
                {selectedCourse && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white gradient-primary hover:opacity-90 transition-opacity"
                    >
                        <HiOutlineUpload className="w-4 h-4" />
                        {showForm ? 'Cancel' : 'Add Content'}
                    </button>
                )}
            </div>

            {/* Course Selector */}
            <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Select Course
                </label>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                        background: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                    }}
                >
                    <option value="">-- Select a course --</option>
                    {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name} ({c.code})
                        </option>
                    ))}
                </select>
            </div>

            {/* Upload Form */}
            {showForm && selectedCourse && (
                <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Upload New Content</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                Content Type *
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="video"
                                        checked={formData.type === 'video'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="text-indigo-500"
                                    />
                                    <HiOutlinePlay className="w-5 h-5 text-rose-500" />
                                    <span style={{ color: 'var(--text-primary)' }}>YouTube Video</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="pdf"
                                        checked={formData.type === 'pdf'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="text-indigo-500"
                                    />
                                    <HiOutlineDocumentText className="w-5 h-5 text-indigo-500" />
                                    <span style={{ color: 'var(--text-primary)' }}>PDF/Document</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border"
                                    style={{
                                        background: 'var(--bg-tertiary)',
                                        borderColor: 'var(--border-color)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="e.g., Introduction to Programming"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Topic *
                                </label>
                                {selectedCourseObj?.chapters?.length > 0 ? (
                                    <select
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border"
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            borderColor: 'var(--border-color)',
                                            color: 'var(--text-primary)',
                                        }}
                                        required
                                    >
                                        <option value="">Select Topic</option>
                                        {selectedCourseObj.chapters.map((ch, idx) => (
                                            <option key={idx} value={ch.title}>
                                                {ch.title}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border"
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            borderColor: 'var(--border-color)',
                                            color: 'var(--text-primary)',
                                        }}
                                        placeholder="e.g., Introduction to Programming"
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        {formData.type === 'video' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                        YouTube URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.videoUrl}
                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border"
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            borderColor: 'var(--border-color)',
                                            color: 'var(--text-primary)',
                                        }}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        required
                                    />
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        Paste the full YouTube video URL
                                    </p>
                                </div>

                                {/* YouTube Preview */}
                                {previewUrl && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <HiOutlineEye className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                                            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                Preview
                                            </label>
                                        </div>
                                        <div className="rounded-lg overflow-hidden" style={{ background: '#000' }}>
                                            <iframe
                                                width="100%"
                                                height="315"
                                                src={previewUrl}
                                                title="YouTube Preview"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Upload PDF/Document *
                                </label>
                                <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: 'var(--border-color)' }}>
                                    <HiOutlineUpload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="text-sm"
                                        required
                                    />
                                    {file && (
                                        <p className="text-sm mt-2 font-medium text-emerald-500">
                                            ✓ {file.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border"
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)',
                                }}
                                rows="3"
                                placeholder="Brief description about this content..."
                            />
                        </div>

                        {formData.type === 'video' && (
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Duration (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border"
                                    style={{
                                        background: 'var(--bg-tertiary)',
                                        borderColor: 'var(--border-color)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="e.g., 15:30"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload Content'}
                        </button>
                    </form>
                </div>
            )}

            {/* Content List */}
            {selectedCourse && (
                <div className="space-y-4">
                    {topics.length === 0 ? (
                        <div className="text-center py-12 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                            <HiOutlineDocumentText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No content yet</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                Click "Add Content" to upload your first video or document
                            </p>
                        </div>
                    ) : (
                        topics.map((topic) => (
                            <div
                                key={topic}
                                className="rounded-xl overflow-hidden"
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
                            >
                                <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}>
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        📂 {topic}
                                    </h3>
                                </div>
                                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                    {lectures[topic].map((lecture) => (
                                        <ContentItem
                                            key={lecture._id}
                                            lecture={lecture}
                                            onDelete={handleDelete}
                                            onViewPDF={() => setSelectedPDF(lecture)}
                                            getYouTubeEmbedUrl={getYouTubeEmbedUrl}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {selectedPDF && (
                <SecurePDFViewer
                    lectureId={selectedPDF._id}
                    role="teacher"
                    title={selectedPDF.title}
                    onClose={() => setSelectedPDF(null)}
                />
            )}
        </div>
    );
}

function ContentItem({ lecture, onDelete, onViewPDF, getYouTubeEmbedUrl }) {
    const [showPreview, setShowPreview] = useState(false);
    const embedUrl = lecture.type === 'video' ? getYouTubeEmbedUrl(lecture.videoUrl) : null;

    return (
        <div className="p-4">
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${lecture.type === 'video'
                    ? 'bg-rose-100 dark:bg-rose-900/30'
                    : 'bg-indigo-100 dark:bg-indigo-900/30'
                    }`}>
                    {lecture.type === 'video' ? (
                        <HiOutlinePlay className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    ) : (
                        <HiOutlineDocumentText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{lecture.title}</h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {lecture.type === 'video' ? '📹 Video' : '📄 Document'}
                                {lecture.duration && ` • ${lecture.duration}`}
                                {lecture.views > 0 && ` • ${lecture.views} views`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {lecture.type === 'video' && embedUrl && (
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    title="Preview"
                                >
                                    <HiOutlineEye className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(lecture._id)}
                                className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                title="Delete"
                            >
                                <HiOutlineTrash className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {lecture.description && (
                        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                            {lecture.description}
                        </p>
                    )}
                    {lecture.type === 'video' && embedUrl && showPreview && (
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
                    {lecture.fileUrl && (
                        <button
                            onClick={onViewPDF}
                            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
                        >
                            <HiOutlineDocumentText className="w-4 h-4" />
                            View Document
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
