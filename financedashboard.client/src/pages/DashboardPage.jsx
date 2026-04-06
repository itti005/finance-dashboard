import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/services';

const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(n);

function StatCard({ label, value, color }) {
    return (
        <div className="card">
            <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
        </div>
    );
}

export default function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        dashboardApi.getSummary()
            .then((r) => setSummary(r.data))
            .catch(() => setError('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><span className="spinner" /></div>;
    if (error) return <div className="empty-state">{error}</div>;
    if (!summary) return null;

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Dashboard</div>
                    <div className="page-subtitle">Your financial records</div>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16, marginBottom: 24
            }}>
                <StatCard label="Total Income" value={fmt(summary.totalIncome)} color="var(--income)" />
                <StatCard label="Total Expenses" value={fmt(summary.totalExpenses)} color="var(--expense)" />
                <StatCard
                    label="Net Balance"
                    value={fmt(summary.netBalance)}
                    color={summary.netBalance >= 0 ? 'var(--income)' : 'var(--expense)'}
                />
                <StatCard label="Total Transactions" value={summary.totalTransactions} color="var(--primary)" />
            </div>

            {/* Category Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 14 }}>Income Categories</div>
                    {summary.categoryTotals.filter(c => c.type === 'Income').length === 0
                        ? <div className="empty-state" style={{ padding: '20px 0' }}>No data</div>
                        : summary.categoryTotals.filter(c => c.type === 'Income').map((c) => (
                            <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ color: 'var(--text2)' }}>{c.category}</span>
                                <span style={{ color: 'var(--income)', fontWeight: 600 }}>{fmt(c.total)}</span>
                            </div>
                        ))}
                </div>
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 14 }}>Expense Categories</div>
                    {summary.categoryTotals.filter(c => c.type === 'Expense').length === 0
                        ? <div className="empty-state" style={{ padding: '20px 0' }}>No data</div>
                        : summary.categoryTotals.filter(c => c.type === 'Expense').map((c) => (
                            <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ color: 'var(--text2)' }}>{c.category}</span>
                                <span style={{ color: 'var(--expense)', fontWeight: 600 }}>{fmt(c.total)}</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Recent Transactions</div>
                {summary.recentTransactions.length === 0 ? (
                    <div className="empty-state">No transactions yet</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Notes</th>
                                <th>Type</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.recentTransactions.map((t) => (
                                <tr key={t.id}>
                                    <td style={{ color: 'var(--text2)' }}>
                                        {new Date(t.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td>{t.category}</td>
                                    <td style={{ color: 'var(--text2)' }}>{t.notes || '—'}</td>
                                    <td>
                                        <span className={`badge badge-${t.type.toLowerCase()}`}>{t.type}</span>
                                    </td>
                                    <td style={{
                                        textAlign: 'right', fontWeight: 600,
                                        color: t.type === 'Income' ? 'var(--income)' : 'var(--expense)'
                                    }}>
                                        {t.type === 'Income' ? '+' : '-'}{fmt(t.amount)}
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