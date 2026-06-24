'use client';

import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Boxes,
  Download, FileText, FileSpreadsheet, Printer, Search, Calendar, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export interface SalesReportData {
  summary: {
    totalSales: number;
    avgOrderValue: number;
    totalOrders: number;
    salesGrowth: number;
  };
  chartData: Array<{ date: string; sales: number; orders: number }>;
  transactions: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    createdAt: string;
    grandTotal: number;
    status: string;
    paymentStatus: string;
  }>;
}

export interface RevenueReportData {
  summary: {
    grossRevenue: number;
    costOfGoods: number;
    netProfit: number;
    profitMargin: number;
  };
  chartData: Array<{ date: string; revenue: number; profit: number; cost: number }>;
  transactions: Array<{
    id: string;
    date: string;
    orderNumber: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
}

export interface ProductsReportData {
  summary: {
    bestSeller: string;
    totalUnitsSold: number;
    avgRating: number;
    outOfStockCount: number;
  };
  chartData: Array<{ name: string; unitsSold: number; revenue: number }>;
  tableData: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    unitsSold: number;
    revenue: number;
    stock: number;
    status: string;
  }>;
}

export interface InventoryReportData {
  summary: {
    totalValue: number;
    uniqueSKUs: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  chartData: Array<{ category: string; value: number; count: number }>;
  tableData: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    costPrice: number;
    totalValue: number;
    reorderLevel: number;
    status: string;
  }>;
}

export interface CustomersReportData {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    returningRate: number;
    averageLtv: number;
  };
  chartData: Array<{ date: string; newCustomers: number; returningCustomers: number }>;
  tableData: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    ordersCount: number;
    totalSpent: number;
    status: string;
  }>;
}

interface ReportsDashboardProps {
  salesReport: SalesReportData;
  revenueReport: RevenueReportData;
  productsReport: ProductsReportData;
  inventoryReport: InventoryReportData;
  customersReport: CustomersReportData;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#3f3f46'];

export default function ReportsDashboard({
  salesReport,
  revenueReport,
  productsReport,
  inventoryReport,
  customersReport
}: ReportsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'sales' | 'revenue' | 'products' | 'inventory' | 'customers'>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('30days');

  // Export handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        const stringVal = String(val).replace(/"/g, '""');
        return stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('"') ? `"${stringVal}"` : stringVal;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exportToExcel = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const tsvContent = [
      headers.join('\t'),
      ...data.map(row => headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        return String(val).replace(/\t/g, ' ');
      }).join('\t'))
    ].join('\n');

    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getExportData = () => {
    switch (activeTab) {
      case 'sales':
        return salesReport.transactions;
      case 'revenue':
        return revenueReport.transactions;
      case 'products':
        return productsReport.tableData;
      case 'inventory':
        return inventoryReport.tableData;
      case 'customers':
        return customersReport.tableData;
    }
  };

  const handleExportCSV = () => {
    exportToCSV(getExportData(), `${activeTab}_report_${dateRange}`);
  };

  const handleExportExcel = () => {
    exportToExcel(getExportData(), `${activeTab}_report_${dateRange}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredData = (data: any[], fields: string[]) => {
    return data.filter(row =>
      fields.some(field =>
        String(row[field] || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Export Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-[20px] border border-border bg-white p-6 shadow-enterprise print:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Selector */}
          {[
            { key: 'sales' as const, label: 'Sales', icon: TrendingUp },
            { key: 'revenue' as const, label: 'Revenue', icon: DollarSign },
            { key: 'products' as const, label: 'Products', icon: ShoppingBag },
            { key: 'inventory' as const, label: 'Inventory', icon: Boxes },
            { key: 'customers' as const, label: 'Customers', icon: Users },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-secondary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-foreground cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thismonth">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-muted rounded-2xl p-1">
            <button
              onClick={handleExportCSV}
              title="Export as CSV"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card transition"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleExportExcel}
              title="Export as Excel"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card transition"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </button>
            <button
              onClick={handlePrint}
              title="Print / Export PDF"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card transition"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Sales', value: `$${salesReport.summary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Gross Order Revenue', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Avg Order Value', value: `$${salesReport.summary.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Per transaction', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Total Orders', value: salesReport.summary.totalOrders.toLocaleString(), sub: 'Completed transactions', icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { label: 'Sales Growth', value: `${salesReport.summary.salesGrowth >= 0 ? '+' : ''}${salesReport.summary.salesGrowth.toFixed(1)}%`, sub: 'Vs prior period', icon: salesReport.summary.salesGrowth >= 0 ? TrendingUp : TrendingDown, color: salesReport.summary.salesGrowth >= 0 ? 'text-emerald-500' : 'text-red-500', bg: salesReport.summary.salesGrowth >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
            ].map((stat, i) => (
              <div key={i} className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                  <div className={`rounded-[12px] p-2 ${stat.bg} ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
                </div>
                <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
            <h3 className="text-lg font-bold text-secondary mb-4">Sales & Order Volume Trends</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesReport.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e4e4e7' }} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="sales" name="Sales ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders Count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Section */}
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
              <h3 className="text-lg font-bold text-foreground">Detailed Transactions</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search order or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm text-left">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Order #</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Customer</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Date</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Grand Total</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredData(salesReport.transactions, ['orderNumber', 'customerName', 'customerEmail']).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No transactions found</td>
                    </tr>
                  ) : (
                    filteredData(salesReport.transactions, ['orderNumber', 'customerName', 'customerEmail']).map((order) => (
                      <tr key={order.id} className="hover:bg-muted/10 transition">
                        <td className="px-6 py-4 font-semibold text-foreground">{order.orderNumber}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-foreground">${Number(order.grandTotal).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REVENUE TAB */}
      {activeTab === 'revenue' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Gross Revenue', value: `$${revenueReport.summary.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Total Inflow', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Cost of Goods', value: `$${revenueReport.summary.costOfGoods.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Total Cost Value', icon: Boxes, color: 'text-red-500', bg: 'bg-red-500/10' },
              { label: 'Net Profit', value: `$${revenueReport.summary.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Take home earnings', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Profit Margin', value: `${revenueReport.summary.profitMargin.toFixed(1)}%`, sub: 'Revenue to profit ratio', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            ].map((stat, i) => (
              <div key={i} className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                  <div className={`rounded-[12px] p-2 ${stat.bg} ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
                </div>
                <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
            <h3 className="text-lg font-bold text-secondary mb-4">Revenue vs Cost vs Profit Analysis</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueReport.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e4e4e7' }} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Cost of Goods ($)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
              <h3 className="text-lg font-bold text-foreground">Revenue Transactions Summary</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm text-left">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Date</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Order #</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Revenue</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Cost Price</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Profit Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredData(revenueReport.transactions, ['orderNumber']).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No reports found</td>
                    </tr>
                  ) : (
                    filteredData(revenueReport.transactions, ['orderNumber']).map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/10 transition">
                        <td className="px-6 py-4 text-muted-foreground">{new Date(row.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-semibold text-foreground">{row.orderNumber}</td>
                        <td className="px-6 py-4 text-right font-semibold text-emerald-600">${Number(row.revenue).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-red-500">${Number(row.cost).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-indigo-600">${Number(row.profit).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Best Seller Product', value: productsReport.summary.bestSeller, sub: 'Top selling item', icon: ShoppingBag, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Total Units Sold', value: productsReport.summary.totalUnitsSold.toLocaleString(), sub: 'Volume of items sold', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Average Product Rating', value: `${productsReport.summary.avgRating.toFixed(1)} / 5.0`, sub: 'Customer reviews feedback', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Out of Stock Items', value: productsReport.summary.outOfStockCount, sub: 'Products requiring reorder', icon: Boxes, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((stat, i) => (
              <div key={i} className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                  <div className={`rounded-[12px] p-2 ${stat.bg} ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
                </div>
                <p className="mt-4 text-xl font-bold text-foreground truncate" title={String(stat.value)}>{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
            <h3 className="text-lg font-bold text-secondary mb-4">Top Selling Products by Revenue & Units</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productsReport.chartData.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 12 ? `${val.substring(0, 10)}...` : val} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e4e4e7' }} />
                  <Legend />
                  <Bar dataKey="unitsSold" name="Units Sold" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
              <h3 className="text-lg font-bold text-foreground">Product Sales Performance</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm text-left">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Product Name</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">SKU</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Retail Price</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Units Sold</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Total Revenue</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Stock Remaining</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredData(productsReport.tableData, ['name', 'sku']).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">No product data found</td>
                    </tr>
                  ) : (
                    filteredData(productsReport.tableData, ['name', 'sku']).map((prod) => (
                      <tr key={prod.id} className="hover:bg-muted/10 transition">
                        <td className="px-6 py-4 font-semibold text-foreground">{prod.name}</td>
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{prod.sku}</td>
                        <td className="px-6 py-4 text-right text-foreground">${Number(prod.price).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-foreground font-semibold">{prod.unitsSold}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">${Number(prod.revenue).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">{prod.stock}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            prod.stock <= 0 ? 'bg-red-50 text-red-700 border border-red-100' :
                            prod.stock <= 10 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {prod.stock <= 0 ? 'OUT_OF_STOCK' : prod.stock <= 10 ? 'LOW_STOCK' : 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Stock Value', value: `$${inventoryReport.summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Current asset evaluation', icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Unique SKUs', value: inventoryReport.summary.uniqueSKUs, sub: 'Individual products catalog', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Low Stock Alerts', value: inventoryReport.summary.lowStockCount, sub: 'Items below safety level', icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Out of Stock Products', value: inventoryReport.summary.outOfStockCount, sub: 'Zero remaining inventory', icon: Boxes, color: 'text-red-500', bg: 'bg-red-500/10' },
            ].map((stat, i) => (
              <div key={i} className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                  <div className={`rounded-[12px] p-2 ${stat.bg} ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
                </div>
                <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
              <h3 className="text-lg font-bold text-secondary mb-4">Inventory Value Distribution by Category</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryReport.chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inventoryReport.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
              <h3 className="text-lg font-bold text-secondary mb-4">Product Count by Category</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryReport.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis dataKey="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Products count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
              <h3 className="text-lg font-bold text-foreground">Current Stock & Asset Levels</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search product or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm text-left">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Product</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">SKU / Category</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Cost Price</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Units on Hand</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Total Inventory Value</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Reorder Point</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredData(inventoryReport.tableData, ['name', 'sku', 'category']).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">No inventory matches</td>
                    </tr>
                  ) : (
                    filteredData(inventoryReport.tableData, ['name', 'sku', 'category']).map((row) => (
                      <tr key={row.id} className="hover:bg-muted/10 transition">
                        <td className="px-6 py-4 font-semibold text-foreground">{row.name}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-mono text-muted-foreground">{row.sku}</p>
                          <p className="text-xs text-primary font-semibold">{row.category}</p>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">${Number(row.costPrice).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-foreground">{row.stock}</td>
                        <td className="px-6 py-4 text-right font-bold text-foreground">${Number(row.totalValue).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">{row.reorderLevel}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.stock === 0 ? 'bg-red-50 text-red-700 border border-red-100' :
                            row.stock <= row.reorderLevel ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {row.stock === 0 ? 'OUT_OF_STOCK' : row.stock <= row.reorderLevel ? 'REORDER_NOW' : 'OK'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Customers', value: customersReport.summary.totalCustomers.toLocaleString(), sub: 'Registered shopper base', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Active Shoppers', value: customersReport.summary.activeCustomers.toLocaleString(), sub: 'With purchase in last 30 days', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Returning Rate', value: `${customersReport.summary.returningRate.toFixed(1)}%`, sub: 'Repeat buyers factor', icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Avg Customer LTV', value: `$${customersReport.summary.averageLtv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Average lifetime spend', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((stat, i) => (
              <div key={i} className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                  <div className={`rounded-[12px] p-2 ${stat.bg} ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
                </div>
                <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all hover:-translate-y-1">
            <h3 className="text-lg font-bold text-secondary mb-4">Customer Acquisition & Engagement Activity</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customersReport.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e4e4e7' }} />
                  <Legend />
                  <Line type="monotone" dataKey="newCustomers" name="New Customers" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="returningCustomers" name="Returning Customers" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
              <h3 className="text-lg font-bold text-foreground">Customer Value Log</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm text-left">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Customer Details</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Joined Date</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Orders Placed</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Lifetime Spend</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredData(customersReport.tableData, ['name', 'email']).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No customer records matches</td>
                    </tr>
                  ) : (
                    filteredData(customersReport.tableData, ['name', 'email']).map((cust) => (
                      <tr key={cust.id} className="hover:bg-muted/10 transition">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground">{cust.name}</p>
                          <p className="text-xs text-muted-foreground">{cust.email}</p>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(cust.joinedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right text-foreground font-semibold">{cust.ordersCount}</td>
                        <td className="px-6 py-4 text-right font-bold text-indigo-600">${Number(cust.totalSpent).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            cust.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {cust.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}