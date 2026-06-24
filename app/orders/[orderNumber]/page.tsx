import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/guards';
import { getOrderByNumber } from '@/lib/order-service';
import { formatCurrency } from '@/lib/site';
import { ArrowLeft, Package, CheckCircle, Clock, Truck, Home, XCircle, Box } from 'lucide-react';

const ORDER_STATUSES = [
  { key: 'PENDING', label: 'Pending', icon: Clock, description: 'Order received and awaiting confirmation.' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed and entered processing queue.' },
  { key: 'PROCESSING', label: 'Processing', icon: Package, description: 'Your items are being picked and prepared.' },
  { key: 'PACKED', label: 'Packed', icon: Box, description: 'Order packed and ready for dispatch.' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, description: 'Your order is on its way to you!' },
  { key: 'DELIVERED', label: 'Delivered', icon: Home, description: 'Order successfully delivered. Enjoy!' },
] as const;

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  PROCESSING: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  PACKED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  OUT_FOR_DELIVERY: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLOR[status] ?? { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const user = await requireUser();
  const { orderNumber } = await params;
  const order = await getOrderByNumber(user.id, orderNumber);

  if (!order) {
    notFound();
  }

  const isCancelled = order.status === 'CANCELLED';
  const currentStepIndex = isCancelled
    ? -1
    : ORDER_STATUSES.findIndex((s) => s.key === order.status);

  const shippingAddress = order.shippingAddress as Record<string, string>;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/account?tab=orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline mb-3"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono font-semibold">{order.orderNumber}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left col */}
        <div className="space-y-6">
          {/* Status Timeline */}
          {isCancelled ? (
            <div className="flex items-center gap-4 rounded-3xl border border-red-200 bg-red-50 p-6">
              <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700">Order Cancelled</p>
                <p className="text-sm text-red-600 mt-0.5">This order was cancelled. Contact support if you need assistance.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Delivery Timeline</h2>
              <div className="space-y-0">
                {ORDER_STATUSES.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isActive = index === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative flex gap-4">
                      {/* Connector line */}
                      {index < ORDER_STATUSES.length - 1 && (
                        <div
                          className={`absolute left-[18px] top-10 w-0.5 h-full transition-colors duration-500 ${
                            index < currentStepIndex ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                          isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground'
                        } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className={`pb-8 ${index === ORDER_STATUSES.length - 1 ? 'pb-0' : ''}`}>
                        <p
                          className={`text-sm font-semibold ${
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                        {isActive && (
                          <p className="mt-0.5 text-xs text-muted-foreground animate-in fade-in duration-300">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Order Items</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item: {
                id: string;
                productName: string;
                sku: string;
                quantity: number;
                lineTotal: { toNumber: () => number } | number;
                unitPrice: { toNumber: () => number } | number;
                product: {
                  imageUrl: string | null;
                } | null;
              }) => (
                <div key={item.id} className="flex items-center gap-4 p-5">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.productName}
                      className="h-14 w-14 rounded-2xl object-cover border border-border bg-muted"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-muted border border-border flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.sku} · Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(Number(item.lineTotal))}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(Number(item.unitPrice))} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary + Address */}
        <div className="space-y-5">
          {/* Cost Summary */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-foreground">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.discountTotal) > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>-{formatCurrency(Number(order.discountTotal))}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(Number(order.taxTotal))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-primary font-semibold">Free</span>
              </div>
              <div className="flex justify-between font-bold text-foreground border-t border-border pt-3">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(Number(order.grandTotal))}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">Payment Status</span>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-foreground">Shipping To</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">{shippingAddress.fullName}</p>
              <p>{shippingAddress.addressLine1}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.province}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.phone && <p className="text-primary">{shippingAddress.phone}</p>}
            </div>
          </div>

          {/* Order Meta */}
          <div className="rounded-3xl border border-border bg-muted p-5 space-y-2 text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Order Date: </span>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p>
              <span className="font-semibold text-foreground">Order #: </span>
              <span className="font-mono">{order.orderNumber}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
