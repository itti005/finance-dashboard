import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import TrendsPage from './pages/TrendsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout><DashboardPage /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/transactions" element={
                        <ProtectedRoute>
                            <Layout><TransactionsPage /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/trends" element={
                        <ProtectedRoute requireRole="Analyst">
                            <Layout><TrendsPage /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/users" element={
                        <ProtectedRoute requireRole="Admin">
                            <Layout><UsersPage /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}