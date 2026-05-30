import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

// ── API base: dynamic for local testing and live deployment
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

/* ─── Inject Google Fonts ─── */
if (!document.querySelector('link[href*="DM+Mono"]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&display=swap';
    document.head.appendChild(l);
}

/* ══════════════════════════════════
   SHARED ATOMS (COMPONENT MODULARITY)
══════════════════════════════════ */
function Spinner() {
    return (
        <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#21262d] border-t-[#2f81f7]" />
        </div>
    );
}

function ErrBanner({ msg }) {
    return <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg p-3 text-[13px] text-[#f85149]">⚠️ {msg}</div>;
}

function RolePill({ role }) {
    const styles = {
        super_admin: 'bg-[#f85149]/15 text-[#f85149] border-[#f85149]/30',
        admin: 'bg-[#bc8cff]/15 text-[#bc8cff] border-[#bc8cff]/30',
        manager: 'bg-[#2f81f7]/15 text-[#2f81f7] border-[#2f81f7]/30',
        storekeeper: 'bg-[#d29922]/15 text-[#d29922] border-[#d29922]/30',
        user: 'bg-[#7d8590]/15 text-[#7d8590] border-[#7d8590]/30',
    };
    const active = styles[role] || styles.user;
    return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${active}`}>{role?.replace('_', ' ') || '—'}</span>;
}

function Badge({ text, color }) {
    const styles = {
        green: 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/25',
        orange: 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/25',
        red: 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/25',
        blue: 'bg-[#2f81f7]/10 text-[#2f81f7] border-[#2f81f7]/25',
        purple: 'bg-[#bc8cff]/10 text-[#bc8cff] border-[#bc8cff]/25',
        gray: 'bg-[#7d8590]/10 text-[#7d8590] border-[#7d8590]/25',
    };
    const active = styles[color] || styles.gray;
    return <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider border ${active}`}>{text}</span>;
}

function Avatar({ name, size = 32 }) {
    const ini = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    return (
        <div 
            className="rounded-full bg-linear-to-br from-[#2f81f7] to-[#1f6feb] flex items-center justify-center font-bold text-white shrink-0 text-xs shadow-sm" 
            style={{ width: size, height: size }}
        >
            {ini}
        </div>
    );
}

function Empty({ icon = '📭', msg = 'No data found' }) {
    return (
        <div className="flex flex-col items-center justify-center py-14 px-8 text-[#7d8590] gap-2.5">
            <div className="text-4xl opacity-35">{icon}</div>
            <p className="text-[13px] font-medium m-0">{msg}</p>
        </div>
    );
}

const Input = ({ ...props }) => (
    <input className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 text-[13px] text-[#e6edf3] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-none transition-colors w-full placeholder:text-[#7d8590]" {...props} />
);

/* ══════════════════════════════════
   OVERVIEW / STATS
══════════════════════════════════ */
function StatsSection({ token }) {
    const [stats, setStats] = useState(null);
    const [oData, setOData] = useState(null);
    const [loading, setLoad] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        const h = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API}/products/stats`, { headers: h }).then(r => r.json()),
            fetch(`${API}/orders/all`, { headers: h }).then(r => r.json()),
        ]).then(([p, o]) => {
            setStats(p); setOData(o); setLoad(false);
        }).catch(() => { setErr(`Network error — check connection to backend.`); setLoad(false); });
    }, [token]);

    if (loading) return <Spinner />;

    const cards = [
        { label: 'Total Revenue', val: `NGN ${(oData?.totalRevenue || 0).toLocaleString('en-NG')}`, sub: 'From paid orders', dot: '#3fb950', glow: 'rgba(63,185,80,.15)' },
        { label: 'Total Orders', val: oData?.totalOrders || 0, sub: `${oData?.totalProcessing || 0} processing`, dot: '#2f81f7', glow: 'rgba(47,129,247,.15)' },
        { label: 'Delivered', val: oData?.totalDelivered || 0, sub: 'Orders fulfilled', dot: '#bc8cff', glow: 'rgba(188,140,255,.15)' },
        { label: 'Total Products', val: stats?.totalProducts || 0, sub: 'In catalogue', dot: '#2f81f7', glow: 'rgba(47,129,247,.15)' },
        { label: 'Low Stock', val: stats?.lowStock || 0, sub: '≤ 10 units', dot: '#d29922', glow: 'rgba(210,153,34,.15)' },
        { label: 'Out of Stock', val: stats?.outOfStock || 0, sub: 'Zero units remaining', dot: '#f85149', glow: 'rgba(248,81,73,.15)' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {err && <ErrBanner msg={err} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map(c => (
                    <div key={c.label} className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 hover:border-[#30363d] transition-all" style={{ boxShadow: `0 0 0 1px ${c.glow}` }}>
                        <div className="flex items-center gap-2 mb-3 text-[11px] font-bold tracking-widest uppercase text-[#7d8590]">
                            <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: c.dot, boxShadow: `0 0 6px ${c.dot}` }} />
                            {c.label}
                        </div>
                        <div className="text-[26px] font-bold text-[#e6edf3] leading-none" style={{ fontFamily: 'DM Mono, monospace' }}>{c.val}</div>
                        {c.sub && <div className="text-[11px] text-[#7d8590] mt-2">{c.sub}</div>}
                    </div>
                ))}
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-[#30363d] transition-colors">
                <div className="px-5 py-4 border-b border-[#21262d] flex justify-between items-center bg-white/5">
                    <span className="font-bold text-[14px]">Recent Transactions</span>
                    <Badge text={`${oData?.orders?.length || 0} total`} color="gray" />
                </div>
                {!(oData?.orders?.length) ? <Empty icon="📋" msg="No orders yet" /> :
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d]">Order</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d]">Customer</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-right border-b border-[#21262d]">Amount</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262d]/80">
                            {(oData.orders || []).slice(0, 6).map(o => (
                                <tr key={o._id} className="hover:bg-white/2 transition-colors">
                                    <td className="px-5 py-3 align-middle"><span className="text-[#2f81f7] text-[12px] font-medium" style={{ fontFamily: 'DM Mono, monospace' }}>{o.orderNumber}</span></td>
                                    <td className="px-5 py-3 align-middle text-[#7d8590] text-[12px]">{o.user?.name || '—'}</td>
                                    <td className="px-5 py-3 align-middle text-right"><span className="text-[#3fb950] font-medium text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>NGN {o.totalPrice?.toLocaleString('en-NG')}</span></td>
                                    <td className="px-5 py-3 align-middle text-center"><Badge text={o.isDelivered ? 'Delivered' : 'Processing'} color={o.isDelivered ? 'green' : 'orange'} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>
        </div>
    );
}

/* ══════════════════════════════════
   ORDERS
══════════════════════════════════ */
function OrdersSection({ token, isAdmin }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoad] = useState(true);
    const [marking, setMark] = useState(null);
    const [search, setSrch] = useState('');

    useEffect(() => {
        fetch(`${API}/orders/all`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { setOrders(d.orders || []); setLoad(false); })
            .catch(() => setLoad(false));
    }, [token]);

    const markDelivered = async id => {
        setMark(id);
        try {
            const res = await fetch(`${API}/orders/${id}/deliver`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setOrders(prev => prev.map(o => o._id === id ? data.order : o));
        } catch (e) { alert(e.message); } finally { setMark(null); }
    };

    const filtered = orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <p className="text-[13px] text-[#7d8590] m-0 font-medium">{orders.length} total records</p>
                <Input placeholder="Search order ID or customer..." value={search} onChange={e => setSrch(e.target.value)} className="w-full sm:w-64" />
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-[#30363d] transition-colors">
                {!filtered.length ? <Empty icon="📦" msg={search ? 'No matching orders' : 'No orders yet'} /> :
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Order No.</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Customer Info</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Date</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-right border-b border-[#21262d] bg-white/5">Total</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Status</th>
                                {isAdmin && <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262d]/80">
                            {filtered.map(o => (
                                <tr key={o._id} className="hover:bg-white/2 transition-colors">
                                    <td className="px-5 py-3 align-middle"><span className="text-[#2f81f7] text-[12px] font-medium" style={{ fontFamily: 'DM Mono, monospace' }}>{o.orderNumber}</span></td>
                                    <td className="px-5 py-3 align-middle">
                                        <div className="font-medium text-[13px]">{o.user?.name}</div>
                                        <div className="text-[11px] text-[#7d8590]">{o.user?.email}</div>
                                    </td>
                                    <td className="px-5 py-3 align-middle text-[12px] text-[#7d8590]">{new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="px-5 py-3 align-middle text-right"><span className="text-[#3fb950] font-medium text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>NGN {o.totalPrice?.toLocaleString('en-NG')}</span></td>
                                    <td className="px-5 py-3 align-middle text-center"><Badge text={o.isDelivered ? 'Delivered' : 'Processing'} color={o.isDelivered ? 'green' : 'orange'} /></td>
                                    {isAdmin && <td className="px-5 py-3 align-middle text-center">
                                        {!o.isDelivered ? (
                                            <button className="bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/25 hover:bg-[#3fb950]/20 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors disabled:opacity-50" disabled={marking === o._id} onClick={() => markDelivered(o._id)}>
                                                {marking === o._id ? 'Updating...' : 'Mark Delivered'}
                                            </button>
                                        ) : <span className="text-[11px] text-[#7d8590] italic">Complete</span>}
                                    </td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>
        </div>
    );
}

/* ══════════════════════════════════
   USERS & PERMISSIONS
══════════════════════════════════ */
function UsersSection({ token, currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoad] = useState(true);
    const [updating, setUpd] = useState(null);
    const [deleting, setDel] = useState(null);
    const [search, setSrch] = useState('');
    const [roleFilter, setRF] = useState('all');
    const [page, setPage] = useState(1);
    const PER = 10;

    useEffect(() => {
        fetch(`${API}/auth/users`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { setUsers(d.users || []); setLoad(false); })
            .catch(() => setLoad(false));
    }, [token]);

    const changeRole = async (uid, role) => {
        setUpd(uid);
        try {
            const res = await fetch(`${API}/auth/users/${uid}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUsers(prev => prev.map(u => u._id === uid ? data.user : u));
        } catch (e) { alert(e.message); } finally { setUpd(null); }
    };

    const deleteUser = async uid => {
        if (!window.confirm('Delete this user permanently?')) return;
        setDel(uid);
        try {
            const res = await fetch(`${API}/auth/users/${uid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            const d = await res.json();
            if (!res.ok) throw new Error(d.message);
            setUsers(prev => prev.filter(u => u._id !== uid));
        } catch (e) { alert(e.message); } finally { setDel(null); }
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const ms = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        const mr = roleFilter === 'all' ? true : roleFilter === 'staff' ? ['super_admin', 'admin', 'manager', 'storekeeper'].includes(u.role) : u.role === 'user';
        return ms && mr;
    });
    
    const pages = Math.ceil(filtered.length / PER);
    const slice = filtered.slice((page - 1) * PER, page * PER);
    useEffect(() => setPage(1), [search, roleFilter]);

    if (loading) return <Spinner />;

    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Total Accounts', val: users.length, color: '#2f81f7' },
                    { label: 'Staff Members', val: users.filter(u => ['super_admin', 'admin', 'manager', 'storekeeper'].includes(u.role)).length, color: '#bc8cff' },
                    { label: 'Customers', val: users.filter(u => u.role === 'user').length, color: '#3fb950' },
                ].map(c => (
                    <div key={c.label} className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 hover:border-[#30363d] transition-colors">
                        <div className="text-[11px] font-bold tracking-widest uppercase text-[#7d8590] mb-2">{c.label}</div>
                        <div className="text-[22px] font-bold" style={{ color: c.color, fontFamily: 'DM Mono, monospace' }}>{c.val}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex gap-1 bg-white/4 border border-[#21262d] p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                    {['all', 'staff', 'customers'].map(f => (
                        <button key={f} onClick={() => setRF(f)} className={`px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all whitespace-nowrap flex-1 md:flex-none ${roleFilter === f ? 'bg-[#2f81f7] text-white' : 'text-[#7d8590] hover:bg-white/5'}`}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <Input placeholder="Search name or email..." value={search} onChange={e => setSrch(e.target.value)} className="w-full md:w-64" />
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-[#30363d] transition-colors">
                {!slice.length ? <Empty icon="👥" msg="No users found" /> :
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">User</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Joined</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Role</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Change Role</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-right border-b border-[#21262d] bg-white/5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262d]/80">
                            {slice.map(u => {
                                const isSelf = currentUser?._id === u._id;
                                const isSuperT = u.role === 'super_admin';
                                const isAdminT = u.role === 'admin';
                                const iAmAdmin = currentUser?.role === 'admin';
                                const iAmSuper = currentUser?.role === 'super_admin';
                                const canMod = !isSelf && !isSuperT && !(iAmAdmin && isAdminT);
                                return (
                                    <tr key={u._id} className="hover:bg-white/2 transition-colors">
                                        <td className="px-5 py-3 align-middle">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={u.name} size={34} />
                                                <div>
                                                    <div className="font-semibold text-[13px] text-[#e6edf3]">{u.name}</div>
                                                    <div className="text-[11px] text-[#7d8590]">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 align-middle text-[12px] text-[#7d8590]">{new Date(u.createdAt).toLocaleDateString('en-NG')}</td>
                                        <td className="px-5 py-3 align-middle text-center"><RolePill role={u.role} /></td>
                                        <td className="px-5 py-3 align-middle text-center">
                                            <select className="bg-[#0d1117] border border-[#21262d] rounded-md px-2.5 py-1.5 text-[12px] text-[#e6edf3] outline-none focus:border-[#2f81f7] disabled:opacity-50 cursor-pointer" value={u.role} disabled={!canMod || updating === u._id} onChange={e => changeRole(u._id, e.target.value)}>
                                                {isSuperT && <option value="super_admin">super_admin</option>}
                                                <option value="user">user</option>
                                                <option value="storekeeper">storekeeper</option>
                                                <option value="manager">manager</option>
                                                {iAmSuper && <option value="admin">admin</option>}
                                            </select>
                                        </td>
                                        <td className="px-5 py-3 align-middle text-right">
                                            {canMod ? (
                                                <button className="bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/25 hover:bg-[#f85149]/20 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors disabled:opacity-50" disabled={deleting === u._id} onClick={() => deleteUser(u._id)}>
                                                    {deleting === u._id ? 'Removing...' : 'Revoke Access'}
                                                </button>
                                            ) : <span className="text-[11px] text-[#7d8590]">🔒 Protected</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>}
                
                {pages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-[#21262d]">
                        <span className="text-[12px] text-[#7d8590]">{(page - 1) * PER + 1}–{Math.min(page * PER, filtered.length)} of {filtered.length}</span>
                        <div className="flex gap-2">
                            <button className="bg-white/5 border border-[#21262d] text-[#e6edf3] px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-white/10 disabled:opacity-40 transition-colors" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                            <button className="bg-white/5 border border-[#21262d] text-[#e6edf3] px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-white/10 disabled:opacity-40 transition-colors" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════
   PRODUCTS
══════════════════════════════════ */
function ProductsSection({ token }) {
    const [products, setProd] = useState([]);
    const [cats, setCats] = useState([]);
    const [loading, setLoad] = useState(true);
    const [deleting, setDel] = useState(null);
    const [search, setSrch] = useState('');
    const [modal, setModal] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formErr, setFErr] = useState(null);

    const empty = { name: '', sku: '', price: '', stock_quantity: '', description: '', category_id: '' };
    const [form, setForm] = useState(empty);
    const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

    useEffect(() => {
        const h = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API}/products?limit=200`, { headers: h }).then(r => r.json()),
            fetch(`${API}/categories`, { headers: h }).then(r => r.json()),
        ]).then(([p, c]) => { setProd(p.products || []); setCats(c.categories || c || []); setLoad(false); })
          .catch(() => setLoad(false));
    }, [token]);

    const openAdd = () => { setFErr(null); setForm(empty); setModal('add'); };
    const openEdit = p => { setFErr(null); setForm({ name: p.name || '', sku: p.sku || '', price: p.price || '', stock_quantity: p.stock_quantity || '', description: p.description || '', category_id: p.category_id?._id || p.category_id || '' }); setModal(p); };
    const close = () => { setModal(null); setForm(empty); setFErr(null); };

    const save = async () => {
        setSaving(true); setFErr(null);
        try {
            const isEdit = modal !== 'add';
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (k !== 'imageFile' && v !== '') fd.append(k, v); });
            if (form.imageFile) fd.append('image', form.imageFile);
            
            const res = await fetch(isEdit ? `${API}/products/${modal._id}` : `${API}/products`, { method: isEdit ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            if (isEdit) setProd(prev => prev.map(p => p._id === modal._id ? data.product : p));
            else setProd(prev => [data.product, ...prev]);
            close();
        } catch (e) { setFErr(e.message); } finally { setSaving(false); }
    };

    const del = async id => {
        if (!window.confirm('Delete this product?')) return;
        setDel(id);
        try {
            const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed');
            setProd(prev => prev.filter(p => p._id !== id));
        } catch (e) { alert(e.message); } finally { setDel(null); }
    };

    const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));
    if (loading) return <Spinner />;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <p className="text-[13px] text-[#7d8590] m-0 font-medium">{products.length} items in catalogue</p>
                <div className="flex gap-2.5 w-full sm:w-auto">
                    <Input placeholder="Search name or SKU..." value={search} onChange={e => setSrch(e.target.value)} className="w-full sm:w-56" />
                    <button className="bg-[#2f81f7] text-white hover:bg-[#1f6feb] border border-[#1f6feb] px-4 py-2 rounded-lg text-[12px] font-bold transition-colors whitespace-nowrap" onClick={openAdd}>+ Add Product</button>
                </div>
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-[#30363d] transition-colors">
                {!filtered.length ? <Empty icon="🏷️" msg="No products found" /> :
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Product</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">SKU / Serial</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-right border-b border-[#21262d] bg-white/5">Unit Price</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Stock</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Registered By</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262d]/80">
                            {filtered.map(p => (
                                <tr key={p._id} className="hover:bg-white/2 transition-colors">
                                    <td className="px-5 py-3 align-middle">
                                        <div className="flex items-center gap-3">
                                            {p.image ? <img src={p.image} alt={p.name} className="w-9 h-9 rounded-md object-cover border border-[#21262d] shrink-0" />
                                                     : <div className="w-9 h-9 rounded-md bg-[#21262d] flex items-center justify-center text-lg shrink-0">📦</div>}
                                            <span className="font-semibold text-[13px]">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 align-middle"><span className="text-[11px] text-[#7d8590]" style={{ fontFamily: 'DM Mono, monospace' }}>{p.sku}</span></td>
                                    <td className="px-5 py-3 align-middle text-right"><span className="text-[#3fb950] font-medium text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>NGN {p.price?.toLocaleString('en-NG')}</span></td>
                                    <td className="px-5 py-3 align-middle text-center"><Badge text={`${p.stock_quantity} units`} color={p.stock_quantity === 0 ? 'red' : p.stock_quantity <= 10 ? 'orange' : 'green'} /></td>
                                    <td className="px-5 py-3 align-middle">
                                        <span className="font-semibold text-[13px] block">{p.user?.name || 'System Root'}</span>
                                        <span className="text-[11px] text-[#7d8590] capitalize">{p.user?.role || 'operator'}</span>
                                    </td>
                                    <td className="px-5 py-3 align-middle text-center">
                                        <div className="flex justify-center gap-2">
                                            <button className="bg-white/5 border border-[#21262d] text-[#e6edf3] px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-white/10 transition-colors" onClick={() => openEdit(p)}>Edit</button>
                                            <button className="bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/25 hover:bg-[#f85149]/20 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors disabled:opacity-50" disabled={deleting === p._id} onClick={() => del(p._id)}>{deleting === p._id ? '...' : 'Delete'}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>

            {/* Modal */}
            {modal !== null && (
                <div className="fixed inset-0 bg-[#010409]/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
                    <div className="bg-[#161b22] border border-[#21262d] rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-[#21262d] shrink-0 bg-white/2">
                            <h3 className="text-[15px] font-bold m-0">{modal === 'add' ? 'Register New Product' : `Modify — ${modal.name}`}</h3>
                            <button className="text-[#7d8590] hover:text-[#e6edf3] transition-colors" onClick={close}>✕</button>
                        </div>
                        
                        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
                            {formErr && <ErrBanner msg={formErr} />}
                            
                            <div>
                                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#7d8590] mb-1.5">Product Designation</label>
                                <Input value={form.name} onChange={e => F('name', e.target.value)} placeholder="e.g. Sony FX3" />
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#7d8590] mb-1.5">SKU Barcode Reference</label>
                                <Input value={form.sku} onChange={e => F('sku', e.target.value)} placeholder="e.g. SNY-FX3-01" style={{ fontFamily: 'DM Mono, monospace' }} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider uppercase text-[#7d8590] mb-1.5">Base Price (NGN)</label>
                                    <Input type="number" value={form.price} onChange={e => F('price', e.target.value)} placeholder="75000" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider uppercase text-[#7d8590] mb-1.5">Stock Quantity</label>
                                    <Input type="number" value={form.stock_quantity} onChange={e => F('stock_quantity', e.target.value)} placeholder="25" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#7d8590] mb-1.5">Category</label>
                                <select className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 text-[13px] text-[#e6edf3] outline-none focus:border-[#2f81f7] w-full" value={form.category_id} onChange={e => F('category_id', e.target.value)}>
                                    <option value="">Select category...</option>
                                    {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#7d8590] mb-1.5">Description</label>
                                <textarea className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 text-[13px] text-[#e6edf3] outline-none focus:border-[#2f81f7] w-full resize-none h-20 placeholder:text-[#7d8590]" value={form.description} onChange={e => F('description', e.target.value)} placeholder="Technical specs & particulars..." />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#7d8590] mb-1.5">Display Image {modal !== 'add' && <span className="normal-case tracking-normal font-normal opacity-70">(optional override)</span>}</label>
                                <input type="file" accept="image/*" onChange={e => F('imageFile', e.target.files[0])} className="w-full text-[13px] text-[#7d8590] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-[#e6edf3] hover:file:bg-white/10" />
                            </div>
                        </div>

                        <div className="flex gap-3 p-5 border-t border-[#21262d] shrink-0 bg-white/2">
                            <button className="flex-1 bg-white/5 border border-[#21262d] text-[#e6edf3] py-2.5 rounded-lg text-[12px] font-bold hover:bg-white/10 transition-colors" onClick={close}>Discard</button>
                            <button className="flex-1 bg-[#2f81f7] text-white border border-[#1f6feb] py-2.5 rounded-lg text-[12px] font-bold hover:bg-[#1f6feb] transition-colors disabled:opacity-50" disabled={saving} onClick={save}>{saving ? 'Saving...' : modal === 'add' ? 'Confirm Addition' : 'Apply Changes'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════
   LOW STOCK
══════════════════════════════════ */
function LowStockSection({ token }) {
    const [products, setProd] = useState([]);
    const [loading, setLoad] = useState(true);

    useEffect(() => {
        fetch(`${API}/products/low-stock`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { setProd(d.products || []); setLoad(false); }).catch(() => setLoad(false));
    }, [token]);

    if (loading) return <Spinner />;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
                <p className="text-[13px] text-[#7d8590] m-0 font-medium">Tracking items below optimal threshold</p>
                {products.length > 0 && <Badge text={`${products.length} alerts`} color="red" />}
            </div>
            
            {!products.length ? (
                <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-12 text-center text-[#3fb950] font-semibold text-[14px]">
                    ✅ All warehouse stores are optimally stocked.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map(p => (
                        <div key={p._id} className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 hover:border-[#30363d] transition-colors" style={{ borderLeftWidth: '3px', borderLeftColor: p.stock_quantity === 0 ? '#f85149' : '#d29922' }}>
                            <div className="flex gap-3 mb-3">
                                {p.image ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover shrink-0" />
                                         : <div className="w-10 h-10 rounded-md bg-[#21262d] flex items-center justify-center shrink-0">📦</div>}
                                <div>
                                    <div className="font-semibold text-[13px] leading-tight">{p.name}</div>
                                    <div className="text-[10px] text-[#7d8590] mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>{p.sku}</div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Badge text={p.stock_quantity === 0 ? 'Exhausted' : `${p.stock_quantity} left`} color={p.stock_quantity === 0 ? 'red' : 'orange'} />
                                <span className="text-[#3fb950] font-medium text-[12px]" style={{ fontFamily: 'DM Mono, monospace' }}>NGN {p.price?.toLocaleString('en-NG')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════
   STOCK MOVEMENTS
══════════════════════════════════ */
function StockMovementsSection({ token }) {
    const [movements, setMov] = useState([]);
    const [loading, setLoad] = useState(true);

    useEffect(() => {
        fetch(`${API}/stock-movements`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { setMov(d.movements || d || []); setLoad(false); }).catch(() => setLoad(false));
    }, [token]);

    if (loading) return <Spinner />;

    return (
        <div className="flex flex-col gap-4">
            <div className="mb-2">
                <p className="text-[13px] text-[#7d8590] m-0 font-medium">{movements.length} audit records found</p>
            </div>
            
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-[#30363d] transition-colors">
                {!movements.length ? <Empty icon="📈" msg="No stock movements yet" /> :
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Product</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Operator</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Type</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Change</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-center border-b border-[#21262d] bg-white/5">Before → After</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262d]/80">
                            {movements.map(m => (
                                <tr key={m._id} className="hover:bg-white/2 transition-colors">
                                    <td className="px-5 py-3 align-middle font-semibold text-[13px]">{m.product?.name || '—'}</td>
                                    <td className="px-5 py-3 align-middle text-[12px] text-[#7d8590]">{m.user?.name || '—'}</td>
                                    <td className="px-5 py-3 align-middle text-center"><Badge text={m.type} color={m.type === 'IN' ? 'green' : 'red'} /></td>
                                    <td className="px-5 py-3 align-middle text-center">
                                        <span className={`font-bold ${m.type === 'IN' ? 'text-[#3fb950]' : 'text-[#f85149]'}`} style={{ fontFamily: 'DM Mono, monospace' }}>
                                            {m.type === 'IN' ? '▲' : '▼'} {m.quantity_change}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 align-middle text-center">
                                        <span className="text-[12px] text-[#7d8590]" style={{ fontFamily: 'DM Mono, monospace' }}>{m.previous_quantity} → <strong className="text-[#e6edf3]">{m.new_quantity}</strong></span>
                                    </td>
                                    <td className="px-5 py-3 align-middle text-[12px] text-[#7d8590]">{new Date(m.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>
        </div>
    );
}

/* ══════════════════════════════════
   AUDIT LOGS
══════════════════════════════════ */
function AuditLogsSection({ token }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoad] = useState(true);
    const [search, setSrch] = useState('');

    useEffect(() => {
        fetch(`${API}/products/audit-logs`, { headers: { Authorization: `Bearer ${token}` } })
            .then(async r => { if (!r.ok) return []; return r.json(); })
            .then(d => { setLogs(Array.isArray(d) ? d : []); setLoad(false); })
            .catch(() => setLoad(false));
    }, [token]);

    const actionMap = {
        PRICE_CHANGE: { label: 'Price Override', cls: 'orange' },
        NAME_CHANGE: { label: 'Name Changed', cls: 'blue' },
        PRODUCT_DELETED: { label: 'Asset Deleted', cls: 'red' },
        PRODUCT_CREATED: { label: 'Asset Created', cls: 'green' },
    };

    const filtered = logs.filter(l =>
        l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.toLowerCase().includes(search.toLowerCase()) ||
        l.product?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <p className="text-[13px] text-[#7d8590] m-0 font-medium">{logs.length} immutable records logged</p>
                <Input placeholder="Search logs, operators, assets..." value={search} onChange={e => setSrch(e.target.value)} className="w-full sm:w-64" />
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-[#30363d] transition-colors">
                {!filtered.length ? <Empty icon="🛡️" msg="No audit logs yet" /> :
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Timestamp</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Action</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Actor</th>
                                <th className="px-5 py-3 text-[11px] font-bold tracking-wider uppercase text-[#7d8590] text-left border-b border-[#21262d] bg-white/5">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262d]/80">
                            {filtered.map(l => {
                                const a = actionMap[l.action] || { label: l.action, cls: 'gray' };
                                return (
                                    <tr key={l._id} className="hover:bg-white/2 transition-colors">
                                        <td className="px-5 py-3 align-middle">
                                            <div className="text-[12px]" style={{ fontFamily: 'DM Mono, monospace' }}>{new Date(l.createdAt).toLocaleDateString('en-NG')}</div>
                                            <div className="text-[11px] text-[#7d8590]">{new Date(l.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-5 py-3 align-middle"><Badge text={a.label} color={a.cls} /></td>
                                        <td className="px-5 py-3 align-middle">
                                            <div className="font-semibold text-[13px] mb-1">{l.user?.name || '—'}</div>
                                            <RolePill role={l.user?.role} />
                                        </td>
                                        <td className="px-5 py-3 align-middle text-[12px] text-[#7d8590] max-w-xs">
                                            <div className="text-[#e6edf3]">{l.details}</div>
                                            {l.product && <span className="inline-block mt-1 bg-white/5 px-1.5 py-0.5 rounded text-[10px]" style={{ fontFamily: 'DM Mono, monospace' }}>{l.product.name} ({l.product.sku})</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>}
            </div>
        </div>
    );
}

/* ══════════════════════════════════
   MAIN SHELL
══════════════════════════════════ */
export default function AdminDashboard() {
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const role = userInfo?.role;

    const [isHovered, setIsHovered] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!userInfo) { navigate('/login'); return; }
        if (!['super_admin', 'admin', 'manager', 'storekeeper'].includes(role)) navigate('/');
    }, [userInfo, role, navigate]);

    const allTabs = [
        { id: 'stats', emoji: '📊', label: 'Overview', roles: ['super_admin', 'admin', 'manager'] },
        { id: 'orders', emoji: '📦', label: 'Orders', roles: ['super_admin', 'admin', 'manager'] },
        { id: 'products', emoji: '🏷️', label: 'Products', roles: ['super_admin', 'admin', 'storekeeper'] },
        { id: 'stock', emoji: '📈', label: 'Stock Movements', roles: ['super_admin', 'admin', 'storekeeper'] },
        { id: 'lowstock', emoji: '⚠️', label: 'Low Stock', roles: ['super_admin', 'admin', 'manager', 'storekeeper'] },
        { id: 'users', emoji: '👥', label: 'Users & Permissions', roles: ['super_admin', 'admin'] },
        { id: 'audit', emoji: '🛡️', label: 'System Logs', roles: ['super_admin'] },
    ];
    
    const tabs = allTabs.filter(t => t.roles.includes(role));
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'lowstock');

    const isOpen = isMobile ? mobileOpen : isHovered;
    const handleTabClick = (id) => { setActiveTab(id); if (isMobile) setMobileOpen(false); };

    if (!userInfo) return null;

    return (
        <div className="fixed inset-0 z-100 flex bg-[#0d1117] text-[#e6edf3] font-sans overflow-hidden">
            
            {/* Mobile Backdrop */}
            <div 
                className={`fixed inset-0 bg-[#010409]/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setMobileOpen(false)}
            />

            {/* ── SIDEBAR ── */}
            <aside
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
                className={`bg-[#161b22] border-r border-[#21262d] h-full flex flex-col transition-all duration-300 ease-in-out shrink-0 z-50 fixed md:relative overflow-x-hidden ${
                    isOpen ? 'w-64 shadow-[8px_0_32px_rgba(0,0,0,0.6)] md:shadow-none' : (isMobile ? 'w-0 border-r-0' : 'w-17')
                }`}
            >
                {/* Logo Area */}
                {/* Logo Area */}
                <div 
                    onClick={() => navigate('/')}
                    className="h-17 flex items-center px-4 border-b border-[#21262d] shrink-0 cursor-pointer hover:bg-white/2 transition-colors overflow-hidden"
                    title="Return to Storefront"
                >
                    <div className="flex items-center gap-3 w-50">
                        
                        {/* 🌟 NEW IMAGE LOGO */}
                        <img 
                            src={logo} 
                            alt="Seyi Inventory" 
                            className="w-9 h-9 rounded-full object-contain shrink-0 border border-[#30363d] bg-[#e6edf3]" 
                        />
                        
                        <div className={`transition-opacity duration-300 whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="text-[15px] font-black text-[#e6edf3] tracking-tight leading-none uppercase">
                                SEYI<span className="text-[#2f81f7]">INVENTORY</span>
                            </div>
                            <div className="text-[9px] text-[#7d8590] tracking-[0.15em] font-bold mt-1 leading-none uppercase">SYSTEM</div>
                        </div>
                    </div>
                </div>
                
                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-0.5">
                    <div className={`px-4 pb-2 text-[10px] font-bold tracking-widest text-[#7d8590] uppercase transition-all duration-300 whitespace-nowrap overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0  max-w-0'}`}>
                        Navigation
                    </div>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex items-center h-10 px-3 rounded-lg transition-all duration-150 shrink-0 border border-transparent whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-[#2f81f7]/10 text-[#2f81f7] border-[#2f81f7]/25'
                                    : 'text-[#7d8590] hover:bg-white/5 hover:text-[#e6edf3]'
                            }`}
                        >
                            <span className="w-7 text-center text-[16px] shrink-0">{tab.emoji}</span>
                            <span className={`font-medium text-[13px] transition-all duration-300 overflow-hidden ml-1 ${
                                isOpen ? 'opacity-100 w-full text-left' : 'opacity-0 w-0'
                            }`}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* User Footer Component */}
                <div className="p-3 border-t border-[#21262d] shrink-0">
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/4 border border-[#21262d] overflow-hidden whitespace-nowrap">
                        <Avatar name={userInfo.name} size={32} />
                        <div className={`transition-opacity duration-300 flex flex-col justify-center ${isOpen ? 'opacity-100 w-32.5' : 'opacity-0 w-0'}`}>
                            <span className="text-[13px] font-semibold text-[#e6edf3] truncate">{userInfo.name}</span>
                            <RolePill role={role} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 h-full flex flex-col min-w-0 bg-[#0d1117] transition-all">
                
                {/* Top Sticky Header */}
                <header className="h-17 flex items-center justify-between px-6 border-b border-[#21262d] bg-[#161b22] shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-[#7d8590] hover:text-[#e6edf3] text-xl px-2" onClick={() => setMobileOpen(!mobileOpen)}>
                            ☰
                        </button>
                        <div>
                            <h1 className="text-[18px] font-bold text-[#e6edf3] m-0 leading-tight tracking-wide">
                                {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
                            </h1>
                            <p className="text-[11px] text-[#7d8590] m-0">Management Console</p>
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-2 bg-[#2f81f7]/10 border border-[#2f81f7]/20 rounded-lg px-3.5 py-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse shadow-[0_0_6px_#3fb950]" />
                        <span className="text-[11px] font-bold text-[#2f81f7] tracking-[0.07em] uppercase">{role?.replace('_', ' ')} Privileges</span>
                    </div>
                </header>

                {/* Scrollable Workspace */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-350 mx-auto pb-12">
                        {activeTab === 'stats' && <StatsSection token={userInfo.token} />}
                        {activeTab === 'orders' && <OrdersSection token={userInfo.token} isAdmin={['admin', 'super_admin'].includes(role)} />}
                        {activeTab === 'products' && <ProductsSection token={userInfo.token} />}
                        {activeTab === 'stock' && <StockMovementsSection token={userInfo.token} />}
                        {activeTab === 'lowstock' && <LowStockSection token={userInfo.token} />}
                        {activeTab === 'users' && <UsersSection token={userInfo.token} currentUser={userInfo} />}
                        {activeTab === 'audit' && <AuditLogsSection token={userInfo.token} />}
                    </div>
                </div>
            </main>
        </div>
    );
}