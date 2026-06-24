'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertCircle, ArrowRight, Briefcase, Calendar, CheckCircle2, ChevronRight, DollarSign, Download, Mail, Phone, Plus, RefreshCw, Search, ShieldAlert, ShoppingCart, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLead, updateLeadStatus, updateOrderStatus, updateOrderPaymentStatus } from '@/app/actions/dashboard.actions';

interface SalesDashboardProps {
  initialData: {
    leads: Array<{ id: string; name: string; email: string; phone: string | null; status: string; value: string | null; source: string | null; notes: string | null; createdAt: string }>;
    assignedOrders: Array<{
      id: string;
      orderNumber: string;
      subtotal: string;
      grandTotal: string;
      status: string;
      paymentStatus: string;
      createdAt: string;
      user: { name: string; email: string };
    }>;
    customers: Array<{ id: string; name: string; email: string; createdAt: string; _count: { orders: number }; orders: Array<{ grandTotal: string }> }>;
    monthlySales: Array<{ month: string; revenue: number; ordersCount: number }>;
    stats: {
      totalSales: number;
      totalOrders: number;
      avgOrderValue: number;
      activeLeadsCount: number;
      conversionRate: number;
    };
    currentUserId: string;
  };
}

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const SOURCE_COLORS: Record<string, string> = { WEBSITE: '#10b981', REFERRAL: '#3b82f6', COLD_CALL: '#f59e0b', CAMPAIGN: '#ef4444' };

export default function SalesDashboard({ initialData }: SalesDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'leads' | 'orders' | 'reports'>('overview');
  const [leads, setLeads] = useState(initialData.leads);
  const [assignedOrders, setAssignedOrders] = useState(initialData.assignedOrders);
  
  // Filtering & searching
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  
  // Lead creator state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', value: '', source: 'WEBSITE', notes: '' });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Date filter for reports
  const [reportRange, setReportRange] = useState('30');
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    setActionMessage('');
    try {
      const payload = {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        status: 'NEW',
        value: parseFloat(leadForm.value) || 0,
        source: leadForm.source,
        notes: leadForm.notes,
      };
      const result = await createLead(payload);
      if (result.success && result.lead) {
        setActionMessage('Lead created successfully!');
        // Update local state
        setLeads(prev => [result.lead as any, ...prev]);
        setLeadForm({ name: '', email: '', phone: '', value: '', source: 'WEBSITE', notes: '' });
        setShowAddLeadModal(false);
      }
    } catch (err: any) {
      console.error(err);
      setActionMessage(`Error creating lead: ${err.message || 'Error occurred'}`);
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      setActionMessage(`Lead status updated to ${newStatus}.`);
    } catch (err: any) {
      console.error(err);
      setActionMessage(`Error updating status: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setActionMessage(`Order shipment status updated to ${newStatus}.`);
    } catch (err: any) {
      console.error(err);
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const handleUpdateOrderPayment = async (orderId: string, paymentStatus: string) => {
    try {
      await updateOrderPaymentStatus(orderId, paymentStatus);
      setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o));
      setActionMessage(`Order payment status updated to ${paymentStatus}.`);
    } catch (err: any) {
      console.error(err);
      setActionMessage(`Error: ${err.message}`);
    }
  }
  // Wrapper functions for UI select handlers
  const handleOrderStatus = async (orderId: string, newStatus: string) => {
    await handleUpdateOrderStatus(orderId, newStatus);
  };
  const handleOrderPayment = async (orderId: string, paymentStatus: string) => {
    await updateOrderPaymentStatus(orderId, paymentStatus);
    setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o));
  };;

  // Mock export CSV
  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Lead Name,Email,Source,Estimated Value,Status,Date Created\n"
      + leads.map(l => `"${l.name}","${l.email}","${l.source}","${l.value}","${l.status}","${new Date(l.createdAt).toLocaleDateString()}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_leads_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionMessage('CSV Report downloaded successfully.');
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-card p-8 text-muted-foreground animate-pulse shadow-sm">
        <div className="text-center space-y-4">
          <Briefcase className="mx-auto h-12 w-12 text-primary/30 animate-spin" />
          <p className="text-sm font-semibold">Loading Sales Team workspace CRM...</p>
        </div>
      </div>
    );
  }

  const { monthlySales, stats } = initialData;

  // Filtered customer list
  const filteredCustomers = initialData.customers
    .map(cust => {
      const spent = cust.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
      return { ...cust, spent };
    })
    .filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
    );

  // Filtered assigned orders
  const filteredOrders = assignedOrders.filter(o => 
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) || 
    o.user.name.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // Lead aggregates by source
  const leadSourceData = Object.keys(SOURCE_COLORS).map(src => {
    const matchingLeads = leads.filter(l => l.source === src);
    const totalValue = matchingLeads.reduce((acc, curr) => acc + (curr.value ? Number(curr.value) : 0), 0);
    return { name: src, value: matchingLeads.length, valTotal: totalValue };
  });

  return (
    <div className="space-y-8">
      {/* Top statistics overview bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Value</p>
          <p className="mt-3 text-2xl font-bold text-foreground">
            {formatMoney(leads.reduce((sum, l) => sum + (l.status !== 'LOST' && l.value ? Number(l.value) : 0), 0))}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{leads.filter(l => l.status !== 'LOST').length} Active leads</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sales</p>
          <p className="mt-3 text-2xl font-bold text-primary">{formatMoney(stats.totalSales)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{stats.totalOrders} total orders</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Order Value</p>
          <p className="mt-3 text-2xl font-bold text-foreground">{formatMoney(stats.avgOrderValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Retail shopping cart average</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Deals</p>
          <p className="mt-3 text-2xl font-bold text-foreground">{stats.activeLeadsCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">In qualification stages</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LTV Win Rate</p>
          <p className="mt-3 text-2xl font-bold text-foreground">{(stats.conversionRate).toFixed(1)}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Leads converted to buyers</p>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto">
        {(['overview', 'customers', 'leads', 'orders', 'reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px capitalize ${
              activeTab === tab
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'orders' ? 'Assigned Orders' : tab}
          </button>
        ))}
      </div>

      {actionMessage && (
        <div className="rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Tab contents */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Revenue chart */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Supermarket Sales Growth</h2>
              <p className="text-sm text-muted-foreground">Store sales revenue trajectory tracking over the last 6 months.</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} contentStyle={{ borderRadius: '1rem' }} />
                  <Area type="monotone" dataKey="revenue" name="Store Sales ($)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick CRM actions and logs */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground">CRM Shortcut Actions</h3>
              <p className="text-xs text-muted-foreground">Quickly add and assign high-value B2B purchase client inquiries.</p>
              
              <div className="space-y-2.5">
                <Button className="w-full flex justify-between items-center py-5 rounded-2xl" onClick={() => setShowAddLeadModal(true)}>
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add B2B Wholesale Lead
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" className="w-full flex justify-between items-center py-5 rounded-2xl" onClick={() => setActiveTab('orders')}>
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Process Pipeline Orders
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-muted p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Assigned Leads Overview</h3>
              <div className="space-y-2 text-xs">
                {LEAD_STATUSES.map(status => {
                  const count = leads.filter(l => l.status === status).length;
                  return (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">{status}</span>
                      <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded-full border border-border">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Store Customers Directory</h3>
              <p className="text-sm text-muted-foreground">List of registered shoppers, total purchases, and registered date.</p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-center">Orders Placed</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-center">Total Spent</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No shoppers matched the search query.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(cust => (
                    <tr key={cust.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-semibold text-foreground">{cust.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{cust.email}</td>
                      <td className="px-4 py-3 text-center font-bold text-foreground">{cust._count.orders}</td>
                      <td className="px-4 py-3 text-center text-primary font-bold">{formatMoney(cust.spent)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(cust.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground">CRM Wholesale Leads Kanban</h3>
              <p className="text-sm text-muted-foreground">Manage and move B2B clients through pipeline status columns.</p>
            </div>
            <Button className="rounded-xl h-10 text-xs gap-1.5" onClick={() => setShowAddLeadModal(true)}>
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
            </Button>
          </div>

          {/* Kanban columns */}
          <div className="grid gap-4 md:grid-cols-5 overflow-x-auto pb-4">
            {LEAD_STATUSES.map(colStatus => {
              const colLeads = leads.filter(l => l.status === colStatus);
              return (
                <div key={colStatus} className="rounded-3xl border border-border bg-muted p-4 space-y-4 min-w-[200px] flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{colStatus}</span>
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold text-foreground border border-border">
                      {colLeads.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {colLeads.length === 0 ? (
                      <div className="text-center py-8 rounded-2xl border border-dashed text-xs text-muted-foreground border-border bg-background">
                        Empty Stage
                      </div>
                    ) : (
                      colLeads.map(lead => (
                        <div key={lead.id} className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition">
                          <div>
                            <h4 className="text-sm font-bold text-foreground leading-tight">{lead.name}</h4>
                            {lead.value && <p className="text-xs text-primary font-bold mt-1">{formatMoney(Number(lead.value))}</p>}
                          </div>

                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            {lead.email && <div className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" /> {lead.email}</div>}
                            {lead.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {lead.phone}</div>}
                          </div>

                          {lead.notes && (
                            <p className="text-xs text-muted-foreground border-t border-border pt-2 leading-relaxed line-clamp-2">
                              {lead.notes}
                            </p>
                          )}

                          <div className="flex justify-end gap-1.5 border-t border-border pt-2">
                            {LEAD_STATUSES.indexOf(colStatus) > 0 && (
                              <button 
                                onClick={() => handleUpdateLeadStatus(lead.id, LEAD_STATUSES[LEAD_STATUSES.indexOf(colStatus) - 1])}
                                className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 bg-muted rounded"
                              >
                                ◀
                              </button>
                            )}
                            {LEAD_STATUSES.indexOf(colStatus) < LEAD_STATUSES.length - 1 && (
                              <button 
                                onClick={() => handleUpdateLeadStatus(lead.id, LEAD_STATUSES[LEAD_STATUSES.indexOf(colStatus) + 1])}
                                className="text-xs font-bold text-primary hover:text-primary-foreground px-2 py-1 bg-primary/10 rounded"
                              >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Pipeline Orders Assigned To You</h3>
              <p className="text-sm text-muted-foreground">Manage deliveries, track fulfillment, and sign-off client orders.</p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Order #</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Customer</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-center">Fulfillment Status</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-center">Payment Status</th>
                  <th className="px-4 py-3 font-semibold text-center">Total</th>
                  <th className="px-4 py-3 font-semibold text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No orders currently assigned to you matching query.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-foreground block">{order.orderNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-foreground block">{order.user.name}</span>
                        <span className="text-xs text-muted-foreground">{order.user.email}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          order.status === 'DELIVERED' 
                            ? 'bg-primary/10 text-primary' 
                            : order.status === 'CANCELLED' 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-blue-50 text-blue-600 animate-pulse'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          order.paymentStatus === 'PAID' 
                            ? 'bg-primary/10 text-primary' 
                            : order.paymentStatus === 'FAILED' 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-foreground font-bold">{formatMoney(Number(order.grandTotal))}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <select 
                            value={order.status}
                            onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                            className="text-xs rounded border bg-background px-1.5 py-1"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                          <select 
                            value={order.paymentStatus}
                            onChange={(e) => handleOrderPayment(order.id, e.target.value)}
                            className="text-xs rounded border bg-background px-1.5 py-1"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">CRM Sales Reports</h3>
              <p className="text-sm text-muted-foreground">Filter CRM pipelines, download reports, and export sales metrics.</p>
            </div>
            <div className="flex gap-2">
              <select
                value={reportRange}
                onChange={(e) => setReportRange(e.target.value)}
                className="h-10 text-xs rounded-xl border bg-background px-3"
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="180">Last 6 Months</option>
              </select>
              <Button variant="primary" className="h-10 text-xs flex gap-2 items-center" onClick={exportCSV}>
                <Download className="h-4 w-4" />
                <span>Export CSV Data</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Sales values by source */}
            <div className="rounded-2xl border border-border bg-muted p-5 space-y-4">
              <h4 className="text-sm font-bold text-foreground">Lead Volume by Acquisition Channel</h4>
              <div className="space-y-4">
                {leadSourceData.map((data) => {
                  const percent = Math.min(100, (data.value / (leads.length || 1)) * 100);
                  return (
                    <div key={data.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">{data.name}</span>
                        <span className="text-foreground">{data.value} leads ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${percent}%`, backgroundColor: SOURCE_COLORS[data.name] || '#10b981' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial indicators for B2B pipelines */}
            <div className="rounded-2xl border border-border bg-muted p-5 space-y-3">
              <h4 className="text-sm font-bold text-foreground">CRM Wholesale Indicators</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Total Leads Value:</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(leads.reduce((sum, l) => sum + (l.value ? Number(l.value) : 0), 0))}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Converted B2B Income:</span>
                  <span className="font-semibold text-primary">
                    {formatMoney(leads.filter(l => l.status === 'CONVERTED').reduce((sum, l) => sum + (l.value ? Number(l.value) : 0), 0))}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Average B2B Deal Size:</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(leads.reduce((sum, l) => sum + (l.value ? Number(l.value) : 0), 0) / (leads.length || 1))}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Pipeline Leakage (Lost Deals):</span>
                  <span className="font-semibold text-red-600">
                    {formatMoney(leads.filter(l => l.status === 'LOST').reduce((sum, l) => sum + (l.value ? Number(l.value) : 0), 0))}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lg space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Add B2B Wholesale Lead</h3>
              <p className="text-xs text-muted-foreground">Register an incoming merchant lead request into CRM pipeline.</p>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-sm">
              <div className="space-y-1">
                <Label htmlFor="leadName">Contact Name</Label>
                <Input
                  id="leadName"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  required
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="leadEmail">Email Address</Label>
                  <Input
                    id="leadEmail"
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    required
                    placeholder="e.g. contact@business.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="leadPhone">Phone Number</Label>
                  <Input
                    id="leadPhone"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="e.g. +26377000000"
                  />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="leadValue">Est. Deal Value ($)</Label>
                  <Input
                    id="leadValue"
                    type="number"
                    value={leadForm.value}
                    onChange={(e) => setLeadForm({ ...leadForm, value: e.target.value })}
                    placeholder="e.g. 1500"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="leadSource">Lead Source</Label>
                  <select
                    id="leadSource"
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                    className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="WEBSITE">WEBSITE</option>
                    <option value="REFERRAL">REFERRAL</option>
                    <option value="COLD_CALL">COLD CALL</option>
                    <option value="CAMPAIGN">CAMPAIGN</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="leadNotes">Interaction Notes</Label>
                <textarea
                  id="leadNotes"
                  rows={3}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Details of client request..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddLeadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingLead}>
                  {submittingLead ? 'Saving…' : 'Save B2B Lead'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
