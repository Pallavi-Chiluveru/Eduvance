import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { studentAPI } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlinePaperAirplane, HiOutlineExclamation, HiOutlineRefresh } from 'react-icons/hi';

export default function StudentChatbot() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEnd = useRef(null);

    const loadChatHistory = async () => {
        try {
            setHistoryLoading(true);
            const res = await studentAPI.getChatHistory();
            const history = res.data.data.history || [];
            if (history.length > 0) {
                setMessages(history.flatMap((h) => [
                    { role: 'user', text: h.message, timestamp: h.createdAt },
                    { role: 'bot', text: h.reply, timestamp: h.createdAt },
                ]));
            } else {
                setMessages([{ role: 'bot', text: "Hi! I'm your AI learning assistant. I can help you with:\n\n• Course information\n• Test preparation\n• Study tips\n• Subject-specific questions\n• And much more!\n\nWhat would you like to know?" }]);
            }
            setError(null);
        } catch (err) {
            console.error('Chat history error:', err);
            setError('Failed to load chat history');
            setMessages([{ role: 'bot', text: "Hi! I'm your AI learning assistant. Ask me anything about your courses!" }]);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        loadChatHistory();
    }, []);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const msg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: msg, timestamp: new Date() }]);
        setLoading(true);
        setError(null);

        try {
            const res = await studentAPI.chat(msg);
            setMessages((prev) => [...prev, { role: 'bot', text: res.data.data.reply, timestamp: new Date() }]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to get response';
            setMessages((prev) => [...prev, { role: 'bot', text: `Sorry, I encountered an error: ${errorMsg}. Please try again.` }]);
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'bot', text: "Chat cleared! How can I help you today?" }]);
        toast.success('Chat cleared');
    };

    const quickQuestions = [
        'How do I improve my grades?',
        'What are flashcards?',
        'How does attendance work?',
        'Tips for exam preparation',
    ];

    if (historyLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading chat history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - var(--navbar-height) - 3rem)' }}>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🤖 AI Assistant</h1>
                <div className="flex gap-2">
                    <button
                        onClick={clearChat}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                        style={{
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                            background: 'var(--bg-card)'
                        }}
                    >
                        Clear Chat
                    </button>
                    <button
                        onClick={loadChatHistory}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                        style={{
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                            background: 'var(--bg-card)'
                        }}
                        disabled={historyLoading}
                    >
                        <HiOutlineRefresh className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto rounded-xl p-4 space-y-3 mb-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg mb-4" style={{ color: 'var(--text-primary)' }}>👋 Ask me anything!</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {quickQuestions.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => { setInput(q); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user'
                            ? 'gradient-primary text-white rounded-br-md'
                            : 'rounded-bl-md'
                            }`} style={m.role !== 'user' ? { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : {}}>
                            <div className={m.role === 'bot' ? 'chatbot-markdown' : ''} style={{ whiteSpace: m.role === 'user' ? 'pre-wrap' : 'normal' }}>
                                {m.role === 'bot' ? (
                                    <ReactMarkdown>{m.text}</ReactMarkdown>
                                ) : (
                                    m.text
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEnd} />
            </div>

            {/* Input */}
            <form onSubmit={send} className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-4 py-3 rounded-xl text-white gradient-primary hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                </button>
            </form>
        </div>
    );
}
