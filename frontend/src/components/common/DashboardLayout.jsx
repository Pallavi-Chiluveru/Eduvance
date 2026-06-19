import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-500 selection:bg-indigo-500 selection:text-white">
            
            {/* Background Glowing Orbs (Global for all dashboards) */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-30 animate-pulse pointer-events-none transition-opacity duration-500 z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-30 animate-pulse pointer-events-none transition-opacity duration-500 z-0" style={{ animationDelay: '2s' }}></div>
            <div className="fixed top-[40%] left-[40%] w-[20%] h-[20%] bg-cyan-400 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none transition-opacity duration-500 z-0"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main
                    className="flex-1 transition-all duration-300 lg:ml-[var(--sidebar-width)]"
                    style={{ paddingTop: 'var(--navbar-height)' }}
                >
                    <div className="p-4 lg:p-6 animate-fade-in relative z-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
