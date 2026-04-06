import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
            } else {
                if (!form.name.trim()) { setError('Name is required'); return; }
                await register(form.name, form.email, form.password);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)', padding: 20,
        }}>
            <div className="card" style={{ width: '100%', maxWidth: 400 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'var(--primary)', margin: '0 auto 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26, color: '#fff', fontWeight: 700,
                    }}>₹</div>
                    <h1 style={{ fontSize: 22, fontWeight: 600 }}>Finance Dashboard</h1>
                    <p style={{ color: 'var(--text2)', marginTop: 4 }}>
                        {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                {/* Demo credentials */}
                {mode === 'login' && (
                    <div style={{
                        background: 'var(--bg3)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                        fontSize: 12, color: 'var(--text2)',
                    }}>
                        <strong style={{ color: 'var(--text)' }}>Demo Admin:</strong>{' '}
                        admin@finance.com / Admin@123
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#ef444420', border: '1px solid #ef444440',
                        borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                        fontSize: 13, color: 'var(--expense)',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {mode === 'register' && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" placeholder="John Doe"
                                value={form.name} onChange={set('name')} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="you@example.com"
                            value={form.email} onChange={set('email')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="••••••••"
                            value={form.password} onChange={set('password')} required />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 4 }}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--text2)', fontSize: 13 }}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                        style={{ background: 'none', color: 'var(--primary-light)', fontWeight: 500, fontSize: 13 }}
                    >
                        {mode === 'login' ? 'Register' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
}