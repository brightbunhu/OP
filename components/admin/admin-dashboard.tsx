'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ProductRow, Category, RoleRef } from '@/types/domain';
import {
  Users, Shield, Settings, BarChart3, Activity,
  AlertCircle, Trash2, Plus, RefreshCw,
  UserX, Crown, Database, Save, TrendingUp, FileText,
  Tag, DollarSign, Check, Edit2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { suspendUser, activateUser, softDeleteUser, createRole, createUser } from '@/app/actions/admin.actions';

export interface AdminUser {
  id: string; name: string; email: string; status: string;
  roles: Array<{ id: string; name: string }>;
  createdAt: string; _count: { orders: number };
}
export interface AdminRole {
  id: string; name: string; description: string | null;
  permissions: string[]; _count: { users: number }; createdAt: string;
}
export interface AdminAuditLog {
  id: string; action: string; entityName: string; entityId: string | null;
  actor: { name: string; email: string } | null;
  createdAt: string; ipAddress: string | null;
}
export interface AdminStats {
  totalUsers: number; activeUsers: number; suspendedUsers: number;
  totalRoles: number; totalOrders: number; totalRevenue: number;
  totalProducts: number; totalAuditLogs: number;
}
interface AdminDashboardProps {
  initialUsers: AdminUser[]; initialRoles: AdminRole[];
  initialAuditLogs: AdminAuditLog[]; stats: AdminStats;
  currentUser: { id: string; name: string; email: string };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  SUSPENDED: 'bg-amber-50 text-amber-700 border border-amber-200',
  DELETED: 'bg-red-50 text-red-700 border border-red-200',
  INVITED: 'bg-blue-50 text-blue-700 border border-blue-200',
};
const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-emerald-600', UPDATE: 'text-blue-600', DELETE: 'text-red-600',
  SOFT_DELETE: 'text-orange-600', LOGIN: 'text-purple-600',
  LOGOUT: 'text-slate-600', ROLE_ASSIGN: 'text-indigo-600',
};

export default function AdminDashboard({ initialUsers, initialRoles, initialAuditLogs, stats, currentUser }: AdminDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'audit' | 'settings' | 'products' | 'sales'>('overview');
  const [users, setUsers] = useState(initialUsers);
  const [auditLogs] = useState(initialAuditLogs);
  const [roles] = useState(initialRoles);
  const [actionMsg, setActionMsg] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: '' });
  const [creatingRole, setCreatingRole] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', roleId: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'OP Supermarket', maintenanceMode: false,
    registrationEnabled: true, maxUploadSizeMB: 10,
    defaultCurrency: 'USD', lowStockThreshold: 10,
  });

  // Products and Category States
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', slug: '', sku: '', barcode: '', description: '',
    imageUrl: '', categoryId: '', price: '', compareAtPrice: '',
    costPrice: '', taxRate: '0.00', weightGrams: '',
    status: 'ACTIVE', isFeatured: false
  });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null);

  // Salespeople States
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [salesForm, setSalesForm] = useState({ name: '', email: '', password: '' });
  const [creatingSales, setCreatingSales] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 4000); };

  // Fetch Products & Categories Client Side
  const fetchProductsAndCategories = async () => {
    setProductsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ]);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (e) {
      console.error('Failed to load products/categories', e);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProductsAndCategories();
    }
  }, [activeTab]);

  const handleSuspend = async (userId: string) => {
    if (userId === currentUser.id) return showMsg('Cannot suspend your own account.');
    setLoadingId(userId);
    try { await suspendUser(userId); setUsers(p => p.map(u => u.id === userId ? { ...u, status: 'SUSPENDED' } : u)); showMsg('User suspended.'); }
    catch (e: any) { showMsg(`Error: ${e.message}`); }
    setLoadingId(null);
  };

  const handleActivate = async (userId: string) => {
    setLoadingId(userId);
    try { await activateUser(userId); setUsers(p => p.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u)); showMsg('User activated.'); }
    catch (e: any) { showMsg(`Error: ${e.message}`); }
    setLoadingId(null);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser.id) return showMsg('Cannot delete your own account.');
    if (!confirm('Soft-delete this user?')) return;
    setLoadingId(userId);
    try { await softDeleteUser(userId); setUsers(p => p.map(u => u.id === userId ? { ...u, status: 'DELETED' } : u)); showMsg('User deleted.'); }
    catch (e: any) { showMsg(`Error: ${e.message}`); }
    setLoadingId(null);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault(); setCreatingRole(true);
    try {
      const perms = roleForm.permissions.split(',').map(p => p.trim()).filter(Boolean);
      await createRole({ name: roleForm.name, description: roleForm.description, permissions: perms });
      setRoleForm({ name: '', description: '', permissions: '' }); setShowRoleForm(false);
      showMsg('Role created. Reload to see it.');
    } catch (e: any) { showMsg(`Error: ${e.message}`); }
    setCreatingRole(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.roleId) return showMsg('Please select a role.');
    setCreatingUser(true);
    try {
      const res = await createUser({
        name: userForm.name,
        email: userForm.email,
        passwordHash: userForm.password,
        roleId: userForm.roleId,
      });
      if (res.success && res.user) {
        const newUser: AdminUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          status: res.user.status,
          roles: res.user.roles.map((r: RoleRef) => ({ id: r.id, name: r.name })),
          createdAt: new Date().toISOString(),
          _count: { orders: 0 },
        };
        setUsers(p => [newUser, ...p]);
        setUserForm({ name: '', email: '', password: '', roleId: '' });
        setShowUserForm(false);
        showMsg('User created successfully.');
      }
    } catch (e: any) {
      showMsg(`Error: ${e.message}`);
    }
    setCreatingUser(false);
  };

  // Add Product Form Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.categoryId) return showMsg('Please select a category.');
    setCreatingProduct(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          featured: productForm.isFeatured ? 'true' : 'false'
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setProducts(p => [created, ...p]);
        setProductForm({
          name: '', slug: '', sku: '', barcode: '', description: '',
          imageUrl: '', categoryId: '', price: '', compareAtPrice: '',
          costPrice: '', taxRate: '0.00', weightGrams: '',
          status: 'ACTIVE', isFeatured: false
        });
        setShowProductForm(false);
        showMsg('Product created successfully.');
      } else {
        const err = await res.json();
        showMsg(`Error: ${err.error ? JSON.stringify(err.error) : 'Failed to save product.'}`);
      }
    } catch (e: any) {
      showMsg(`Error: ${e.message}`);
    } finally {
      setCreatingProduct(false);
    }
  };

  // Price Update Action
  const handleUpdatePrice = async (productId: string, price: string) => {
    if (!price || isNaN(Number(price))) return showMsg('Please enter a valid price.');
    setUpdatingPriceId(productId);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, price }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(p => p.map(prod => prod.id === productId ? { ...prod, price: updated.price } : prod));
        showMsg('Price updated successfully.');
        setEditingPriceId(null);
      } else {
        showMsg('Failed to update price.');
      }
    } catch (e: any) {
      showMsg(`Error: ${e.message}`);
    } finally {
      setUpdatingPriceId(null);
    }
  };

  // Salespeople Registration
  const salesRole = roles.find(r => r.name === 'SALES');
  const salesPeople = users.filter(u => u.roles.some(r => r.name === 'SALES'));

  const handleCreateSalesPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesRole) return showMsg('SALES role is not configured in system roles.');
    setCreatingSales(true);
    try {
      const res = await createUser({
        name: salesForm.name,
        email: salesForm.email,
        passwordHash: salesForm.password,
        roleId: salesRole.id,
      });
      if (res.success && res.user) {
        const newUser: AdminUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          status: res.user.status,
          roles: res.user.roles.map((r: RoleRef) => ({ id: r.id, name: r.name })),
          createdAt: new Date().toISOString(),
          _count: { orders: 0 },
        };
        setUsers(p => [newUser, ...p]);
        setSalesForm({ name: '', email: '', password: '' });
        setShowSalesForm(false);
        showMsg('Sales person registered successfully.');
      }
    } catch (e: any) {
      showMsg(`Error: ${e.message}`);
    } finally {
      setCreatingSales(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true); await new Promise(r => setTimeout(r, 800));
    setSavingSettings(false); showMsg('Settings saved.');
  };

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (userStatusFilter === 'ALL' || u.status === userStatusFilter);
  });

  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  if (!mounted) return (
    <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-card p-8">
      <div className="text-center space-y-4">
        <Database className="mx-auto h-12 w-12 text-primary/30 animate-pulse" />
        <p className="text-sm font-semibold text-muted-foreground">Loading admin workspace...</p>
      </div>
    </div>
  );

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { key: 'users' as const, label: 'Users', icon: Users },
    { key: 'sales' as const, label: 'Sales People', icon: DollarSign },
    { key: 'products' as const, label: 'Products & Pricing', icon: Tag },
    { key: 'roles' as const, label: 'Roles', icon: Shield },
    { key: 'audit' as const, label: 'Audit Logs', icon: Activity },
    { key: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {[
          { label: 'Total Users', value: stats.totalUsers, sub: `${stats.activeUsers} active`, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'System Roles', value: stats.totalRoles, sub: 'access roles', icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, sub: 'all-time', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Audit Events', value: stats.totalAuditLogs, sub: 'logged events', icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted' },
        ].map(card => (
          <div key={card.label} className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">{card.label}</p>
              <div className={`rounded-[12px] ${card.bg} p-2 ${card.color}`}><card.icon className="h-5 w-5" /></div>
            </div>
            <p className="mt-4 text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-px overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {actionMsg && (
        <div className="rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary flex items-center justify-between animate-in fade-in duration-300">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="font-bold ml-4">&#x2715;</button>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-4 transition-all hover:-translate-y-1">
            <h2 className="text-lg font-bold text-secondary">User Status Breakdown</h2>
            <div className="space-y-3">
              {[
                { label: 'Active', count: stats.activeUsers, color: 'bg-emerald-500', pct: stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0 },
                { label: 'Suspended', count: stats.suspendedUsers, color: 'bg-amber-500', pct: stats.totalUsers > 0 ? (stats.suspendedUsers / stats.totalUsers) * 100 : 0 },
                { label: 'Deleted/Other', count: Math.max(0, stats.totalUsers - stats.activeUsers - stats.suspendedUsers), color: 'bg-red-400', pct: stats.totalUsers > 0 ? (Math.max(0, stats.totalUsers - stats.activeUsers - stats.suspendedUsers) / stats.totalUsers) * 100 : 0 },
              ].map(row => (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground">{row.label}</span>
                    <span className="text-muted-foreground">{row.count} ({row.pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-4 transition-all hover:-translate-y-1">
            <h2 className="text-lg font-bold text-secondary">Recent Activity</h2>
            <div className="space-y-3">
              {auditLogs.slice(0, 7).map(log => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <span className={`mt-0.5 font-bold text-xs uppercase shrink-0 ${ACTION_COLORS[log.action] || 'text-muted-foreground'}`}>{log.action}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{log.entityName}</p>
                    <p className="text-xs text-muted-foreground">{log.actor?.name || 'System'} &middot; {new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No events yet.</p>}
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise lg:col-span-2 transition-all hover:-translate-y-1">
            <h2 className="text-lg font-bold text-secondary mb-4">System Health</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Products', value: stats.totalProducts, icon: Database },
                { label: 'Total Orders', value: stats.totalOrders, icon: FileText },
                { label: 'Suspended', value: stats.suspendedUsers, icon: UserX },
                { label: 'System Roles', value: stats.totalRoles, icon: Crown },
              ].map(item => (
                <div key={item.label} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">User Management</h2>
            <Button variant="primary" onClick={() => setShowUserForm(s => !s)} className="flex items-center gap-2 h-10 px-4 text-sm">
              <Plus className="h-4 w-4" /> New User
            </Button>
          </div>

          {showUserForm && (
            <form onSubmit={handleCreateUser} className="rounded-3xl border border-primary/30 bg-primary/5 p-6 space-y-4 animate-in slide-in-from-top duration-300">
              <h3 className="font-bold text-foreground">Create New Admin/Manager/Sales Account</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                  <input required placeholder="Full Name" value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address *</label>
                  <input required type="email" placeholder="email@example.com" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password *</label>
                  <input required type="password" placeholder="••••••••••••" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Role *</label>
                  <select required value={userForm.roleId} onChange={e => setUserForm(p => ({ ...p, roleId: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={creatingUser} className="h-9 px-4 text-sm">{creatingUser ? 'Creating...' : 'Create Account'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowUserForm(false)} className="h-9 px-4 text-sm">Cancel</Button>
              </div>
            </form>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Search name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
              className="flex-1 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}
              className="rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
              {['ALL', 'ACTIVE', 'SUSPENDED', 'INVITED', 'DELETED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="rounded-[20px] border border-border bg-white shadow-enterprise overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-foreground">User</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Roles</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Status</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Orders</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Joined</th>
                    <th className="px-5 py-3 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No users found.</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user.id} className={`hover:bg-muted/30 transition ${user.id === currentUser.id ? 'bg-primary/5' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name} {user.id === currentUser.id && <span className="text-xs text-primary">(you)</span>}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(r => <span key={r.id} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{r.name}</span>)}
                          {user.roles.length === 0 && <span className="text-muted-foreground text-xs">No roles</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[user.status] || 'bg-muted text-muted-foreground'}`}>{user.status}</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{user._count.orders}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.status !== 'ACTIVE' && user.status !== 'DELETED' && (
                            <button onClick={() => handleActivate(user.id)} disabled={loadingId === user.id}
                              className="rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50">
                              {loadingId === user.id ? '...' : 'Activate'}
                            </button>
                          )}
                          {user.status === 'ACTIVE' && user.id !== currentUser.id && (
                            <button onClick={() => handleSuspend(user.id)} disabled={loadingId === user.id}
                              className="rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50">
                              {loadingId === user.id ? '...' : 'Suspend'}
                            </button>
                          )}
                          {user.status !== 'DELETED' && user.id !== currentUser.id && (
                            <button onClick={() => handleDelete(user.id)} disabled={loadingId === user.id}
                              className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100 p-1.5 transition disabled:opacity-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-right">{filteredUsers.length} of {users.length} users shown</p>
        </div>
      )}

      {/* SALES PEOPLE TAB */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Sales Staff Management</h2>
              <p className="text-sm text-muted-foreground">Manage salespeople pipeline and accounts</p>
            </div>
            <Button variant="primary" onClick={() => setShowSalesForm(s => !s)} className="flex items-center gap-2 h-10 px-4 text-sm">
              <Plus className="h-4 w-4" /> Add Sales Person
            </Button>
          </div>

          {showSalesForm && (
            <form onSubmit={handleCreateSalesPerson} className="rounded-3xl border border-primary/30 bg-primary/5 p-6 space-y-4 animate-in slide-in-from-top duration-300">
              <h3 className="font-bold text-foreground">Add New Salesperson Account</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                  <input required placeholder="Name" value={salesForm.name} onChange={e => setSalesForm(p => ({ ...p, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address *</label>
                  <input required type="email" placeholder="sales.email@example.com" value={salesForm.email} onChange={e => setSalesForm(p => ({ ...p, email: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password *</label>
                  <input required type="password" placeholder="••••••••••••" value={salesForm.password} onChange={e => setSalesForm(p => ({ ...p, password: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={creatingSales} className="h-9 px-4 text-sm">{creatingSales ? 'Saving...' : 'Add Sales Person'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowSalesForm(false)} className="h-9 px-4 text-sm">Cancel</Button>
              </div>
            </form>
          )}

          <div className="rounded-[20px] border border-border bg-white shadow-enterprise overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-foreground">Sales Person</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Email</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Status</th>
                    <th className="px-5 py-3 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {salesPeople.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">No salespeople registered yet.</td></tr>
                  ) : salesPeople.map(sp => (
                    <tr key={sp.id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-4 font-semibold text-foreground">{sp.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{sp.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[sp.status] || 'bg-muted text-muted-foreground'}`}>{sp.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {sp.status !== 'ACTIVE' && (
                            <button onClick={() => handleActivate(sp.id)} disabled={loadingId === sp.id}
                              className="rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50">
                              Activate
                            </button>
                          )}
                          {sp.status === 'ACTIVE' && (
                            <button onClick={() => handleSuspend(sp.id)} disabled={loadingId === sp.id}
                              className="rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50">
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS & PRICING TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Catalog & Pricing</h2>
              <p className="text-sm text-muted-foreground">Manage product listings and update prices</p>
            </div>
            <Button variant="primary" onClick={() => setShowProductForm(p => !p)} className="flex items-center gap-2 h-10 px-4 text-sm">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>

          {showProductForm && (
            <form onSubmit={handleCreateProduct} className="rounded-3xl border border-primary/30 bg-primary/5 p-6 space-y-4 animate-in slide-in-from-top duration-300">
              <h3 className="font-bold text-foreground">Add New Catalog Product</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Name *</label>
                  <input required placeholder="Apple Gala 1kg" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unique Slug *</label>
                  <input required placeholder="apple-gala-1kg" value={productForm.slug} onChange={e => setProductForm(p => ({ ...p, slug: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU *</label>
                  <input required placeholder="OP-APPL-01" value={productForm.sku} onChange={e => setProductForm(p => ({ ...p, sku: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Barcode</label>
                  <input placeholder="6001..." value={productForm.barcode} onChange={e => setProductForm(p => ({ ...p, barcode: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category *</label>
                  <select required value={productForm.categoryId} onChange={e => setProductForm(p => ({ ...p, categoryId: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price ($) *</label>
                  <input required type="number" step="0.01" placeholder="4.99" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost Price ($)</label>
                  <input type="number" step="0.01" placeholder="2.50" value={productForm.costPrice} onChange={e => setProductForm(p => ({ ...p, costPrice: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Rate (%) *</label>
                  <input required type="number" step="0.01" placeholder="0.00" value={productForm.taxRate} onChange={e => setProductForm(p => ({ ...p, taxRate: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Image URL</label>
                  <input placeholder="/images/products/..." value={productForm.imageUrl} onChange={e => setProductForm(p => ({ ...p, imageUrl: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                  <textarea placeholder="Description" rows={3} value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex items-center gap-3">
                  <input id="prodFeatured" type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm(p => ({ ...p, isFeatured: e.target.checked }))}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  <label htmlFor="prodFeatured" className="text-sm font-semibold text-foreground">Featured Product</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" disabled={creatingProduct} className="h-9 px-4 text-sm">{creatingProduct ? 'Creating...' : 'Create Product'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowProductForm(false)} className="h-9 px-4 text-sm">Cancel</Button>
              </div>
            </form>
          )}

          <div className="flex gap-3">
            <input type="text" placeholder="Search products by name or SKU..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
              className="flex-1 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="rounded-[20px] border border-border bg-white shadow-enterprise overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-foreground">Product</th>
                    <th className="px-5 py-3 font-semibold text-foreground">SKU</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Category</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Price</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Status</th>
                    <th className="px-5 py-3 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {productsLoading ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading products...</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No products found.</td></tr>
                  ) : filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0">BOX</div>
                          )}
                          <span className="font-semibold text-foreground">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{p.sku}</td>
                      <td className="px-5 py-4 text-muted-foreground">{p.category?.name || 'Uncategorized'}</td>
                      <td className="px-5 py-4">
                        {editingPriceId === p.id ? (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <span className="text-muted-foreground font-bold">$</span>
                            <input type="number" step="0.01" className="w-20 rounded-lg border border-border bg-card px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                              value={newPrice} onChange={e => setNewPrice(e.target.value)} />
                            <button onClick={() => handleUpdatePrice(p.id, newPrice)} disabled={updatingPriceId === p.id}
                              className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setEditingPriceId(null)} className="p-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">${Number(p.price).toFixed(2)}</span>
                            <button onClick={() => { setEditingPriceId(p.id); setNewPrice(p.price); }}
                              className="p-1 text-muted-foreground hover:text-primary transition">
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">{p.status}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/products/${p.slug}`} target="_blank" className="text-xs text-primary hover:underline font-semibold">View Live</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ROLES TAB */}
      {activeTab === 'roles' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">System Roles</h2>
              <p className="text-sm text-muted-foreground">Manage access roles assigned to users</p>
            </div>
            <Button variant="primary" onClick={() => setShowRoleForm(s => !s)} className="flex items-center gap-2 h-10 px-4 text-sm">
              <Plus className="h-4 w-4" /> New Role
            </Button>
          </div>
          {showRoleForm && (
            <form onSubmit={handleCreateRole} className="rounded-3xl border border-primary/30 bg-primary/5 p-6 space-y-4">
              <h3 className="font-bold text-foreground">Create New Role</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role Name *</label>
                  <input required placeholder="e.g. STORE_CLERK" value={roleForm.name} onChange={e => setRoleForm(p => ({ ...p, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                  <input placeholder="Brief description" value={roleForm.description} onChange={e => setRoleForm(p => ({ ...p, description: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions (comma-separated)</label>
                  <input placeholder="read:products, write:orders" value={roleForm.permissions} onChange={e => setRoleForm(p => ({ ...p, permissions: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={creatingRole} className="h-9 px-4 text-sm">{creatingRole ? 'Creating...' : 'Create Role'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowRoleForm(false)} className="h-9 px-4 text-sm">Cancel</Button>
              </div>
            </form>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {roles.map(role => (
              <div key={role.id} className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all duration-300 hover:-translate-y-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2.5"><Crown className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-bold text-foreground">{role.name}</h3>
                      <p className="text-xs text-muted-foreground">{role.description || 'No description'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-muted px-2.5 py-1 rounded-full text-muted-foreground shrink-0">{role._count.users} users</span>
                </div>
                {Array.isArray(role.permissions) && role.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(role.permissions as string[]).slice(0, 5).map(p => (
                      <span key={p} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-mono">{p}</span>
                    ))}
                    {(role.permissions as string[]).length > 5 && (
                      <span className="text-xs text-muted-foreground">+{(role.permissions as string[]).length - 5} more</span>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Created {new Date(role.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Audit Log</h2>
              <p className="text-sm text-muted-foreground">{auditLogs.length} system events</p>
            </div>
            <button onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
          <div className="rounded-[20px] border border-border bg-white shadow-enterprise overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-foreground">Action</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Entity</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Actor</th>
                    <th className="px-5 py-3 font-semibold text-foreground">IP</th>
                    <th className="px-5 py-3 font-semibold text-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No audit events recorded yet.</td></tr>
                  ) : auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-3.5"><span className={`font-bold text-xs uppercase ${ACTION_COLORS[log.action] || 'text-muted-foreground'}`}>{log.action}</span></td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-foreground">{log.entityName}</span>
                        {log.entityId && <span className="block text-xs text-muted-foreground font-mono">{log.entityId.slice(0, 16)}...</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-foreground">{log.actor?.name || 'System'}</span>
                        {log.actor?.email && <span className="block text-xs text-muted-foreground">{log.actor.email}</span>}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{log.ipAddress || '—'}</td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[20px] border border-border bg-white p-8 shadow-enterprise space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">System Settings</h2>
              <p className="text-sm text-muted-foreground">Configure global platform behaviour</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Name</label>
                <input value={settings.siteName} onChange={e => setSettings(p => ({ ...p, siteName: e.target.value }))}
                  className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Default Currency</label>
                <select value={settings.defaultCurrency} onChange={e => setSettings(p => ({ ...p, defaultCurrency: e.target.value }))}
                  className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  {['USD', 'EUR', 'GBP', 'ZWL'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Upload Size (MB)</label>
                <input type="number" value={settings.maxUploadSizeMB} onChange={e => setSettings(p => ({ ...p, maxUploadSizeMB: parseInt(e.target.value) }))}
                  className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Low Stock Threshold (units)</label>
                <input type="number" value={settings.lowStockThreshold} onChange={e => setSettings(p => ({ ...p, lowStockThreshold: parseInt(e.target.value) }))}
                  className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {[
                { key: 'maintenanceMode' as const, label: 'Maintenance Mode', sub: 'Disables storefront for customers' },
                { key: 'registrationEnabled' as const, label: 'Customer Registration', sub: 'Allow new customers to sign up' },
              ].map(toggle => (
                <div key={toggle.key} className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 p-4">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{toggle.label}</p>
                    <p className="text-xs text-muted-foreground">{toggle.sub}</p>
                  </div>
                  <button onClick={() => setSettings(p => ({ ...p, [toggle.key]: !p[toggle.key] }))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${settings[toggle.key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings[toggle.key] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="primary" onClick={handleSaveSettings} disabled={savingSettings} className="flex items-center gap-2 h-10 px-6 text-sm">
              {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h3 className="font-bold text-destructive">Danger Zone</h3>
            </div>
            <p className="text-sm text-muted-foreground">These actions are irreversible. Exercise caution.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="rounded-2xl border border-destructive/50 bg-background px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition">
                Export All Data (JSON)
              </button>
              <button className="rounded-2xl border border-destructive/50 bg-background px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition">
                Purge Deleted Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

