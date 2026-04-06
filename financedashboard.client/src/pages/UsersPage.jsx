import { useEffect, useState } from 'react';
import { usersApi } from '../api/services';

const ROLES = ['Viewer', 'Analyst', 'Admin'];

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        usersApi.getAll()
            .then((r) => setUsers(r.data))
            .catch(() => setError('Failed to load users'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleRoleChange = async (id, role) => {
        try {
            const roleNum = ROLES.indexOf(role);
            await usersApi.updateRole(id, roleNum);
            load();
        } catch {
            setError('Failed to update role');
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await usersApi.updateStatus(user.id, !user.isActive);
            load();
        } catch {
            setError('Failed to update status');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">User Management</div>
                    <div className="page-subtitle">{users.length} users registered</div>
                </div>
            </div>

            {error && (
                <div style={{
                    background: '#ef444420', border: '1px solid #ef444440',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                    fontSize: 13, color: 'var(--expense)',
                }}>{error}</div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="loading"><span className="spinner" /></div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: 'var(--primary)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0,
                                            }}>
                                                {u.name[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                                    <td>
                                        <select
                                            className="form-input"
                                            style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        >
                                            {ROLES.map((r) => <option key={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${u.isActive ? 'active' : 'inactive'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>
                                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button
                                                className={`btn ${u.isActive ? 'btn-danger' : 'btn-ghost'}`}
                                                style={{ padding: '5px 12px', fontSize: 12 }}
                                                onClick={() => handleToggleStatus(u)}
                                            >
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}