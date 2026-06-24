'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/site';
import { logoutAction } from '@/app/actions/auth.actions';
import {
  User,
  Package,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Star,
  ShoppingBag,
  Mail,
  Phone,
  Shield,
  Edit3,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: string | number | { toString(): string };
  createdAt: Date | string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    lineTotal: string | number | { toString(): string };
  }>;
};

type Notification = {
  id: string;
  title: string;
  body: string;
  status: string;
  channel: string;
  createdAt: Date | string;
  readAt: Date | string | null;
};

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles: string[];
  status: string;
};

type Props = {
  user: User;
  orders: Order[];
  notifications: Notification[];
  activeTab: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
  PROCESSING: { label: 'Processing', bg: 'bg-violet-100', text: 'text-violet-700', icon: AlertCircle },
  PACKED: { label: 'Packed', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Package },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-orange-100', text: 'text-orange-700', icon: Truck },
  DELIVERED: { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  PAID: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  FAILED: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: 'bg-muted', text: 'text-muted-foreground', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function AvatarInitials({ name, email }: { name?: string | null; email?: string | null }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : email?.[0]?.toUpperCase() ?? '?';
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold text-2xl select-none">
      {initials}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ─── Tab Panels ──────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      {/* Profile hero */}
      <div className="rounded-[20px] border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8 shadow-enterprise">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 ring-2 ring-primary/20">
            {user.image ? (
              <img src={user.image} alt={user.name ?? 'Avatar'} className="h-full w-full object-cover" />
            ) : (
              <AvatarInitials name={user.name} email={user.email} />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user.name ?? 'Customer'}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                <Shield className="h-3 w-3" />
                {user.status}
              </span>
            </div>
            {user.roles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {user.roles.map((role) => (
                  <span key={role} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="rounded-[20px] border border-border bg-white p-6 space-y-4 shadow-enterprise">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
          <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary hover:underline transition-colors">
            <Edit3 className="h-3 w-3" /> Edit
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="text-sm font-semibold text-foreground truncate">{user.email ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-semibold text-muted-foreground">Not set</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 p-4 sm:col-span-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Default Shipping Address</p>
              <p className="text-sm font-semibold text-muted-foreground">No address saved yet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: ShoppingBag, label: 'Account Status', value: user.status, color: 'text-primary' },
          { icon: Star, label: 'Member Since', value: 'Active Member', color: 'text-amber-600' },
          { icon: Shield, label: 'Account Type', value: user.roles[0] ?? 'Customer', color: 'text-blue-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-[20px] border border-border bg-white p-5 shadow-enterprise text-center space-y-2 transition hover:-translate-y-1">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-sm font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-border bg-card p-16 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">No orders yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            When you place your first order, it will appear here. Start shopping!
          </p>
        </div>
        <Button asChild>
          <Link href="/products" className="inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

          return (
            <div
              key={order.id}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-foreground">{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {date} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {order.items.slice(0, 3).map((i) => i.productName).join(', ')}
                    {order.items.length > 3 && ` +${order.items.length - 3} more`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(Number(order.grandTotal.toString()))}
                  </span>
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary group-hover:border-primary/50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Track
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WishlistTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-border bg-card p-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <Heart className="h-8 w-8 text-red-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-foreground">Your wishlist is empty</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Save products you love to your wishlist and we'll notify you when prices drop.
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/products">Browse Products</Link>
      </Button>
    </div>
  );
}

function NotificationsTab({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-border bg-card p-16 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Bell className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">No notifications</h3>
          <p className="mt-2 text-sm text-muted-foreground">You're all caught up! Notifications will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => {
        const isRead = !!n.readAt;
        return (
          <div
            key={n.id}
            className={`rounded-2xl border p-4 transition ${
              isRead
                ? 'border-border bg-card opacity-70'
                : 'border-primary/20 bg-primary/5 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${isRead ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/60">
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {' · '}{n.channel}
                </p>
              </div>
              {!isRead && (
                <span className="flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  NEW
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SettingsTab({ user }: { user: User }) {
  return (
    <div className="space-y-5">
      {[
        {
          title: 'Security & Password',
          description: 'Update your password and manage two-factor authentication.',
          icon: Shield,
          href: '/forgot-password',
          label: 'Change Password',
        },
        {
          title: 'Email Preferences',
          description: 'Control which emails and notifications you receive from OP Supermarket.',
          icon: Mail,
          href: '#',
          label: 'Manage Emails',
        },
        {
          title: 'Privacy Settings',
          description: 'Manage your data, cookies, and privacy preferences.',
          icon: Eye,
          href: '#',
          label: 'View Privacy',
        },
      ].map(({ title, description, icon: Icon, href, label }) => (
        <div key={title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
          <Link
            href={href}
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {label}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      ))}

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
        <p className="text-xs text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="rounded-xl border border-destructive/30 bg-background px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5 transition">
          Delete Account
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function CustomerDashboard({ user, orders, notifications, activeTab }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState(activeTab);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleTabChange = (tabId: string) => {
    setTab(tabId);
    router.replace(`/account?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top header bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Customer Portal</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome back, {user.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <button
          onClick={() => void logoutAction()}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-destructive/30 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar navigation */}
        <aside className="space-y-2">
          <nav className="rounded-3xl border border-border bg-card p-3 shadow-sm space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = tab === id;
              const badgeCount = id === 'notifications' ? unreadCount : 0;
              return (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`group w-full flex items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-secondary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <span className="flex-1 text-left">{label}</span>
                  {badgeCount > 0 && !isActive && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {badgeCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/70" />}
                </button>
              );
            })}
          </nav>

          {/* Quick links */}
          <div className="rounded-3xl border border-border bg-muted p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Links</p>
            {[
              { href: '/products', label: 'Shop Products', icon: ShoppingBag },
              { href: '/cart', label: 'My Cart', icon: Package },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <ChevronRight className="ml-auto h-3 w-3" />
              </Link>
            ))}
          </div>
        </aside>

        {/* Main content area */}
        <main className="min-w-0">
          {/* Stats strip */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Orders', value: orders.length.toString(), icon: Package, color: 'text-blue-600 bg-blue-50' },
              { label: 'Delivered', value: orders.filter((o) => o.status === 'DELIVERED').length.toString(), icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              { label: 'In Progress', value: orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length.toString(), icon: Truck, color: 'text-orange-600 bg-orange-50' },
              { label: 'Notifications', value: unreadCount.toString(), icon: Bell, color: 'text-primary bg-primary/10' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-[20px] border border-border bg-white p-4 shadow-enterprise flex items-center gap-3 transition-all hover:-translate-y-1">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab panel */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {tab === 'profile' && <ProfileTab user={user} />}
            {tab === 'orders' && <OrdersTab orders={orders} />}
            {tab === 'wishlist' && <WishlistTab />}
            {tab === 'notifications' && <NotificationsTab notifications={notifications} />}
            {tab === 'settings' && <SettingsTab user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
}
