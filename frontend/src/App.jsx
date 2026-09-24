import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import ApprovedInstructorRoute from './routes/ApprovedInstructorRoute';
import DashboardLayout from './components/common/DashboardLayout';

// Pages
import Home from './pages/Home';
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
import StudentDSAArena from './pages/student/DSAArena';
import StudentMentorFeedback from './pages/student/MentorFeedback';

import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorVerification from './pages/instructor/InstructorVerification';
import VerificationLayout from './components/instructor/VerificationLayout';
import InstructorCourses from './pages/instructor/Courses';
import CreateCourse from './pages/instructor/CreateCourse';
import CourseBuilder from './pages/instructor/CourseBuilder';
import InstructorContent from './pages/instructor/ContentManager';
import InstructorAssessments from './pages/instructor/AssessmentBuilder';
import InstructorGrading from './pages/instructor/Grading';
import InstructorAnalytics from './pages/instructor/Analytics';
import CourseReviews from './pages/instructor/CourseReviews';

import AdminDashboard from './pages/admin/Dashboard';
import InstructorRequests from './pages/admin/InstructorRequests';
import AdminUsers from './pages/admin/UserManagement';
import AdminCourses from './pages/admin/CourseManagement';
import AdminAnalytics from './pages/admin/SystemAnalytics';
import { ReviewerManagement, MentorManagement } from './pages/admin/ManagedRoles';
import ReviewerActivity from './pages/admin/ReviewerActivity';
import AdminCategories from './pages/admin/Categories';
import AdminPolicies from './pages/admin/Policies';
import CourseReviewMonitoring from './pages/admin/CourseReviewMonitoring';
import ReviewerDashboard from './pages/reviewer/Dashboard';
import PendingReviews from './pages/reviewer/PendingReviews';
import ReviewerCourseReview from './pages/reviewer/CourseReview';
import ReviewHistory from './pages/reviewer/ReviewHistory';
import MentorDashboard from './pages/mentor/Dashboard';
import MentorLearners from './pages/mentor/Learners';
import MentorLearnerDetail from './pages/mentor/LearnerDetail';
import MentorFeedback from './pages/mentor/Feedback';
import MentorSessions from './pages/mentor/Sessions';

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
          <Route path="/" element={<Home />} />

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
            <Route path="/student/dsa-arena" element={<StudentDSAArena />} />
            <Route path="/student/mentor-feedback" element={<StudentMentorFeedback />} />
            <Route path="/student/profile" element={<Profile />} />
          </Route>

          {/* Instructor verification and approved teaching routes */}
          <Route path="/instructor" element={<ProtectedRoute roles={['instructor']}><VerificationLayout><InstructorVerification /></VerificationLayout></ProtectedRoute>} />
          <Route path="/instructor/verification/email" element={<ProtectedRoute roles={['instructor']}><VerificationLayout><InstructorVerification /></VerificationLayout></ProtectedRoute>} />
          <Route path="/instructor/verification" element={<ProtectedRoute roles={['instructor']}><VerificationLayout><InstructorVerification /></VerificationLayout></ProtectedRoute>} />
          <Route element={<ProtectedRoute roles={['instructor']}><ApprovedInstructorRoute><DashboardLayout /></ApprovedInstructorRoute></ProtectedRoute>}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/courses" element={<InstructorCourses />} />
            <Route path='/instructor/courses/new' element={<CreateCourse />} />
            <Route path='/instructor/courses/:courseId/build' element={<CourseBuilder />} />
            <Route path="/instructor/content" element={<InstructorContent />} />
            <Route path="/instructor/assessments" element={<InstructorAssessments />} />
            <Route path="/instructor/grading" element={<InstructorGrading />} />
            <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
            <Route path="/instructor/courses/:id/reviews" element={<CourseReviews />} />
            <Route path="/instructor/profile" element={<Profile />} />
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
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/instructors" element={<InstructorRequests />} />
            <Route path="/admin/instructors/:id" element={<InstructorRequests />} />
            <Route path="/admin/profile" element={<Profile />} />
            <Route path="/admin/reviewers" element={<ReviewerManagement />} />
            <Route path="/admin/reviewers/:id/activity" element={<ReviewerActivity />} />
            <Route path="/admin/mentors" element={<MentorManagement />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/policies" element={<AdminPolicies />} />
            <Route path="/admin/course-reviews" element={<CourseReviewMonitoring />} />
          </Route>

          <Route element={<ProtectedRoute roles={['reviewer']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/reviewer" element={<ReviewerDashboard />} />
            <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} />
            <Route path="/reviewer/pending" element={<PendingReviews />} />
            <Route path="/reviewer/courses/:id/review" element={<ReviewerCourseReview />} />
            <Route path="/reviewer/history" element={<ReviewHistory />} />
            <Route path="/reviewer/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute roles={['mentor']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/mentor/learners" element={<MentorLearners />} />
            <Route path="/mentor/learners/:id" element={<MentorLearnerDetail />} />
            <Route path="/mentor/feedback" element={<MentorFeedback />} />
            <Route path="/mentor/sessions" element={<MentorSessions />} />
            <Route path="/mentor/profile" element={<Profile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
