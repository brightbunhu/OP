'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, ArrowUpRight, BarChart3, ChevronRight, DollarSign, Download, Layers, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { restockProduct } from '@/app/actions/dashboard.actions';

interface ManagerDashboardProps {
  initialData: {
    monthlyData: Array<{ month: string; revenue: number; cost: number; profit: number; ordersCount: number }>;
    productPerformance: Array<{ name: string; sku: string; quantity: number; revenue: number; profit: number }>;
    categoryPerformance: Array<{ name: string; revenue: number; quantity: number }>;
    lowStockProducts: Array<{ id: string; name: string; sku: string; quantity: number; reorderLevel: number; status: string }>;
    productsList: Array<{
      id: string;
      name: string;
      sku: string;
      price: string;
      costPrice: string | null;
      inventory: { quantityOnHand: number; reorderLevel: number; status: string; warehouseLocation: string | null } | null;
      category: { name: string } | null;
    }>;
    customerGrowth: Array<{ month: string; newCustomers: number; totalCustomers: number }>;
    summary: {
      totalRevenue: number;
      totalCOGS: number;
      grossProfit: number;
      profitMargin: number;
      totalCustomers: number;
      lowStockCount: number;
      totalProductsCount: number;
      totalStockValue: number;
      totalRetailValue: number;
    };
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ManagerDashboard({ initialData }: ManagerDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'revenue' | 'inventory' | 'products' | 'customers' | 'reports'>('revenue');
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleRestock = async (productId: string, defaultQty: number) => {
    setRestockingId(productId);
    setMessage('');
    try {
      const qty = restockQty[productId] || defaultQty || 50;
      await restockProduct(productId, qty);
      setMessage(`Successfully restocked product by ${qty} units.`);
      // Clear input
      setRestockQty(prev => ({ ...prev, [productId]: 0 }));
      // Reload page data by window reload, or state is handled by Next.js revalidatePath
      window.location.reload();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Error occurred';
      setMessage(`Restock failed: ${errorMessage}`);
    } finally {
      setRestockingId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-card p-8 text-muted-foreground animate-pulse shadow-sm">
        <div className="text-center space-y-4">
          <Layers className="mx-auto h-12 w-12 text-primary/30 animate-spin" />
          <p className="text-sm font-semibold">Loading management workspace analytics...</p>
        </div>
      </div>
    );
  }

  const { monthlyData, productPerformance, categoryPerformance, lowStockProducts, productsList, customerGrowth, summary } = initialData;

  return (
    <div className="space-y-8">
      {/* Quick Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">Total Revenue</p>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">{formatMoney(summary.totalRevenue)}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+12.5% from last quarter</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">Gross Profit</p>
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">{formatMoney(summary.grossProfit)}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium">
            <span>Margin: {summary.profitMargin.toFixed(1)}%</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">Total Customers</p>
            <div className="rounded-full bg-purple-500/10 p-2 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">{summary.totalCustomers}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+8% new users this month</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">Low Stock Items</p>
            <div className="rounded-full bg-red-500/10 p-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">{summary.lowStockCount}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-medium animate-pulse">
            <span>Needs immediate restocking</span>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto">
        {(['revenue', 'inventory', 'products', 'customers', 'reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px capitalize ${
              activeTab === tab
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab} analytics
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'revenue' && (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Revenue vs Cost of Goods Sold</h2>
              <p className="text-sm text-muted-foreground">Performance metrics showing total sales income versus wholesale costs over time.</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '1rem' }} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Sales Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="cost" name="COGS (Cost)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground">Monthly Targets</h3>
              <p className="text-xs text-muted-foreground">Progress towards target supermarket monthly profit threshold of $150.00.</p>
              
              {monthlyData.length > 0 && (
                <div className="space-y-4">
                  {monthlyData.slice(-3).map((item) => {
                    const target = 150;
                    const percent = Math.min(100, (item.profit / target) * 100);
                    return (
                      <div key={item.month} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-foreground">{item.month}</span>
                          <span className="text-muted-foreground">{percent.toFixed(0)}% ({formatMoney(item.profit)} / $150)</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-primary' : percent > 50 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-muted p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Profit Highlights</h3>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Average Monthly Income:</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(monthlyData.reduce((acc, curr) => acc + curr.revenue, 0) / (monthlyData.length || 1))}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Gross Margins (Avg):</span>
                  <span className="font-semibold text-foreground">
                    {((summary.grossProfit / (summary.totalRevenue || 1)) * 100).toFixed(1)}%
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Estimated Annual Net Profit:</span>
                  <span className="font-semibold text-primary">{formatMoney(summary.grossProfit * 2)}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-muted p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Products Tracked</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{summary.totalProductsCount}</p>
            </div>
            <div className="rounded-3xl bg-muted p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock Valuation (Cost)</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatMoney(summary.totalStockValue)}</p>
            </div>
            <div className="rounded-3xl bg-muted p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retail Stock Value</p>
              <p className="mt-2 text-2xl font-bold text-primary">{formatMoney(summary.totalRetailValue)}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Low stock alerts */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Critical Reorder Requirements</h3>
                  <p className="text-sm text-muted-foreground">List of catalog products that fall below safety stock limits.</p>
                </div>
                <span className="rounded-full bg-red-100 text-red-600 px-3 py-1 text-xs font-bold">{lowStockProducts.length} Alerts</span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-background">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-foreground">Product</th>
                      <th className="px-4 py-3 font-semibold text-foreground text-center">On Hand</th>
                      <th className="px-4 py-3 font-semibold text-foreground text-center">Safety Level</th>
                      <th className="px-4 py-3 font-semibold text-foreground text-right">Quick Refill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lowStockProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          All products are sufficiently stocked.
                        </td>
                      </tr>
                    ) : (
                      lowStockProducts.map((prod) => (
                        <tr key={prod.id}>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-foreground">{prod.name}</span>
                            <span className="block text-xs text-muted-foreground">{prod.sku}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs">
                              {prod.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground">{prod.reorderLevel}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <input 
                                type="number" 
                                placeholder="50"
                                className="w-14 rounded-md border text-center px-1 py-1 text-xs"
                                onChange={(e) => setRestockQty(prev => ({ ...prev, [prod.id]: parseInt(e.target.value) || 0 }))}
                                value={restockQty[prod.id] || ''}
                              />
                              <Button 
                                variant="primary"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleRestock(prod.id, 50)}
                                disabled={restockingId === prod.id}
                              >
                                {restockingId === prod.id ? 'Restocking…' : 'Refill'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category distribution */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground">Stock Volume Share</h3>
              <p className="text-xs text-muted-foreground">Proportion of order quantities purchased across product categories.</p>
              
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      dataKey="quantity"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} contentStyle={{ borderRadius: '1rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {categoryPerformance.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-semibold text-foreground truncate">{entry.name}</span>
                    <span className="text-muted-foreground">({entry.quantity})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Top Selling Products Chart */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Top-Performing Products</h3>
              <p className="text-sm text-muted-foreground">Top items ranked by gross revenue generated.</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="sku" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} contentStyle={{ borderRadius: '1rem' }} />
                  <Legend />
                  <Bar dataKey="revenue" name="Total Revenue ($)" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="profit" name="Estimated Profit ($)" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Sales table details */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground">Product Performance Breakdown</h3>
            <p className="text-xs text-muted-foreground">Itemized details of unit sales, total revenue, and estimated profit margins.</p>
            
            <div className="space-y-4">
              {productPerformance.map((prod) => {
                const margin = (prod.profit / (prod.revenue || 1)) * 100;
                return (
                  <div key={prod.sku} className="border border-border rounded-2xl p-4 space-y-3 hover:border-primary/30 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">{prod.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">SKU: {prod.sku} • Units Sold: {prod.quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground block">{formatMoney(prod.revenue)}</span>
                        <span className="text-xs font-semibold text-primary">{margin.toFixed(0)}% Margin</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${margin}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Customer growth line chart */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Customer Growth Tracking</h3>
              <p className="text-sm text-muted-foreground">Analysis of new and cumulative customer registrations over the last 6 months.</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerGrowth} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem' }} />
                  <Legend />
                  <Line type="monotone" dataKey="newCustomers" name="New registrations" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="totalCustomers" name="Cumulative Total" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-muted p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">Customer Segments</h3>
              <p className="text-xs text-muted-foreground">Breakdown of customer activity levels across registered customer accounts.</p>

              <div className="space-y-3 mt-4 text-sm">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-card">
                  <span className="font-semibold text-foreground">Active Shoppers</span>
                  <span className="font-bold text-primary">12 users</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-card">
                  <span className="font-semibold text-foreground">One-Time Buyers</span>
                  <span className="font-bold text-blue-500">2 users</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-card">
                  <span className="font-semibold text-foreground">Idle / Inactive</span>
                  <span className="font-bold text-muted-foreground">1 user</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-6">
              <p className="text-xs text-muted-foreground">
                Customer LTV averages approximately <strong className="text-foreground">$82.40</strong> per registered customer account, with a monthly retention rate of 94%.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Inventory Valuation & Safety Stock Report</h3>
              <p className="text-sm text-muted-foreground">Complete table of system products, stock levels, and replenishment status.</p>
            </div>
            <Button variant="secondary" className="h-10 text-xs flex gap-2 items-center" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              <span>Print PDF Report</span>
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Product Details</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Category</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Retail Price</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Cost Price</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-center">Stock Level</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-center">Reorder Lvl</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-center">Warehouse</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-right">Replenishment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productsList.map((prod) => {
                  const qty = prod.inventory?.quantityOnHand ?? 0;
                  const isLow = qty <= (prod.inventory?.reorderLevel ?? 0);
                  return (
                    <tr key={prod.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-foreground block">{prod.name}</span>
                        <span className="text-xs text-muted-foreground">{prod.sku}</span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{prod.category?.name || 'Groceries'}</td>
                      <td className="px-4 py-3.5 text-foreground font-medium">{formatMoney(Number(prod.price))}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{prod.costPrice ? formatMoney(Number(prod.costPrice)) : '-'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${isLow ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                          {qty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-muted-foreground">{prod.inventory?.reorderLevel ?? 10}</td>
                      <td className="px-4 py-3.5 text-center text-muted-foreground">{prod.inventory?.warehouseLocation ?? 'N/A'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          <input 
                            type="number" 
                            placeholder="50" 
                            className="w-12 rounded border px-1 py-1 text-xs text-center"
                            onChange={(e) => setRestockQty(prev => ({ ...prev, [prod.id]: parseInt(e.target.value) || 0 }))}
                            value={restockQty[prod.id] || ''}
                          />
                          <Button 
                            variant="secondary" 
                            className="h-8 px-2 text-xs" 
                            onClick={() => handleRestock(prod.id, 50)}
                            disabled={restockingId === prod.id}
                          >
                            Restock
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
