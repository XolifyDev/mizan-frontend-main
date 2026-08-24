"use client";

import { useState } from "react";
import { CreditCard, Package, FileText, ExternalLink, Download, ChevronRight, X, Truck, MapPin, Receipt } from "lucide-react";

type Tab = "subscriptions" | "orders" | "invoices";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  stripeSessionId: string | null;
  trackingNumber: string | null;
  cart: string;
  metaData: any;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  items: { id: string; name: string; amount: number; currency: string; interval: string }[];
}

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  total: number;
  currency: string;
  created: number;
  hostedInvoiceUrl: string | null;
  pdfUrl: string | null;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

interface Props {
  orders: Order[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
}

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);

const fmtDate = (ts: number | string) =>
  new Date(typeof ts === "number" ? ts * 1000 : ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    open: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    past_due: "bg-red-50 text-red-700 border-red-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    canceled: "bg-gray-100 text-gray-500 border-gray-200",
    void: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {status.replace("_", " ")}
    </span>
  );
};

function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  let cart: any[] = [];
  try { cart = JSON.parse(order.cart); } catch {}

  const shipping = order.metaData?.shipping || order.metaData?.shippingData || null;
  const items: any[] = order.metaData?.items || cart;
  const total = items.reduce((sum: number, item: any) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8d8db] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#2e0c12]">Order Details</h2>
            <p className="text-xs text-[#8b6f76] font-mono mt-0.5">{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b6f76] hover:bg-[#550C18]/8 hover:text-[#550C18] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status + date */}
          <div className="flex items-center justify-between">
            {statusPill(order.status)}
            <span className="text-xs text-[#8b6f76]">{fmtDate(order.createdAt)}</span>
          </div>

          {/* Items */}
          <section className="rounded-xl border border-[#e8d8db] bg-[#fffafb] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#e8d8db] px-4 py-3">
              <Receipt className="h-4 w-4 text-[#550C18]" />
              <span className="text-sm font-semibold text-[#2e0c12]">Items</span>
            </div>
            <div className="divide-y divide-[#f0e4e6]">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#2e0c12]">{item.name || item.productName || item.id}</p>
                    {item.size && <p className="text-xs text-[#8b6f76]">Size: {item.size}</p>}
                    <p className="text-xs text-[#8b6f76]">Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#2e0c12]">
                    ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
              {total > 0 && (
                <div className="flex items-center justify-between bg-[#550C18]/5 px-4 py-3">
                  <p className="text-sm font-semibold text-[#2e0c12]">Total</p>
                  <p className="text-sm font-bold text-[#550C18]">${total.toFixed(2)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Tracking */}
          <section className="rounded-xl border border-[#e8d8db] bg-[#fffafb] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#e8d8db] px-4 py-3">
              <Truck className="h-4 w-4 text-[#550C18]" />
              <span className="text-sm font-semibold text-[#2e0c12]">Tracking</span>
            </div>
            <div className="px-4 py-3">
              {order.trackingNumber ? (
                <p className="text-sm font-mono text-[#2e0c12]">{order.trackingNumber}</p>
              ) : (
                <p className="text-sm text-[#8b6f76]">No tracking number yet — we'll update this once your order ships.</p>
              )}
            </div>
          </section>

          {/* Shipping */}
          {shipping && (
            <section className="rounded-xl border border-[#e8d8db] bg-[#fffafb] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#e8d8db] px-4 py-3">
                <MapPin className="h-4 w-4 text-[#550C18]" />
                <span className="text-sm font-semibold text-[#2e0c12]">Shipping Address</span>
              </div>
              <div className="px-4 py-3 text-sm text-[#2e0c12] space-y-0.5">
                {shipping.fullName && <p className="font-medium">{shipping.fullName}</p>}
                {shipping.address && <p>{shipping.address}</p>}
                {shipping.address2 && <p>{shipping.address2}</p>}
                {(shipping.city || shipping.state || shipping.zipCode) && (
                  <p>{[shipping.city, shipping.state, shipping.zipCode].filter(Boolean).join(", ")}</p>
                )}
                {shipping.country && <p>{shipping.country}</p>}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e8d8db] px-6 py-4">
          <p className="text-xs text-center text-[#8b6f76]">
            Questions? Email <a href="mailto:support@mizanmanagement.com" className="text-[#550C18] underline">support@mizanmanagement.com</a>
          </p>
        </div>
      </div>
    </>
  );
}

export function BillingClient({ orders, subscriptions, invoices, paymentMethods }: Props) {
  const [tab, setTab] = useState<Tab>("subscriptions");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "subscriptions", label: "Subscriptions", icon: <CreditCard className="h-4 w-4" />, count: subscriptions.length },
    { id: "orders", label: "Orders", icon: <Package className="h-4 w-4" />, count: orders.length },
    { id: "invoices", label: "Invoices", icon: <FileText className="h-4 w-4" />, count: invoices.length },
  ];

  return (
    <>
      {selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      <div className="mx-auto max-w-5xl space-y-6 pb-16">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#2e0c12]">Billing</h1>
          <p className="mt-1 text-sm text-[#8b6f76]">Manage your subscriptions, orders, and payment history.</p>
        </div>

        {/* Payment methods */}
        {paymentMethods.length > 0 && (
          <div className="rounded-2xl border border-[#550C18]/10 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-[#2e0c12]">Payment Methods</p>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center gap-3 rounded-xl border border-[#e8d8db] bg-[#fffafb] px-4 py-2.5">
                  <div className="flex h-8 w-12 items-center justify-center rounded-md bg-white border border-gray-200 text-xs font-bold uppercase text-gray-700 shadow-sm">
                    {pm.brand}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2e0c12]">•••• {pm.last4}</p>
                    <p className="text-xs text-[#8b6f76]">Expires {pm.expMonth}/{pm.expYear}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="rounded-2xl border border-[#550C18]/10 bg-white shadow-sm overflow-hidden">
          <div className="flex border-b border-[#550C18]/8">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition border-b-2 -mb-px ${
                  tab === t.id
                    ? "border-[#550C18] text-[#550C18]"
                    : "border-transparent text-[#8b6f76] hover:text-[#2e0c12]"
                }`}
              >
                {t.icon}
                {t.label}
                {t.count !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${tab === t.id ? "bg-[#550C18]/10 text-[#550C18]" : "bg-gray-100 text-gray-500"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* SUBSCRIPTIONS */}
            {tab === "subscriptions" && (
              <div className="space-y-3">
                {subscriptions.length === 0 ? (
                  <Empty label="No active subscriptions" />
                ) : (
                  subscriptions.map((sub) => (
                    <div key={sub.id} className="rounded-xl border border-[#e8d8db] bg-[#fffafb] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          {sub.items.map((item) => (
                            <div key={item.id}>
                              <p className="font-medium text-[#2e0c12]">{item.name}</p>
                              <p className="text-sm text-[#8b6f76]">
                                {fmt(item.amount, item.currency)} / {item.interval}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="text-right shrink-0 space-y-1.5">
                          {statusPill(sub.status)}
                          <p className="text-xs text-[#8b6f76]">
                            {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} {fmtDate(sub.currentPeriodEnd)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ORDERS */}
            {tab === "orders" && (
              <div className="space-y-2">
                {orders.length === 0 ? (
                  <Empty label="No orders yet" />
                ) : (
                  orders.map((order) => {
                    let cart: any[] = [];
                    try { cart = JSON.parse(order.cart); } catch {}
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full flex items-center gap-4 rounded-xl border border-[#e8d8db] bg-[#fffafb] p-4 text-left transition hover:border-[#550C18]/30 hover:bg-[#550C18]/5"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#550C18]/8 text-[#550C18]">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#2e0c12]">
                            {cart.map((p: any) => p.name || p.productName || p.id).join(", ") || "Order"}
                          </p>
                          <p className="text-xs text-[#8b6f76]">
                            {fmtDate(order.createdAt)}
                            {order.trackingNumber ? ` · ${order.trackingNumber}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {statusPill(order.status)}
                          <ChevronRight className="h-4 w-4 text-[#550C18]/40" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* INVOICES */}
            {tab === "invoices" && (
              <div className="space-y-2">
                {invoices.length === 0 ? (
                  <Empty label="No invoices found" />
                ) : (
                  invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center gap-4 rounded-xl border border-[#e8d8db] bg-[#fffafb] p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#550C18]/8 text-[#550C18]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#2e0c12]">{inv.number || inv.id}</p>
                        <p className="text-xs text-[#8b6f76]">{fmtDate(inv.created)} · {fmt(inv.total, inv.currency)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {statusPill(inv.status ?? "unknown")}
                        {inv.hostedInvoiceUrl && (
                          <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8d8db] text-[#550C18] transition hover:bg-[#550C18]/5">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {inv.pdfUrl && (
                          <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8d8db] text-[#550C18] transition hover:bg-[#550C18]/5">
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-[#8b6f76]">{label}</p>
    </div>
  );
}
