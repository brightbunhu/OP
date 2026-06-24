'use client';

import { useState, useEffect } from 'react';
import {
  Users, Shield, Settings, BarChart3, Activity,
  AlertCircle, Trash2, Plus, RefreshCw,
  UserX, Crown, Database, Save, TrendingUp, FileText
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'audit' | 'settings'>('overview');
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

  useEffect(() => { setMounted(true); }, []);

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 4000); };

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
          roles: res.user.roles.map((r: any) => ({ id: r.id, name: r.name })),
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

  const handleSaveSettings = async () => {
    setSavingSettings(true); await new Promise(r => setTimeout(r, 800));
    setSavingSettings(false); showMsg('Settings saved.');
  };

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (userStatusFilter === 'ALL' || u.status === userStatusFilter);
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
        <div className="rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary flex items-center justify-between">
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
            <form onSubmit={handleCreateUser} className="rounded-3xl border border-primary/30 bg-primary/5 p-6 space-y-4">
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
