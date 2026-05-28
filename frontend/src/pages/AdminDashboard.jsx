import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'https://seyi-inventory.onrender.com/api';

function Spinner() {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
    );
}

function StatCard({ label, value, color = 'blue', sub }) {
    const colors = {
        blue: 'bg-white border-l-4 border-l-blue-600 text-gray-800',
        green: 'bg-white border-l-4 border-l-green-600 text-gray-800',
        orange: 'bg-white border-l-4 border-l-orange-500 text-gray-800',
        red: 'bg-white border-l-4 border-l-red-600 text-gray-800',
        purple: 'bg-white border-l-4 border-l-purple-600 text-gray-800',
    };
    return (
        <div className={`rounded-xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${colors[color]}`}>
            <p className="text-xs font-bold tracking-wider uppercase text-gray-400 mb-1">{label}</p>
            <p className="text-3xl font-extrabold tracking-tight text-gray-900">{value ?? '—'}</p>
            {sub && <p className="text-xs mt-1.5 text-gray-500 font-medium">{sub}</p>}
        </div>
    );
}

function RoleBadge({ role }) {
    const map = {
        super_admin: 'bg-red-50 text-red-700 border border-red-200/60',
        admin: 'bg-purple-50 text-purple-700 border border-purple-200/60',
        manager: 'bg-blue-50 text-blue-700 border border-blue-200/60',
        storekeeper: 'bg-amber-50 text-amber-700 border border-amber-200/60',
        user: 'bg-gray-50 text-gray-600 border border-gray-200/60',
    };
    return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-center inline-block ${map[role] || map.user}`}>
            {role.replace('_', ' ')}
        </span>
    );
}

// ══════════════════════════════════════════
// OVERVIEW / STATS
// ══════════════════════════════════════════
function StatsSection({ token }) {
    const [stats, setStats] = useState(null);
    const [orderData, setOData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const h = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API}/products/stats`, { headers: h }).then(r => r.json()),
            fetch(`${API}/orders/all`, { headers: h }).then(r => r.json()),
        ]).then(([p, o]) => {
            setStats(p);
            setOData(o);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [token]);

    if (loading) return <Spinner />;

    const delivered = orderData?.totalDelivered || 0;
    const processing = orderData?.totalProcessing || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard label="Total Revenue" value={`NGN ${(orderData?.totalRevenue || 0).toLocaleString('en-NG')}`} color="green" sub="From fully processed orders" />
                <StatCard label="Total Orders" value={orderData?.totalOrders || 0} color="blue" sub={`${processing} currently processing`} />
                <StatCard label="Orders Fulfilled" value={delivered} color="purple" sub="Successfully delivered packages" />
                <StatCard label="Total Products" value={stats?.totalProducts || 0} color="blue" sub="Active catalogue records" />
                <StatCard label="Low Stock Alert" value={stats?.lowStock || 0} color="orange" sub="Requires immediate reorder" />
                <StatCard label="Out of Stock" value={stats?.outOfStock || 0} color="red" sub="Zero inventory units remaining" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order Number</th>
                                <th className="px-6 py-4">Customer Details</th>
                                <th className="px-6 py-4 text-right">Total Price</th>
                                <th className="px-6 py-4 text-center">Fulfillment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {(orderData?.orders || []).slice(0, 5).map(o => (
                                <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-blue-600">{o.orderNumber}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{o.user?.name || 'Unknown User'}</td>
                                    <td className="px-6 py-4 text-right font-extrabold text-green-600">NGN {o.totalPrice?.toLocaleString('en-NG')}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${o.isDelivered ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                                            {o.isDelivered ? 'Delivered' : 'Processing'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// ALL ORDERS
// ══════════════════════════════════════════
//
function OrdersSection({ token, isAdmin }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API}/orders/all`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setOrders(d.orders || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    const markDelivered = async (id) => {
        setMarking(id);
        try {
            const res = await fetch(`${API}/orders/${id}/deliver`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setOrders(prev => prev.map(o => o._id === id ? data.order : o));
        } catch (e) { alert(e.message); }
        finally { setMarking(null); }
    };

    const filtered = orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">Orders Log ({orders.length})</h2>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search order ID or client..."
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order Number</th>
                                <th className="px-6 py-4">Customer Info</th>
                                <th className="px-6 py-4">Fulfillment Date</th>
                                <th className="px-6 py-4 text-right">Total Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                {isAdmin && <th className="px-6 py-4 text-center">Action Options</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {filtered.map(o => (
                                <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-blue-600">{o.orderNumber}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{o.user?.name}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{o.user?.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-green-600">
                                        NGN {o.totalPrice?.toLocaleString('en-NG')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${o.isDelivered ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                                            {o.isDelivered ? 'Delivered' : 'Processing'}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-center">
                                            {!o.isDelivered ? (
                                                <button
                                                    onClick={() => markDelivered(o._id)}
                                                    disabled={marking === o._id}
                                                    className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-2 rounded-lg transition disabled:opacity-50 shadow-sm"
                                                >
                                                    {marking === o._id ? 'Updating...' : 'Mark Delivered'}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-semibold italic">Complete</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// USERS & PERMISSIONS
// ══════════════════════════════════════════
function UsersSection({ token, currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpd] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        fetch(`${API}/auth/users`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setUsers(d.users || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    const changeRole = async (userId, newRole) => {
        setUpd(userId);
        try {
            const res = await fetch(`${API}/auth/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
        } catch (e) { alert(e.message); }
        finally { setUpd(null); }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        setDeleting(userId);
        try {
            const res = await fetch(`${API}/auth/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete');
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (e) { alert(e.message); }
        finally { setDeleting(null); }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' ||
            (roleFilter === 'staff' && ['super_admin', 'admin', 'manager', 'storekeeper'].includes(u.role)) ||
            (roleFilter === 'customers' && u.role === 'user');
        return matchesSearch && matchesRole;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    useEffect(() => { setCurrentPage(1); }, [search, roleFilter]);

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total System Accounts</p>
                    <p className="text-2xl font-extrabold text-gray-900">{users.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Internal Work Staff</p>
                    <p className="text-2xl font-extrabold text-blue-600">
                        {users.filter(u => ['super_admin', 'admin', 'manager', 'storekeeper'].includes(u.role)).length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Verified Customers</p>
                    <p className="text-2xl font-extrabold text-green-600">
                        {users.filter(u => u.role === 'user').length}
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 w-full md:w-auto bg-slate-100 p-1 rounded-lg">
                    {['all', 'staff', 'customers'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setRoleFilter(tab)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition ${roleFilter === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search full name or email..."
                    className="w-full md:w-72 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Account Details</th>
                                <th className="px-6 py-4">Registration Date</th>
                                <th className="px-6 py-4 text-center">Permission Status</th>
                                <th className="px-6 py-4 text-center">Manage Access</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {currentUsers.map(u => {
                                const isSelf = currentUser._id === u._id;
                                const isTargetSuperAdmin = u.role === 'super_admin';
                                const isTargetAdmin = u.role === 'admin';
                                const iAmSuperAdmin = currentUser.role === 'super_admin';
                                const iAmAdmin = currentUser.role === 'admin';

                                const canModify = !isSelf && !isTargetSuperAdmin && !(iAmAdmin && isTargetAdmin);

                                return (
                                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0">
                                                    {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.name}</p>
                                                    <p className="text-gray-400 text-xs mt-0.5">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <RoleBadge role={u.role} />
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <select
                                                value={u.role}
                                                disabled={!canModify || updating === u._id}
                                                onChange={e => changeRole(u._id, e.target.value)}
                                                className={`border rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${canModify ? 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                                    }`}
                                            >
                                                {isTargetSuperAdmin && <option value="super_admin">Super Admin</option>}
                                                <option value="user">User</option>
                                                <option value="storekeeper">Storekeeper</option>
                                                <option value="manager">Manager</option>
                                                {iAmSuperAdmin && <option value="admin">Admin</option>}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {canModify ? (
                                                <button
                                                    onClick={() => deleteUser(u._id)}
                                                    disabled={deleting === u._id}
                                                    className="inline-flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-lg transition-colors border border-red-100 shadow-sm"
                                                >
                                                    {deleting === u._id ? 'Removing...' : 'Revoke Access'}
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center text-xs bg-slate-50 text-gray-400 font-bold px-4 py-2 rounded-lg border border-gray-200/80">
                                                    🔒 Protected
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500">
                            Records <span className="font-bold text-gray-900">{indexOfFirstUser + 1}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="font-bold text-gray-900">{filteredUsers.length}</span> entries
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════
function ProductsSection({ token }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formError, setFormError] = useState(null);

    const emptyForm = { name: '', sku: '', price: '', stock_quantity: '', description: '', category_id: '' };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        const h = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API}/products?limit=100`, { headers: h }).then(r => r.json()),
            fetch(`${API}/categories`, { headers: h }).then(r => r.json())
        ]).then(([p, c]) => {
            setProducts(p.products || []);
            setCategories(c.categories || c || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [token]);

    const openAdd = () => { setFormError(null); setForm(emptyForm); setModal('add'); };
    const openEdit = (p) => {
        setFormError(null);
        setForm({
            name: p.name || '',
            sku: p.sku || '',
            price: p.price || '',
            stock_quantity: p.stock_quantity || '',
            description: p.description || '',
            category_id: p.category_id?._id || p.category_id || ''
        });
        setModal(p);
    };

    const closeModal = () => { setModal(null); setForm(emptyForm); setFormError(null); };

    const handleSave = async () => {
        setSaving(true);
        setFormError(null);
        try {
            const isEdit = modal !== 'add';
            const url = isEdit ? `${API}/products/${modal._id}` : `${API}/products`;
            const method = isEdit ? 'PATCH' : 'POST';

            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k !== 'imageFile' && v !== '') formData.append(k, v);
            });
            if (form.imageFile) formData.append('image', form.imageFile);

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'An error occurred while saving.');

            if (isEdit) {
                setProducts(prev => prev.map(p => p._id === modal._id ? data.product : p));
            } else {
                setProducts(prev => [data.product, ...prev]);
            }
            closeModal();
        } catch (e) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`${API}/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete');
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (e) { alert(e.message); }
        finally { setDeleting(null); }
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">Catalogue Management ({products.length})</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search name or SKU item..."
                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                    <button
                        onClick={openAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition whitespace-nowrap shadow-sm"
                    >
                        + Add Stock
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Item Catalog Details</th>
                                <th className="px-6 py-4">SKU / Serial</th>
                                <th className="px-6 py-4 text-right">Unit Price</th>
                                <th className="px-6 py-4 text-center">Volume</th>
                                <th className="px-6 py-4">Registered By</th>
                                <th className="px-6 py-4 text-center">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {filtered.map(p => (
                                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {p.image
                                                ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0 shadow-sm" />
                                                : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0 border border-gray-200">📦</div>
                                            }
                                            <span className="font-bold text-gray-900">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{p.sku}</td>
                                    <td className="px-6 py-4 text-right font-extrabold text-green-600">
                                        NGN {p.price?.toLocaleString('en-NG')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock_quantity === 0 ? 'bg-red-50 text-red-700 border border-red-200'
                                            : p.stock_quantity <= 10 ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                                : 'bg-green-50 text-green-700 border border-green-200'
                                            }`}>
                                            {p.stock_quantity} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 block">{p.user?.name || 'System Root'}</span>
                                        <span className="text-xs text-gray-400 capitalize">{p.user?.role || 'operator'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-3 py-1.5 rounded-lg border border-blue-100 transition shadow-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(p._id)}
                                                disabled={deleting === p._id}
                                                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg border border-red-100 transition shadow-sm disabled:opacity-50"
                                            >
                                                {deleting === p._id ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal !== null && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-base font-bold text-gray-900">
                                {modal === 'add' ? 'Register New Product Asset' : `Modify Asset — ${modal.name}`}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold">
                                    ⚠️ {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Product Designation</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Sony FX3 Cinema Line"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">SKU Barcode Reference</label>
                                <input
                                    value={form.sku}
                                    onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    placeholder="e.g. SNY-FX3-01"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Base Price (NGN)</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="75000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={form.stock_quantity}
                                        onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="25"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Category Classification</label>
                                <select
                                    value={form.category_id}
                                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Select inventory folder...</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Technical Specs / Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter physical assets particulars..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">
                                    Display Graphic Media {modal !== 'add' && <span className="text-gray-400 font-normal lowercase">(optional override)</span>}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setForm(f => ({ ...f, imageFile: e.target.files[0] }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50/30">
                            <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition text-sm">
                                Discard
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition text-sm disabled:opacity-50 shadow-sm">
                                {saving ? 'Writing...' : modal === 'add' ? 'Confirm Addition' : 'Apply Overhauls'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════
// LOW STOCK
// ══════════════════════════════════════════
function LowStockSection({ token }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/products/low-stock`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setProducts(d.products || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    if (loading) return <Spinner />;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 px-1">
                Depleted Inventories
                {products.length > 0 && (
                    <span className="ml-2 text-xs font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-200/60 align-middle">
                        {products.length} Channels Endangered
                    </span>
                )}
            </h2>
            {products.length === 0 ? (
                <div className="bg-green-50/50 border border-green-200/60 rounded-xl p-8 text-center shadow-xs">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-green-700 font-bold">All warehouse stores are optimally stocked.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map(p => (
                        <div key={p._id} className={`bg-white rounded-xl border p-5 shadow-sm transition-shadow duration-200 flex flex-col justify-between ${p.stock_quantity === 0 ? 'border-l-4 border-l-red-600 border-gray-200' : 'border-l-4 border-l-orange-500 border-gray-200'}`}>
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    {p.image
                                        ? <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100 shadow-xs" />
                                        : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0 border border-gray-200">📦</div>
                                    }
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                                        <p className="text-gray-400 text-xs font-mono mt-0.5">{p.sku}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock_quantity === 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                                    {p.stock_quantity === 0 ? 'Exhausted' : `${p.stock_quantity} remaining`}
                                </span>
                                <span className="text-green-600 font-extrabold text-sm">
                                    NGN {p.price?.toLocaleString('en-NG')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════
// STOCK MOVEMENTS
// ══════════════════════════════════════════
function StockMovementsSection({ token }) {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/stock-movements`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setMovements(d.movements || d || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    if (loading) return <Spinner />;

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Velocity Tracking Log ({movements.length})</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Tracked Asset Name</th>
                                <th className="px-6 py-4">Responsible Operator</th>
                                <th className="px-6 py-4 text-center">Movement Type</th>
                                <th className="px-6 py-4 text-center">Net Displacement</th>
                                <th className="px-6 py-4 text-center">Audit Vector Balance</th>
                                <th className="px-6 py-4">Fulfillment Stamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {movements.map(m => (
                                <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{m.product?.name || 'Decommissioned Asset'}</td>
                                    <td className="px-6 py-4 font-medium text-gray-600">{m.user?.name || '—'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${m.type === 'IN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-extrabold">
                                        <span className={m.type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                                            {m.type === 'IN' ? '▲' : '▼'} {m.quantity_change}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-400 font-mono font-medium">
                                        {m.previous_quantity} <span className="text-gray-300">→</span> <span className="text-gray-700 font-bold">{m.new_quantity}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(m.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// SYSTEM AUDIT LOGS
// ══════════════════════════════════════════
function AuditLogsSection({ token }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API}/products/audit-logs`, { headers: { Authorization: `Bearer ${token}` } })
            .then(async (r) => {
                if (!r.ok) { console.error("Logs error status:", r.status); return []; }
                return r.json();
            })
            .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setLogs([]); setLoading(false); });
    }, [token]);

    const filteredLogs = logs.filter(log =>
        log.details?.toLowerCase().includes(search.toLowerCase()) ||
        log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        log.product?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const getActionBadge = (action) => {
        switch (action) {
            case 'PRICE_CHANGE': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Price Override</span>;
            case 'NAME_CHANGE': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Identity Change</span>;
            case 'PRODUCT_DELETED': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Asset Purged</span>;
            case 'PRODUCT_CREATED': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">Asset Spawned</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">{action}</span>;
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto">
                    <h2 className="text-lg font-bold text-gray-900">Immutable Cryptographic Audit Trail</h2>
                </div>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search ledger details, vectors, operators..."
                    className="w-full md:w-80 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Chronology Timestamp</th>
                                <th className="px-6 py-4">Action Signature</th>
                                <th className="px-6 py-4">Executing Actor Identity</th>
                                <th className="px-6 py-4">Ledger Operational Particulars</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {filteredLogs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                                        <div className="text-gray-900 font-bold">{new Date(log.createdAt).toLocaleDateString('en-NG')}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{new Date(log.createdAt).toLocaleTimeString('en-NG')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-bold text-gray-900">{log.user?.name || 'Unknown User'}</p>
                                        <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mt-0.5">{log.user?.role?.replace('_', ' ')}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-800 font-medium">{log.details}</p>
                                        {log.product && (
                                            <p className="text-gray-400 font-mono text-xs mt-1 bg-slate-50 px-2 py-1 rounded inline-block">Ref: {log.product.name} ({log.product.sku})</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                                        <p className="text-3xl mb-2">🛡️</p>
                                        <p className="font-medium">No records matching query found in system ledger.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// MAIN DASHBOARD SHELL
// ══════════════════════════════════════════
export default function AdminDashboard() {
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const role = userInfo?.role;

    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (!userInfo) { navigate('/login'); return; }
        if (!['super_admin','admin', 'manager', 'storekeeper'].includes(role)) {
            navigate('/');
        }
    }, [userInfo, role, navigate]);

    const allTabs = [
        { id: 'stats', icon: '📊', label: 'Overview', roles: ['super_admin','admin', 'manager'] },
        { id: 'orders', icon: '📦', label: 'Orders', roles: ['super_admin','admin', 'manager'] },
        { id: 'products', icon: '🏷️', label: 'Products', roles: ['super_admin','admin', 'storekeeper'] },
        { id: 'stock', icon: '📈', label: 'Stock Movements', roles: ['super_admin','admin', 'storekeeper'] },
        { id: 'lowstock', icon: '⚠️', label: 'Low Stock', roles: ['super_admin','admin', 'manager', 'storekeeper'] },
        { id: 'users', icon: '👥', label: 'Users & Permissions', roles: ['super_admin','admin'] },
        { id: 'audit', icon: '🛡️', label: 'System Logs', roles: ['super_admin'] },
    ];

    const tabs = allTabs.filter(t => t.roles.includes(role));
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'lowstock');

    if (!userInfo) return null;

    return (
        // 👇 Removed max-w-7xl and adjusted wrapper for full-width fluidity
        <div className="w-full min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 xl:px-8">
            <div className="w-full mx-auto">
                {/* Header Context Banner */}
                <div className="mb-6 border-b border-gray-200/60 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Management Console</h1>
                        <p className="text-gray-500 text-xs font-medium mt-1">
                            System Session Secured for: <span className="font-bold text-gray-700">{userInfo.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100/80 px-3 py-1.5 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">{role?.replace('_', ' ')} Privileges</span>
                    </div>
                </div>

                {/* 👇 Changed lg:flex-row to md:flex-row to keep sidebar on the left much longer */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    
                    {/* COLLAPSIBLE ACCORDION SIDEBAR */}
                    {/* 👇 Updated breakpoints from lg: to md: */}
                    <aside className={`shrink-0 transition-all duration-300 ease-in-out sticky top-24 z-10 w-full md:w-auto`}>
                        <div className={`bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm flex flex-col transition-all duration-300 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                            
                            {/* Collapse Trigger Toggle */}
                            <div className="p-3 border-b border-gray-100 hidden md:flex items-center justify-end bg-gray-50/30">
                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title={isCollapsed ? "Expand Sidebar Window" : "Minimize Sidebar Window"}
                                >
                                    {isCollapsed ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Panel Actions Buttons Map */}
                            <div className="p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        title={isCollapsed ? tab.label : ''} 
                                        className={`flex items-center py-2.5 rounded-lg transition-all whitespace-nowrap border-l-4 ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50/80 text-blue-700 font-bold border-l-blue-600 shadow-xs'
                                                : 'text-gray-600 hover:bg-gray-50 border-l-transparent'
                                        } ${isCollapsed ? 'md:justify-center md:px-0 px-4' : 'justify-start px-4 gap-3'}`}
                                    >
                                        <span className="text-lg leading-none">{tab.icon}</span>
                                        <span className={`text-xs font-semibold ${isCollapsed ? 'md:hidden block' : 'block'}`}>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Operational Workspace Grid Content Area */}
                    <div className="flex-1 w-full min-w-0">
                        {activeTab === 'stats' && <StatsSection token={userInfo.token} />}
                        {activeTab === 'orders' && <OrdersSection token={userInfo.token} isAdmin={role === 'admin' || role === 'super_admin'} />}
                        {activeTab === 'products' && <ProductsSection token={userInfo.token} />}
                        {activeTab === 'stock' && <StockMovementsSection token={userInfo.token} />}
                        {activeTab === 'lowstock' && <LowStockSection token={userInfo.token} />}
                        {activeTab === 'users' && <UsersSection token={userInfo.token} currentUser={userInfo} />}
                        {activeTab === 'audit' && <AuditLogsSection token={userInfo.token} />}
                    </div>
                </div>
            </div>
        </div>
    );
}