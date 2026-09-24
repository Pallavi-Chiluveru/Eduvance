import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorAPI } from '../services/apiService';

export default function ApprovedInstructorRoute({ children }) {
    const [state, setState] = useState({ loading: true, approved: false });

    useEffect(() => {
        let active = true;
        const checkApproval = async () => {
            try {
                const response = await instructorAPI.getVerification();
                if (active) setState({ loading: false, approved: response.data.data.user?.instructorVerification?.status === 'approved' && response.data.data.user?.instructorVerification?.emailVerified === true });
            } catch {
                if (active) setState({ loading: false, approved: false });
            }
        };
        checkApproval();
        return () => { active = false; };
    }, []);

    if (state.loading) return <div className="min-h-screen grid place-items-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!state.approved) return <Navigate to="/instructor/verification" replace />;
    return children;
}
