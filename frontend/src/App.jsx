import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/common/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentCourseDetail from './pages/student/CourseDetail';
import StudentAssessments from './pages/student/Assessments';
import StudentPerformance from './pages/student/Performance';
import StudentLearningJourney from './pages/student/LearningJourney';
import StudentFlashcards from './pages/student/Flashcards';
import StudentRewards from './pages/student/Rewards';
import StudentChatbot from './pages/student/Chatbot';
import StudentNotifications from './pages/student/Notifications';

import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import TeacherContent from './pages/teacher/ContentManager';
import TeacherAssessments from './pages/teacher/AssessmentBuilder';
import TeacherGrading from './pages/teacher/Grading';
import TeacherAnalytics from './pages/teacher/Analytics';

import ParentDashboard from './pages/parent/Dashboard';
import ParentPerformance from './pages/parent/ChildPerformance';
import ParentAttendance from './pages/parent/AttendanceMonitor';
import ParentNotifications from './pages/parent/Notifications';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/UserManagement';
import AdminCourses from './pages/admin/CourseManagement';
import AdminAnalytics from './pages/admin/SystemAnalytics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
            },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student routes */}
          <Route
            element={
              <ProtectedRoute roles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentCourses />} />
            <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
            <Route path="/student/assessments" element={<StudentAssessments />} />
            <Route path="/student/performance" element={<StudentPerformance />} />
            <Route path="/student/learning-journey" element={<StudentLearningJourney />} />
            <Route path="/student/flashcards" element={<StudentFlashcards />} />
            <Route path="/student/rewards" element={<StudentRewards />} />
            <Route path="/student/chatbot" element={<StudentChatbot />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/profile" element={<Profile />} />
          </Route>

          {/* Teacher routes */}
          <Route
            element={
              <ProtectedRoute roles={['teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/content" element={<TeacherContent />} />
            <Route path="/teacher/assessments" element={<TeacherAssessments />} />
            <Route path="/teacher/grading" element={<TeacherGrading />} />
            <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
            <Route path="/teacher/profile" element={<Profile />} />
          </Route>

          {/* Parent routes */}
          <Route
            element={
              <ProtectedRoute roles={['parent']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/parent/performance" element={<ParentPerformance />} />
            <Route path="/parent/attendance" element={<ParentAttendance />} />
            <Route path="/parent/notifications" element={<ParentNotifications />} />
            <Route path="/parent/profile" element={<Profile />} />
          </Route>

          {/* Admin routes */}
          <Route
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
