import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Logo from '../components/common/Logo';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Reset error
        try {
            const user = await login(formData.email, formData.password);
            toast.success(`Welcome back, ${user.firstName}!`);
            navigate(`/${user.role}`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
            </div>

            {/* Left Panel - Enhanced Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
                <div className="text-white text-center relative z-10 max-w-lg animate-slide-up">
                    <div className="mb-10 flex justify-center">
                        <Logo size="2xl" variant="light" className="hover:scale-105 transition-transform duration-500" />
                    </div>

                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight"></h1>
                    <p className="text-xl text-white/90 mb-4 font-medium">Digital Learning Support and Evaluation System</p>
                    <p className="text-base text-white/70 leading-relaxed max-w-md mx-auto mb-10">
                        A comprehensive platform connecting students, teachers, parents, and administrators for enhanced educational experiences.
                    </p>

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        {[
                            { icon: '📚', n: '9', d: 'Courses' },
                            { icon: '👥', n: '4', d: 'User Roles' },
                            { icon: '📝', n: '∞', d: 'Tests' },
                            { icon: '🤖', n: 'AI', d: 'Assistant' },
                        ].map((f) => (
                            <div
                                key={f.d}
                                className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105 group"
                            >
                                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{f.icon}</div>
                                <p className="text-xl font-bold">{f.n} {f.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Premium Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-md animate-slide-up">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
                        <div className="lg:hidden text-center mb-10">
                            <Logo size="lg" className="justify-center" variant="dark" />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Welcome Back
                            </h2>
                            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                                Sign in to continue your learning journey
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl animate-shake">
                                    <div className="flex">
                                        <div className="flex-shrink-0 text-red-500">
                                            ⚠️
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-bold text-red-800 dark:text-red-200">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="group">
                                <label className="block text-sm font-bold mb-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                                    📧 Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:scale-[1.02] hover:shadow-md"
                                    style={{
                                        background: 'var(--bg-tertiary)',
                                        border: '2px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold mb-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                                    🔒 Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:scale-[1.02] hover:shadow-md"
                                    style={{
                                        background: 'var(--bg-tertiary)',
                                        border: '2px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <div className="relative flex items-center justify-center gap-2">
                                    {loading && <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />}
                                    {loading ? 'Signing in...' : '✨ Sign In'}
                                </div>
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-indigo-700 transition-all"
                            >
                                Sign up now →
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-6 text-white/80 text-xs">
                        <div className="flex items-center gap-1">
                            <span>🔒</span>
                            <span>Secure Login</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>⚡</span>
                            <span>Fast Access</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🌟</span>
                            <span>Premium Experience</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes reverse-spin {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                .animate-reverse-spin {
                    animation: reverse-spin 8s linear infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-20px) translateX(10px); }
                    66% { transform: translateY(10px) translateX(-10px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
}
