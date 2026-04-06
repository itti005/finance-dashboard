import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requireRole }) {
    const { user, isAdmin, isAnalyst } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (requireRole === 'Admin' && !isAdmin)
        return <Navigate to="/" replace />;

    if (requireRole === 'Analyst' && !isAnalyst)
        return <Navigate to="/" replace />;

    return children;
}

export function Layout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                padding: '32px',
                overflowY: 'auto',
                maxHeight: '100vh'
            }}>
                {children}
            </main>
        </div>
    );
}