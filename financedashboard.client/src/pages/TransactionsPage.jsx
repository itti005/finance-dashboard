import { useEffect, useState, useCallback } from 'react';
import { transactionsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(n);

const CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Food', 'Rent',
    'Transport', 'Shopping', 'Medical', 'Entertainment', 'Utilities', 'Other'];
const EMPTY_FORM = {
    amount: '', type: 'Income', category: 'Salary',
    date: new Date().toISOString().split('T')[0], notes: ''
};

function TransactionModal({ initial, onSave, onClose }) {
    const [form, setForm] = useState(initial ? {
        ...initial,
        type: initial.type === 0 || initial.type === 'Income' ? 'Income' : 'Expense'
    } : EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                ...form,
                amount: parseFloat(form.amount),
                type: form.type === 'Income' ? 0 : 1
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: 20,
        }}>
            <div className="card" style={{ width: '100%', maxWidth: 460 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>
                        {initial ? 'Edit Transaction' : 'New Transaction'}
                    </span>
                    <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: 18 }}>x</button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Amount</label>
                            <input className="form-input" type="number" step="0.01" min="0.01"
                                required value={form.amount} onChange={set('amount')} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-input" value={form.type} onChange={set('type')}>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-input" value={form.category} onChange={set('category')}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input className="form-input" type="date" required
                                value={form.date} onChange={set('date')} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Notes (optional)</label>
                        <input className="form-input" value={form.notes}
                            onChange={set('notes')} placeholder="Brief description..." />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button type="button" className="btn btn-ghost"
                            onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary"
                            disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                            {saving ? <span className="spinner" /> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function TransactionsPage() {
    const { isAnalyst } = useAuth();
    const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1, pageSize: 15, category: '', type: '', from: '', to: ''
    });
    const [modal, setModal] = useState(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== '')
            );
            const res = await transactionsApi.getAll(params);
            setData(res.data);
        } catch {
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        try {
            if (modal.mode === 'create') {
                await transactionsApi.create(form);
            } else {
                await transactionsApi.update(modal.tx.id, form);
            }
            setModal(null);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this transaction?')) return;
        try {
            await transactionsApi.delete(id);
            load();
        } catch {
            setError('Failed to delete');
        }
    };

    const setF = (k) => (e) =>
        setFilters((f) => ({ ...f, [k]: e.target.value, page: 1 }));

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Transactions</div>
                    <div className="page-subtitle">{data.totalCount} records found</div>
                </div>
                {isAnalyst && (
                    <button className="btn btn-primary"
                        onClick={() => setModal({ mode: 'create' })}>
                        + New Transaction
                    </button>
                )}
            </div>

            {error && (
                <div style={{
                    background: '#ef444420', border: '1px solid #ef444440',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                    fontSize: 13, color: 'var(--expense)',
                }}>{error}</div>
            )}

            {/* Filters */}
            <div className="card" style={{
                marginBottom: 20, display: 'flex',
                gap: 12, flexWrap: 'wrap', alignItems: 'flex-end'
            }}>
                <div className="form-group" style={{ flex: '1 1 130px' }}>
                    <label className="form-label">Type</label>
                    <select className="form-input" value={filters.type} onChange={setF('type')}>
                        <option value="">All types</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 130px' }}>
                    <label className="form-label">Category</label>
                    <select className="form-input" value={filters.category} onChange={setF('category')}>
                        <option value="">All categories</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                    <label className="form-label">From</label>
                    <input className="form-input" type="date"
                        value={filters.from} onChange={setF('from')} />
                </div>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                    <label className="form-label">To</label>
                    <input className="form-input" type="date"
                        value={filters.to} onChange={setF('to')} />
                </div>
                <button className="btn btn-ghost"
                    onClick={() => setFilters({
                        page: 1, pageSize: 15, category: '', type: '', from: '', to: ''
                    })}>
                    Clear
                </button>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="loading"><span className="spinner" /></div>
                ) : data.items.length === 0 ? (
                    <div className="empty-state">No transactions found</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Notes</th>
                                <th>Added By</th>
                                <th>Type</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                {isAnalyst && <th style={{ textAlign: 'center' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((t) => (
                                <tr key={t.id}>
                                    <td style={{ color: 'var(--text2)' }}>
                                        {new Date(t.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{t.category}</td>
                                    <td style={{ color: 'var(--text2)' }}>{t.notes || '—'}</td>
                                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{t.userName}</td>
                                    <td>
                                        <span className={`badge badge-${t.type.toLowerCase()}`}>{t.type}</span>
                                    </td>
                                    <td style={{
                                        textAlign: 'right', fontWeight: 600,
                                        color: t.type === 'Income' ? 'var(--income)' : 'var(--expense)'
                                    }}>
                                        {t.type === 'Income' ? '+' : '-'}{fmt(t.amount)}
                                    </td>
                                    {isAnalyst && (
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                <button className="btn btn-ghost" style={{ padding: '5px 8px' }}
                                                    onClick={() => setModal({ mode: 'edit', tx: t })}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-danger" style={{ padding: '5px 8px' }}
                                                    onClick={() => handleDelete(t.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div style={{
                    display: 'flex', gap: 8, justifyContent: 'center',
                    marginTop: 16, alignItems: 'center'
                }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px' }}
                        disabled={filters.page === 1}
                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                        Prev
                    </button>
                    <span style={{ color: 'var(--text2)', fontSize: 13 }}>
                        Page {filters.page} of {data.totalPages}
                    </span>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px' }}
                        disabled={filters.page === data.totalPages}
                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                        Next
                    </button>
                </div>
            )}

            {modal && (
                <TransactionModal
                    initial={modal.tx ? {
                        amount: modal.tx.amount,
                        type: modal.tx.type,
                        category: modal.tx.category,
                        date: new Date(modal.tx.date).toISOString().split('T')[0],
                        notes: modal.tx.notes || '',
                    } : null}
                    onSave={handleSave}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}