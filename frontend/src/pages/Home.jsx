import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaUsers, FaFileAlt, FaRobot, FaUserGraduate, FaUserTie, FaCheckCircle, FaUserShield, FaGithub, FaSun, FaMoon } from 'react-icons/fa';
import logo from '../assets/logo.png';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    // Check if user has a saved preference, otherwise default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark mode
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

  const features = [
    { icon: <FaBookOpen className="text-4xl text-green-500 dark:text-green-400 mb-4" />, title: "∞ Courses" },
    { icon: <FaUsers className="text-4xl text-blue-500 dark:text-blue-400 mb-4" />, title: "5 User Roles" },
    { icon: <FaFileAlt className="text-4xl text-orange-500 dark:text-orange-400 mb-4" />, title: "∞ Tests" },
    { icon: <FaRobot className="text-4xl text-purple-500 dark:text-purple-400 mb-4" />, title: "AI Assistant" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white relative overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-500">
      
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

      {/* Background Glowing Orbs (Global) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-30 animate-pulse pointer-events-none transition-opacity duration-500"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-30 animate-pulse pointer-events-none transition-opacity duration-500" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-[40%] left-[40%] w-[20%] h-[20%] bg-cyan-400 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none transition-opacity duration-500"></div>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10 pt-20 pb-10">
        <div className="text-center max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Logo and Heading */}
          <div className="flex items-center justify-center gap-4 mb-6 animate-slide-up">
            <div className="relative transform hover:scale-110 transition-transform duration-300">
              <img src={logo} alt="Eduvance Logo" className="w-20 md:w-24 h-auto drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]" />
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)] dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-colors duration-500">
              Eduvance
            </h1>
          </div>

          {/* Subtitle */}
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-6 animate-slide-up transition-colors duration-500" style={{ animationDelay: '0.1s' }}>
            Digital Learning Support and Evaluation System
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-12 animate-slide-up transition-colors duration-500" style={{ animationDelay: '0.2s' }}>
            A comprehensive platform connecting students, instructors, and administrators for enhanced educational experiences.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 w-full animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white/60 dark:bg-slate-800/40 p-8 rounded-2xl flex flex-col items-center justify-center transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 border border-slate-200 dark:border-slate-600/50 backdrop-blur-xl group">
                <div className="transform group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_currentColor] transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-500">{feature.title}</h3>
              </div>
            ))}
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/login" className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] dark:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] dark:hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] transform hover:-translate-y-1 transition-all duration-300">
              Sign In
            </Link>
            <Link to="/register" className="px-8 py-4 rounded-xl font-bold text-lg bg-transparent border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transform hover:-translate-y-1 transition-all duration-300">
              Sign Up
            </Link>
          </div>

        </div>
      </section>

      {/* About Platform Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-10 border-t border-slate-200 dark:border-indigo-500/20 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#0f172a] dark:to-[#0c0a1d] transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col items-center w-full">
          
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)] dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-colors duration-500">
              About Platform
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 transition-colors duration-500">
              Eduvance is powered by a robust architecture designed to serve different users seamlessly, providing specialized tools for every role in the educational ecosystem.
            </p>
            <a 
              href="https://github.com/Pallavi-Chiluveru/Eduvance/blob/main/ARCHITECTURE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-1 transition-all duration-300 group"
            >
              <FaGithub className="text-2xl group-hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              View Architecture
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 w-full">
            {/* Reviewer Card */}
            <div className="bg-white/50 dark:bg-purple-900/10 p-8 rounded-3xl flex flex-col items-start transform hover:-translate-y-4 hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] transition-all duration-500 border border-purple-200 dark:border-purple-500/40 hover:bg-white dark:hover:bg-purple-900/20 group relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-purple-300/30 dark:bg-purple-500/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.2)] dark:shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-200 dark:border-purple-400/30">
                <FaCheckCircle className="text-3xl text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] dark:group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
              </div>
              <h3 className="relative z-10 text-3xl font-bold text-slate-800 dark:text-white mb-3 transition-colors duration-500">Reviewer</h3>
              <div className="relative z-10 text-purple-700 dark:text-purple-200 text-xs tracking-widest uppercase font-bold mb-5 bg-purple-200 dark:bg-purple-500/30 px-4 py-1.5 rounded-full border border-purple-300 dark:border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.1)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]">Unlimited Users</div>
              <p className="relative z-10 text-slate-600 dark:text-slate-300 leading-relaxed font-medium transition-colors duration-500">Review instructor submissions, verify learning content, provide feedback, monitor quality, and help maintain academic standards across the platform.</p>
            </div>

            {/* Instructor Card */}
            <div className="bg-white/50 dark:bg-orange-900/10 p-8 rounded-3xl flex flex-col items-start transform hover:-translate-y-4 hover:shadow-[0_0_50px_rgba(249,115,22,0.2)] dark:hover:shadow-[0_0_50px_rgba(249,115,22,0.4)] transition-all duration-500 border border-orange-200 dark:border-orange-500/40 hover:bg-white dark:hover:bg-orange-900/20 group relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-orange-300/30 dark:bg-orange-500/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(249,115,22,0.2)] dark:shadow-[0_0_20px_rgba(249,115,22,0.5)] border border-orange-200 dark:border-orange-400/30">
                <FaUserTie className="text-3xl text-orange-600 dark:text-orange-400 group-hover:text-orange-500 dark:group-hover:text-orange-300 group-hover:drop-shadow-[0_0_10px_rgba(249,115,22,0.4)] dark:group-hover:drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
              </div>
              <h3 className="relative z-10 text-3xl font-bold text-slate-800 dark:text-white mb-3 transition-colors duration-500">Instructor</h3>
              <div className="relative z-10 text-orange-700 dark:text-orange-200 text-xs tracking-widest uppercase font-bold mb-5 bg-orange-200 dark:bg-orange-500/30 px-4 py-1.5 rounded-full border border-orange-300 dark:border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] dark:shadow-[0_0_15px_rgba(249,115,22,0.3)]">Unlimited Users</div>
              <p className="relative z-10 text-slate-600 dark:text-slate-300 leading-relaxed font-medium transition-colors duration-500">Create and manage courses, upload learning materials, build assessments, track student progress, and manage course-related learning activities.</p>
            </div>

            {/* Student Card */}
            <div className="bg-white/50 dark:bg-blue-900/10 p-8 rounded-3xl flex flex-col items-start transform hover:-translate-y-4 hover:shadow-[0_0_50px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] transition-all duration-500 border border-blue-200 dark:border-blue-500/40 hover:bg-white dark:hover:bg-blue-900/20 group relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-blue-300/30 dark:bg-blue-500/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)] dark:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-200 dark:border-blue-400/30">
                <FaUserGraduate className="text-3xl text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.4)] dark:group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>
              <h3 className="relative z-10 text-3xl font-bold text-slate-800 dark:text-white mb-3 transition-colors duration-500">Student</h3>
              <div className="relative z-10 text-blue-700 dark:text-blue-200 text-xs tracking-widest uppercase font-bold mb-5 bg-blue-200 dark:bg-blue-500/30 px-4 py-1.5 rounded-full border border-blue-300 dark:border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]">Unlimited Users</div>
              <p className="relative z-10 text-slate-600 dark:text-slate-300 leading-relaxed font-medium transition-colors duration-500">Enroll in courses, access learning materials, complete assessments, track progress, view deadlines, and manage their personal learning journey.</p>
            </div>

            {/* Admin Card */}
            <div className="bg-white/50 dark:bg-amber-900/10 p-8 rounded-3xl flex flex-col items-start transition-all duration-500 border border-amber-200 dark:border-amber-500/40 backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-6 border border-amber-200 dark:border-amber-400/30"><FaUsers className="text-3xl text-amber-600 dark:text-amber-400" /></div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Mentor</h3>
              <div className="text-amber-700 dark:text-amber-200 text-xs tracking-widest uppercase font-bold mb-5 bg-amber-200 dark:bg-amber-500/30 px-4 py-1.5 rounded-full">Admin Assigned</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">Guide assigned learners, monitor progress, provide feedback, and maintain mentoring-session history.</p>
            </div>

            {/* Admin Card */}
            <div className="bg-white/50 dark:bg-red-900/10 p-8 rounded-3xl flex flex-col items-start transform hover:-translate-y-4 hover:shadow-[0_0_50px_rgba(239,68,68,0.3)] dark:hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] transition-all duration-500 border border-red-300 dark:border-red-500/40 hover:bg-white dark:hover:bg-red-900/20 group relative overflow-hidden ring-1 ring-red-400/50 dark:ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)] dark:shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-md">
              <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-red-300/30 dark:bg-red-500/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_25px_rgba(239,68,68,0.3)] dark:shadow-[0_0_25px_rgba(239,68,68,0.7)] border border-red-200 dark:border-red-400/50">
                <FaUserShield className="text-3xl text-red-600 dark:text-red-400 group-hover:text-red-500 dark:group-hover:text-red-300 group-hover:drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] dark:group-hover:drop-shadow-[0_0_15px_rgba(239,68,68,1)]" />
              </div>
              <h3 className="relative z-10 text-3xl font-bold text-slate-800 dark:text-white mb-3 transition-colors duration-500">Admin</h3>
              <div className="relative z-10 text-red-100 text-xs tracking-widest uppercase font-bold mb-5 bg-gradient-to-r from-red-600 to-red-500 px-4 py-1.5 rounded-full border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] dark:shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse">Only One Admin</div>
              <p className="relative z-10 text-slate-600 dark:text-slate-300 leading-relaxed font-medium transition-colors duration-500">Manage users, approve instructors, monitor courses and platform activity, review verification requests, and manage the overall learning system.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
