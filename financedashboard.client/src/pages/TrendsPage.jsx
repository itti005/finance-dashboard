import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/services';

const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(n);

export default function TrendsPage() {
    const [data, setData] = useState([]);
    const [months, setMonths] = useState(6);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        dashboardApi.getTrends(months)
            .then((r) => setData(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [months]);

    const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expenses)), 1);

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Monthly Trends</div>
                    <div className="page-subtitle">Income vs Expense over time</div>
                </div>
                <select className="form-input" style={{ width: 'auto' }}
                    value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                    <option value={3}>Last 3 months</option>
                    <option value={6}>Last 6 months</option>
                    <option value={12}>Last 12 months</option>
                </select>
            </div>

            {/* Bar Chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                {loading ? (
                    <div className="loading"><span className="spinner" /></div>
                ) : data.length === 0 ? (
                    <div className="empty-state">No trend data available</div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 200, marginBottom: 8 }}>
                            {data.map((row) => (
                                <div key={`${row.year}-${row.month}`}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: '100%', display: 'flex', gap: 4, alignItems: 'flex-end', height: 160 }}>
                                        <div style={{
                                            flex: 1, background: 'var(--income)',
                                            height: `${(row.income / maxVal) * 100}%`,
                                            borderRadius: '4px 4px 0 0', minHeight: 4
                                        }} title={fmt(row.income)} />
                                        <div style={{
                                            flex: 1, background: 'var(--expense)',
                                            height: `${(row.expenses / maxVal) * 100}%`,
                                            borderRadius: '4px 4px 0 0', minHeight: 4
                                        }} title={fmt(row.expenses)} />
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center' }}>
                                        {row.monthName}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Legend */}
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                                <div style={{ width: 12, height: 12, background: 'var(--income)', borderRadius: 2 }} />
                                Income
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                                <div style={{ width: 12, height: 12, background: 'var(--expense)', borderRadius: 2 }} />
                                Expenses
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Table */}
            {!loading && data.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th style={{ textAlign: 'right' }}>Income</th>
                                <th style={{ textAlign: 'right' }}>Expenses</th>
                                <th style={{ textAlign: 'right' }}>Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={`${row.year}-${row.month}`}>
                                    <td style={{ fontWeight: 500 }}>{row.monthName}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--income)' }}>{fmt(row.income)}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--expense)' }}>{fmt(row.expenses)}</td>
                                    <td style={{
                                        textAlign: 'right', fontWeight: 600,
                                        color: row.net >= 0 ? 'var(--income)' : 'var(--expense)'
                                    }}>
                                        {row.net >= 0 ? '+' : ''}{fmt(row.net)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}