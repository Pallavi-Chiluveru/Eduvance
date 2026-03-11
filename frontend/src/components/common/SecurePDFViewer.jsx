import { useState, useEffect } from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineZoomIn, HiOutlineZoomOut, HiOutlineX, HiOutlineDownload, HiOutlineExclamation } from 'react-icons/hi';
import { studentAPI, teacherAPI } from '../../services/apiService';
import toast from 'react-hot-toast';

export default function SecurePDFViewer({ lectureId, role, title, onClose }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [zoom, setZoom] = useState(100);
    const [loading, setLoading] = useState(true);
    const [blobUrl, setBlobUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchPDF = async () => {
            try {
                setLoading(true);
                setError(null);
                const api = role === 'teacher' ? teacherAPI : studentAPI;
                const response = await api.getLecturePDF(lectureId);

                if (isMounted) {
                    const url = URL.createObjectURL(response.data);
                    setBlobUrl(url);
                    setLoading(false);
                }
            } catch (err) {
                console.error('PDF Fetch Error:', err);
                if (isMounted) {
                    setError('Failed to load secure PDF. Please check your permissions.');
                    setLoading(false);
                    toast.error('Failed to load secure PDF');
                }
            }
        };

        if (lectureId) {
            fetchPDF();
        }

        return () => {
            isMounted = false;
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [lectureId, role]);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const zoomIn = () => {
        if (zoom < 200) setZoom(zoom + 10);
    };

    const zoomOut = () => {
        if (zoom > 50) setZoom(zoom - 10);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <HiOutlineX className="w-5 h-5 text-indigo-400 cursor-pointer" onClick={onClose} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg leading-tight">{title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Secure Document Viewer</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Zoom Stats */}
                    <div className="hidden sm:flex items-center bg-gray-800 rounded-lg border border-gray-700 p-1">
                        <button onClick={zoomOut} className="p-1.5 rounded hover:bg-gray-700 text-gray-300 disabled:opacity-30" disabled={zoom <= 50}><HiOutlineZoomOut className="w-4 h-4" /></button>
                        <span className="text-white text-xs px-3 font-medium min-w-[60px] text-center">{zoom}%</span>
                        <button onClick={zoomIn} className="p-1.5 rounded hover:bg-gray-700 text-gray-300 disabled:opacity-30" disabled={zoom >= 200}><HiOutlineZoomIn className="w-4 h-4" /></button>
                    </div>

                    {blobUrl && (
                        <a href={blobUrl} download={`${title}.pdf`} className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-all shadow-sm">
                            <HiOutlineDownload className="w-5 h-5" />
                        </a>
                    )}

                    <button onClick={onClose} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-gray-950 relative">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-500/20 rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm animate-pulse">Establishing secure connection...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
                        <div className="p-4 bg-rose-500/10 rounded-full"><HiOutlineExclamation className="w-12 h-12 text-rose-500" /></div>
                        <div>
                            <h4 className="text-white font-semibold text-lg">Load Failed</h4>
                            <p className="text-gray-400 text-sm mt-2">{error}</p>
                        </div>
                        <button onClick={onClose} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">Close Viewer</button>
                    </div>
                ) : (
                    <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center">
                        <div className="w-full h-full max-w-6xl relative group">
                            <iframe
                                src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full bg-white rounded-xl shadow-2xl border border-white/10"
                                title={title}
                            />
                            {/* Overlay message to indicate security */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-gray-300 uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 border border-white/5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Protected Session
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation (Only if multiple pages, though iframe handles it, we keep it for premium feel) */}
            <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                    <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-white">ESC</span>
                    <span>to close</span>
                </div>
            </div>
        </div>
    );
}
