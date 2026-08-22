"use client";

import { useState } from "react";
import { CreditCard, Package, FileText, RefreshCw, ExternalLink, Download, ChevronRight } from "lucide-react";

type Tab = "subscriptions" | "orders" | "invoices";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  stripeSessionId: string | null;
  trackingNumber: string | null;
  cart: string;
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

export function BillingClient({ orders, subscriptions, invoices, paymentMethods }: Props) {
  const [tab, setTab] = useState<Tab>("subscriptions");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "subscriptions", label: "Subscriptions", icon: <CreditCard className="h-4 w-4" />, count: subscriptions.length },
    { id: "orders", label: "Orders", icon: <Package className="h-4 w-4" />, count: orders.length },
    { id: "invoices", label: "Invoices", icon: <FileText className="h-4 w-4" />, count: invoices.length },
  ];

  return (
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
                    <div key={order.id} className="flex items-center gap-4 rounded-xl border border-[#e8d8db] bg-[#fffafb] p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#550C18]/8 text-[#550C18]">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#2e0c12]">
                          {cart.map((p: any) => p.name || p.productName || p.id).join(", ") || "Order"}
                        </p>
                        <p className="text-xs text-[#8b6f76]">
                          {fmtDate(order.createdAt)}
                          {order.trackingNumber ? ` · Tracking: ${order.trackingNumber}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0">{statusPill(order.status)}</div>
                    </div>
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
                      <p className="text-sm font-medium text-[#2e0c12]">
                        {inv.number || inv.id}
                      </p>
                      <p className="text-xs text-[#8b6f76]">
                        {fmtDate(inv.created)} · {fmt(inv.total, inv.currency)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {statusPill(inv.status ?? "unknown")}
                      {inv.hostedInvoiceUrl && (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8d8db] text-[#550C18] transition hover:bg-[#550C18]/5"
                          title="View invoice"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {inv.pdfUrl && (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8d8db] text-[#550C18] transition hover:bg-[#550C18]/5"
                          title="Download PDF"
                        >
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
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-[#8b6f76]">{label}</p>
    </div>
  );
}
