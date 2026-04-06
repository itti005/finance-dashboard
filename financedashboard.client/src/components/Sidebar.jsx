import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout, isAdmin, isAnalyst } = useAuth();

    const links = [
        { to: '/', label: 'Dashboard', show: true },
        { to: '/transactions', label: 'Transactions', show: true },
        { to: '/trends', label: 'Trends', show: isAnalyst },
        { to: '/users', label: 'Users', show: isAdmin },
    ];

    return (
        <aside style={{
            width: 220, minHeight: '100vh',
            background: 'var(--bg2)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            padding: '24px 0', flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'var(--primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: '#fff'
                    }}>₹</div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>FinanceApp</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>Dashboard</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px' }}>
                {links.filter(l => l.show).map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center',
                            padding: '10px 12px', borderRadius: 8,
                            marginBottom: 2,
                            color: isActive ? '#fff' : 'var(--text2)',
                            background: isActive ? 'var(--primary)' : 'transparent',
                            fontWeight: isActive ? 500 : 400,
                            transition: 'all 0.15s',
                        })}
                    >
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User info */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ padding: '10px 12px', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{user?.email}</div>
                    <span className={`badge badge-${user?.role?.toLowerCase()}`} style={{ marginTop: 6 }}>
                        {user?.role}
                    </span>
                </div>
                <button
                    onClick={logout}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}