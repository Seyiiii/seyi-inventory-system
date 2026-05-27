import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'https://seyi-inventory.onrender.com/api';

function Spinner() {
    return (
        <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
    );
}

function StatCard({ label, value, color = 'blue', sub }) {
    const colors = {
        blue: 'bg-blue-50 border-blue-100 text-blue-700',
        green: 'bg-green-50 border-green-100 text-green-700',
        orange: 'bg-orange-50 border-orange-100 text-orange-700',
        red: 'bg-red-50 border-red-100 text-red-700',
        purple: 'bg-purple-50 border-purple-100 text-purple-700',
    };
    return (
        <div className={`rounded-xl border p-5 ${colors[color]}`}>
            <p className="text-sm font-medium opacity-70 mb-1">{label}</p>
            <p className="text-3xl font-bold">{value ?? '—'}</p>
            {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
        </div>
    );
}

function RoleBadge({ role }) {
    const map = {
        super_admin: 'bg-red-100 text-red-700 border border-red-200',
        admin: 'bg-purple-100 text-purple-700',
        manager: 'bg-blue-100 text-blue-700',
        storekeeper: 'bg-amber-100 text-amber-700',
        user: 'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[role] || map.user}`}>
            {role.replace('_', ' ')} {/* Formats super_admin to super admin */}
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
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Overview</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard label="Total Revenue" value={`NGN ${(orderData?.totalRevenue || 0).toLocaleString('en-NG')}`} color="green" sub="From paid orders" />
                    <StatCard label="Total Orders" value={orderData?.totalOrders || 0} color="blue" sub={`${processing} processing`} />
                    <StatCard label="Delivered" value={delivered} color="purple" sub="Orders fulfilled" />
                    <StatCard label="Total Products" value={stats?.totalProducts || 0} color="blue" />
                    <StatCard label="Low Stock" value={stats?.lowStock || 0} color="orange" sub="≤ 10 units left" />
                    <StatCard label="Out of Stock" value={stats?.outOfStock || 0} color="red" />
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
                <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Order</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Customer</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-semibold">Total</th>
                                <th className="text-center px-4 py-3 text-gray-500 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(orderData?.orders || []).slice(0, 5).map(o => (
                                <tr key={o._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-blue-600">{o.orderNumber}</td>
                                    <td className="px-4 py-3 text-gray-600">{o.user?.name || 'Unknown'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600">NGN {o.totalPrice?.toLocaleString('en-NG')}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.isDelivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
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
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">All Orders ({orders.length})</h2>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by order no. or customer..."
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">Order</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">Customer</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-semibold">Total</th>
                            <th className="text-center px-4 py-3 text-gray-500 font-semibold">Status</th>
                            {isAdmin && <th className="text-center px-4 py-3 text-gray-500 font-semibold">Action</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(o => (
                            <tr key={o._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-blue-600">{o.orderNumber}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-800">{o.user?.name}</p>
                                    <p className="text-gray-400 text-xs">{o.user?.email}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                    NGN {o.totalPrice?.toLocaleString('en-NG')}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.isDelivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {o.isDelivered ? '✅ Delivered' : '🚚 Processing'}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="px-4 py-3 text-center">
                                        {!o.isDelivered ? (
                                            <button
                                                onClick={() => markDelivered(o._id)}
                                                disabled={marking === o._id}
                                                className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                                            >
                                                {marking === o._id ? 'Updating...' : 'Mark Delivered'}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-300">Done</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No orders found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// USERS & PERMISSIONS
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// USERS & PERMISSIONS
// ══════════════════════════════════════════
function UsersSection({ token, currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpd] = useState(null);
    const [deleting, setDeleting] = useState(null);
    
    // Search, Filter, and Pagination State
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

    // Derived Data for Filters
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || 
                            (roleFilter === 'staff' && ['super_admin', 'admin', 'manager', 'storekeeper'].includes(u.role)) ||
                            (roleFilter === 'customers' && u.role === 'user');
        return matchesSearch && matchesRole;
    });

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [search, roleFilter]);

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            {/* Top Dashboard Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Total Accounts</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Internal Staff</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {users.filter(u => ['super_admin', 'admin', 'manager', 'storekeeper'].includes(u.role)).length}
                    </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Registered Customers</p>
                    <p className="text-2xl font-bold text-green-600">
                        {users.filter(u => u.role === 'user').length}
                    </p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 w-full md:w-auto">
                    {['all', 'staff', 'customers'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setRoleFilter(tab)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition ${
                                roleFilter === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full md:w-72 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
            </div>

            {/* User Table Container */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider">Account Details</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider">Join Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider text-center">Status/Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider text-center">Manage Access</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentUsers.map(u => {
                                // 🔒 Frontend Security Checks
                                const isSelf = currentUser._id === u._id;
                                const isTargetSuperAdmin = u.role === 'super_admin';
                                const isTargetAdmin = u.role === 'admin';
                                const iAmSuperAdmin = currentUser.role === 'super_admin';
                                const iAmAdmin = currentUser.role === 'admin';

                                // Can the current user modify this specific row?
                                const canModify = !isSelf && !isTargetSuperAdmin && !(iAmAdmin && isTargetAdmin);

                                return (
                                    <tr key={u._id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                                                    {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.name}</p>
                                                    <p className="text-gray-500 text-xs mt-0.5">{u.email}</p>
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
                                                className={`border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    canModify ? 'border-gray-300 bg-white hover:border-gray-400 cursor-pointer' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
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
                                                    className="inline-flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 border border-red-100"
                                                >
                                                    {deleting === u._id ? 'Processing...' : 'Revoke Access'}
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-semibold px-4 py-2 rounded-lg border border-gray-200">
                                                    🔒 Protected
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {currentUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-4xl mb-3">🔍</p>
                                        <p className="text-gray-500 font-medium">No users found matching your criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold">{indexOfFirstUser + 1}</span> to <span className="font-bold">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="font-bold">{filteredUsers.length}</span> users
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
function ProductsSection({ token, userRole }) {
    const [products, setProducts] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [search,   setSearch]   = useState('');
    const [modal,    setModal]    = useState(null); 
    const [saving,   setSaving]   = useState(false);
    const [categories, setCategories] = useState([]);
    
    // 👇 NEW: State to handle and display form errors beautifully
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

    const openAdd = () => {
        setFormError(null); // Clear errors
        setForm(emptyForm);
        setModal('add');
    };

    const openEdit = (p) => {
        setFormError(null); // Clear errors
        setForm({
            name:           p.name || '',
            sku:            p.sku || '',
            price:          p.price || '',
            stock_quantity: p.stock_quantity || '',
            description:    p.description || '',
            category_id:    p.category_id?._id || p.category_id || ''
        });
        setModal(p); 
    };

    const closeModal = () => { setModal(null); setForm(emptyForm); setFormError(null); };

    const handleSave = async () => {
        setSaving(true);
        setFormError(null); // Clear previous errors
        try {
            const isEdit = modal !== 'add';
            const url    = isEdit ? `${API}/products/${modal._id}` : `${API}/products`;
            const method = isEdit ? 'PATCH' : 'POST';

            const formData = new FormData();
            
            // 👇 FIX #1: Don't let 'imageFile' get appended as a raw text field!
            Object.entries(form).forEach(([k, v]) => { 
                if (k !== 'imageFile' && v !== '') formData.append(k, v); 
            });
            
            // Append the actual file to the 'image' field expected by multer
            if (form.imageFile) formData.append('image', form.imageFile);

            const res  = await fetch(url, {
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
        } catch (e) { 
            // 👇 FIX #2: Display the exact backend error on the UI instead of a silent alert
            setFormError(e.message); 
        }
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
        } catch (e) { 
            alert(e.message); 
        }
        finally { setDeleting(null); }
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Products ({products.length})</h2>
                <div className="flex gap-2">
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or SKU..."
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={openAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap"
                    >
                        + Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">Product</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">SKU</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-semibold">Price</th>
                            <th className="text-center px-4 py-3 text-gray-500 font-semibold">Stock</th>
                            {/* 👇 FIX #3: New Header for Creator */}
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">Created By</th> 
                            <th className="text-center px-4 py-3 text-gray-500 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(p => (
                            <tr key={p._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {p.image
                                            ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                                            : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0">📦</div>
                                        }
                                        <span className="font-medium text-gray-800">{p.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.sku}</td>
                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                    NGN {p.price?.toLocaleString('en-NG')}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                        p.stock_quantity === 0   ? 'bg-red-100 text-red-700'
                                        : p.stock_quantity <= 10 ? 'bg-orange-100 text-orange-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                        {p.stock_quantity} units
                                    </span>
                                </td>
                                {/* 👇 FIX #3: Show the Creator's Name and Role Badge */}
                                <td className="px-4 py-3">
                                    <span className="font-medium text-gray-800 block mb-1">{p.user?.name || 'Unknown'}</span>
                                    <RoleBadge role={p.user?.role || 'user'} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openEdit(p)}
                                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-3 py-1.5 rounded-lg transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(p._id)}
                                            disabled={deleting === p._id}
                                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                                        >
                                            {deleting === p._id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modal !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {modal === 'add' ? 'Add New Product' : `Edit — ${modal.name}`}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            
                            {/* 👇 FIX #2: Beautiful Inline Error Message */}
                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                                    ⚠️ {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Samsung Galaxy S30"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                <input
                                    value={form.sku}
                                    onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. TECH-001"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (NGN)</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 50000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={form.stock_quantity}
                                        onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={form.category_id}
                                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select category...</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Product description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Image {modal !== 'add' && <span className="text-gray-400 font-normal">(leave empty to keep current)</span>}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setForm(f => ({ ...f, imageFile: e.target.files[0] }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={closeModal}
                                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition text-sm disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}
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
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                Low Stock Alerts
                {products.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-red-500">
                        {products.length} items need attention
                    </span>
                )}
            </h2>
            {products.length === 0 ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-green-700 font-medium">All products are well stocked!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(p => (
                        <div key={p._id} className={`bg-white rounded-xl border p-4 ${p.stock_quantity === 0 ? 'border-red-200' : 'border-orange-200'}`}>
                            <div className="flex items-center gap-3 mb-3">
                                {p.image
                                    ? <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                    : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0">📦</div>
                                }
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                                    <p className="text-gray-400 text-xs font-mono">{p.sku}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock_quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} left`}
                                </span>
                                <span className="text-green-600 font-bold text-sm">
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
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Stock Movements ({movements.length})</h2>
            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">Product</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">By</th>
                            <th className="text-center px-4 py-3 text-gray-500 font-semibold">Type</th>
                            <th className="text-center px-4 py-3 text-gray-500 font-semibold">Change</th>
                            <th className="text-center px-4 py-3 text-gray-500 font-semibold">Before → After</th>
                            <th className="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {movements.map(m => (
                            <tr key={m._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">{m.product?.name || 'Unknown'}</td>
                                <td className="px-4 py-3 text-gray-500">{m.user?.name || '—'}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {m.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center font-bold">
                                    <span className={m.type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                                        {m.type === 'IN' ? '+' : '-'}{m.quantity_change}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-gray-500">
                                    {m.previous_quantity} → {m.new_quantity}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {new Date(m.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                        {movements.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No stock movements yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════
// SYSTEM AUDIT LOGS (Super Admin Only)
// ══════════════════════════════════════════
function AuditLogsSection({ token }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API}/products/audit-logs`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { setLogs(data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    const filteredLogs = logs.filter(log => 
        log.details?.toLowerCase().includes(search.toLowerCase()) || 
        log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        log.product?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const getActionBadge = (action) => {
        switch (action) {
            case 'PRICE_CHANGE': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Price Change</span>;
            case 'NAME_CHANGE': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Name Change</span>;
            case 'PRODUCT_DELETED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Product Deleted</span>;
            case 'PRODUCT_CREATED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Product Created</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{action}</span>;
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">System Audit Trail</h2>
                    <p className="text-sm text-gray-500">Tracking all critical system modifications.</p>
                </div>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search logs, users, or products..."
                    className="w-full md:w-80 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider">Action</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider">Performed By</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.map(log => (
                                <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        <div className="font-medium text-gray-700">
                                            {new Date(log.createdAt).toLocaleDateString('en-NG')}
                                        </div>
                                        <div className="text-xs">
                                            {new Date(log.createdAt).toLocaleTimeString('en-NG')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getActionBadge(log.action)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-bold text-gray-900">{log.user?.name || 'Unknown User'}</p>
                                        <p className="text-gray-500 text-xs">{log.user?.role?.replace('_', ' ')}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-800 font-medium">{log.details}</p>
                                        {log.product && (
                                            <p className="text-gray-400 text-xs mt-1">Ref: {log.product.name} (SKU: {log.product.sku})</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <p className="text-3xl mb-3">🛡️</p>
                                        <p className="text-gray-500 font-medium">No audit logs found.</p>
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

    useEffect(() => {
        if (!userInfo) { navigate('/login'); return; }
        if (!['super_admin','admin', 'manager', 'storekeeper'].includes(role)) {
            navigate('/');
        }
    }, [userInfo, role, navigate]);

    const allTabs = [
        { id: 'stats', label: '📊 Overview', roles: ['super_admin','admin', 'manager'] },
        { id: 'orders', label: '📦 Orders', roles: ['super_admin','admin', 'manager'] },
        { id: 'products', label: '🏷️ Products', roles: ['super_admin','admin', 'storekeeper'] },
        { id: 'stock', label: '📈 Stock Movements', roles: ['super_admin','admin', 'storekeeper'] },
        { id: 'lowstock', label: '⚠️ Low Stock', roles: ['super_admin','admin', 'manager', 'storekeeper'] },
        { id: 'users', label: '👥 Users & Permissions', roles: ['super_admin','admin'] },
        { id: 'audit', label: '🛡️ System Logs', roles: ['super_admin'] },
    ];

    const tabs = allTabs.filter(t => t.roles.includes(role));
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'lowstock');

    if (!userInfo) return null;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Logged in as <span className="font-semibold text-blue-600 capitalize">{role}</span> · {userInfo.name}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <aside className="w-full lg:w-52 shrink-0">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-24">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-700 font-bold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {activeTab === 'stats' && <StatsSection token={userInfo.token} />}
                    {activeTab === 'orders' && <OrdersSection token={userInfo.token} isAdmin={role === 'admin' || role === 'super_admin'} />}
                    {activeTab === 'products' && <ProductsSection token={userInfo.token} userRole={role} />}
                    {activeTab === 'stock' && <StockMovementsSection token={userInfo.token} />}
                    {activeTab === 'lowstock' && <LowStockSection token={userInfo.token} />}
                    {activeTab === 'users' && <UsersSection token={userInfo.token} currentUser={userInfo}/>}
                    {activeTab === 'audit' && <AuditLogsSection token={userInfo.token} />}
                </div>
            </div>
        </div>
    );
}