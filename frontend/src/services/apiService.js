import api from './api';

// ─── Auth API ───
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
};

// ─── Student API ───
export const studentAPI = {
    getDashboard: () => api.get('/student/dashboard'),
    getCourses: () => api.get('/student/courses'),
    getAvailableCourses: () => api.get('/student/courses/available'),
    enrollCourse: (courseId) => api.post(`/student/enroll/${courseId}`),
    getLectures: (courseId) => api.get(`/student/courses/${courseId}/lectures`),
    getAssessments: (params) => api.get('/student/assessments', { params }),
    getQuestions: (assessmentId) => api.get(`/student/assessments/${assessmentId}/questions`),
    submitTest: (data) => api.post('/student/submit-test', data),
    getSubmissionReview: (id) => api.get(`/student/submissions/${id}/review`),
    getPerformance: () => api.get('/student/performance'),
    getAttendance: () => api.get('/student/attendance'),
    getFlashcards: (courseId) => api.get('/student/flashcards', { params: { courseId } }),
    createFlashcard: (data) => api.post('/student/flashcards', data),
    reviewFlashcard: (id, data) => api.put(`/student/flashcards/${id}/review`, data),
    getRewards: () => api.get('/student/rewards'),
    chat: (message) => api.post('/student/chat', { message }),
    getChatHistory: () => api.get('/student/chat/history'),
    getNotifications: () => api.get('/student/notifications'),
    markNotificationRead: (id) => api.put(`/student/notifications/${id}/read`),
    getLearningJourney: () => api.get('/student/learning-journey'),
    viewLecture: (id) => api.post(`/student/view-lecture/${id}`),
    getLecturePDF: (lectureId) => api.get(`/student/lectures/${lectureId}/pdf`, { responseType: 'blob' }),
};

// ─── Teacher API ───
export const teacherAPI = {
    getDashboard: () => api.get('/teacher/dashboard'),
    getCourses: () => api.get('/teacher/courses'),
    getCourseStudents: (courseId) => api.get(`/teacher/students/${courseId}`),
    uploadContent: (formData) => api.post('/teacher/upload-content', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    createAssessment: (data) => api.post('/teacher/create-assessment', data),
    getSubmissions: (status) => api.get('/teacher/submissions', { params: { status } }),
    gradeSubmission: (id, data) => api.put(`/teacher/grade/${id}`, data),
    getAnalytics: () => api.get('/teacher/analytics'),
    markAttendance: (data) => api.post('/teacher/attendance', data),
    getAttendanceReport: (courseId) => api.get(`/teacher/attendance/${courseId}`),
    getLectures: (courseId) => api.get(`/teacher/courses/${courseId}/lectures`),
    getLecturePDF: (lectureId) => api.get(`/teacher/lectures/${lectureId}/pdf`, { responseType: 'blob' }),
    uploadLecture: (formData) => api.post('/teacher/lectures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteLecture: (lectureId) => api.delete(`/teacher/lectures/${lectureId}`),
};

// ─── Parent API ───
export const parentAPI = {
    getDashboard: () => api.get('/parent/dashboard'),
    getChildPerformance: (childId) => api.get(`/parent/child/${childId}/performance`),
    getChildAttendance: (childId) => api.get(`/parent/child/${childId}/attendance`),
    getChildActivity: (childId) => api.get(`/parent/child/${childId}/activity`),
    getNotifications: () => api.get('/parent/notifications'),
    markNotificationRead: (id) => api.put(`/parent/notifications/${id}/read`),
};

// ─── Admin API ───
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    createUser: (data) => api.post('/admin/users', data),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    resetPassword: (id, data) => api.put(`/admin/users/${id}/reset-password`, data),
    bulkImport: (data) => api.post('/admin/users/bulk-import', data),
    getCourses: () => api.get('/admin/courses'),
    createCourse: (data) => api.post('/admin/courses', data),
    updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
    enrollStudent: (data) => api.post('/admin/enroll', data),
    getAnalytics: () => api.get('/admin/analytics'),
};
