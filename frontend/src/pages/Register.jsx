import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import Logo from '../components/common/Logo';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function Register() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setProfileImage(null);
            setImagePreview('');
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Choose a JPEG, PNG, or WebP image.');
            e.target.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Profile image must be 5 MB or smaller.');
            e.target.value = '';
            return;
        }
        setProfileImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!['student', 'instructor'].includes(formData.role)) {
            toast.error('Invalid registration role.');
            return;
        }

        const fullName = formData.fullName.trim().replace(/\s+/g, ' ');
        if (fullName.length < 2) {
            toast.error('Please enter your full name.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const registerData = new FormData();
            Object.entries({ ...formData, fullName }).forEach(([key, value]) => {
                if (key !== 'confirmPassword') registerData.append(key, value);
            });
            if (profileImage) registerData.append('profileImage', profileImage);
            const response = await registerUser(registerData);
            if (formData.role === 'instructor' && response?.verificationEmailSent === false) {
                toast.error('Your account was created, but the verification email could not be sent. Sign in and resend the code.');
            } else {
                toast.success(formData.role === 'instructor' ? 'Verification code sent to your email.' : 'Registration successful! Redirecting...');
            }
            setTimeout(() => {
                navigate(formData.role === 'instructor' ? '/instructor/verification/email' : '/student');
            }, 1000);
        } catch (error) {
            const status = error.response?.status;
            const message = status === 409
                ? 'An account with this email already exists. Sign in to continue; if it is an unverified instructor account, you can resend its verification code after signing in.'
                : error.response?.data?.message || 'We could not complete registration. Please check your details and try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-500 selection:bg-indigo-500 selection:text-white">
            
            {/* Theme Toggle Button */}
            <div className="absolute top-6 right-6 z-50 animate-fade-in">
                <button 
                    onClick={toggleTheme}
                    className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg text-slate-700 dark:text-yellow-300 hover:scale-110 transition-all duration-300 focus:outline-none"
                    aria-label="Toggle Theme"
                >
                    {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl text-indigo-600" />}
                </button>
            </div>

            {/* Background Glowing Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-30 dark:opacity-40 animate-pulse pointer-events-none transition-opacity duration-500"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-30 dark:opacity-40 animate-pulse pointer-events-none transition-opacity duration-500" style={{ animationDelay: '2s' }}></div>
            <div className="fixed top-[40%] left-[40%] w-[20%] h-[20%] bg-cyan-400 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none transition-opacity duration-500"></div>

            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10 border-r border-slate-200 dark:border-slate-800/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-transparent dark:to-transparent">
                <div className="max-w-md text-slate-800 dark:text-white relative z-10 animate-slide-up">
                    <div className="mb-8">
                        <Logo size="xl" variant={isDarkMode ? 'light' : 'dark'} className="hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Join DLSES</h1>
                    <p className="text-xl mb-8 font-bold text-slate-700 dark:text-white/90">
                        Start your learning journey with our Digital Learning Support and Evaluation System
                    </p>
                    <div className="space-y-4">
                        {[
                            'Access quality courses',
                            'Track your progress',
                            'Personalized learning',
                            'Earn rewards and badges',
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-lg text-slate-600 dark:text-white/80">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <div className="w-full max-w-md animate-slide-up">
                    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8 lg:p-10 border border-white/50 dark:border-slate-700/50 relative overflow-hidden group">
                        
                        {/* Inner glowing highlight */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

                        <div className="text-center mb-8 relative z-10">
                            <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                                Create Account
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Fill in your details to get started
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            {/* Role Selection */}
                            <div className="group/input">
                                <label className="block text-sm font-bold mb-2 transition-colors text-slate-600 dark:text-slate-300">
                                    Register as
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500 hover:shadow-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                                >
                                    <option value="student">Student</option>
                                    <option value="instructor">Instructor</option>
                                </select>
                            </div>

                            {/* Full Name */}
                            <div className="group/input">
                                <label className="block text-sm font-bold mb-2 transition-colors text-slate-600 dark:text-slate-300">Full Name</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required minLength={2} placeholder="John Chiluveru" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:scale-[1.02] hover:shadow-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="group/input">
                                <label className="block text-sm font-bold mb-2 transition-colors text-slate-600 dark:text-slate-300">
                                    Email
                                </label>
                                <div className="relative">
                                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:scale-[1.02] hover:shadow-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    />
                                </div>
                            </div>


                            {/* Optional Profile Image */}
                            <div className="group/input">
                                <label htmlFor="profileImage" className="block text-sm font-bold mb-2 transition-colors text-slate-600 dark:text-slate-300">Profile Image <span className="font-normal text-slate-400">(optional)</span></label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && <img src={imagePreview} alt="Profile image preview" className="w-14 h-14 rounded-full object-cover border border-slate-300 dark:border-slate-600" />}
                                    <input id="profileImage" name="profileImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="w-full text-sm text-slate-600 dark:text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:font-semibold file:text-purple-700 hover:file:bg-purple-200 dark:file:bg-slate-700 dark:file:text-slate-100" />
                                </div>
                                <p className="mt-1 text-xs text-slate-400">JPEG, PNG, or WebP; up to 5 MB.</p>
                            </div>

                            {/* Password */}
                            <div className="group/input">
                                <label className="block text-sm font-bold mb-2 transition-colors text-slate-600 dark:text-slate-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:scale-[1.02] hover:shadow-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="group/input">
                                <label className="block text-sm font-bold mb-2 transition-colors text-slate-600 dark:text-slate-300">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:scale-[1.02] hover:shadow-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] overflow-hidden group/btn mt-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                <div className="relative flex items-center justify-center gap-2">
                                    {loading && <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />}
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </div>
                            </button>

                            {/* Login Link */}
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 relative z-10 pt-2">
                                Already have an account?{' '}
                                <Link to="/login" className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent hover:from-purple-700 dark:hover:from-purple-300 hover:to-indigo-700 dark:hover:to-indigo-300 transition-all drop-shadow-sm">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
