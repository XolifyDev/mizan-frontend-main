import { stripeClient } from "@/lib/stripe";
import { TrendingUp, CreditCard, Users, DollarSign, RefreshCw, ExternalLink } from "lucide-react";

const fmt = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

const fmtDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function AdminStripePage() {
  const [balance, charges, customers, subscriptions] = await Promise.all([
    stripeClient.balance.retrieve(),
    stripeClient.paymentIntents.list({ limit: 50 }),
    stripeClient.customers.list({ limit: 10 }),
    stripeClient.subscriptions.list({ limit: 10, status: "active" }),
  ]);

  const succeeded = charges.data.filter((c) => c.status === "succeeded");
  const totalRevenue = succeeded.reduce((sum, c) => sum + c.amount, 0);
  const avgCharge = succeeded.length > 0 ? totalRevenue / succeeded.length : 0;

  const availableUSD = balance.available.find((b) => b.currency === "usd");
  const pendingUSD = balance.pending.find((b) => b.currency === "usd");

  const stats = [
    { label: "Total Revenue (50 recent)", value: fmt(totalRevenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Available Balance", value: availableUSD ? fmt(availableUSD.amount) : "$0.00", icon: CreditCard, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Balance", value: pendingUSD ? fmt(pendingUSD.amount) : "$0.00", icon: RefreshCw, color: "bg-amber-50 text-amber-600" },
    { label: "Avg. Charge", value: fmt(Math.round(avgCharge)), icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
    { label: "Active Subscriptions", value: subscriptions.data.length, icon: Users, color: "bg-pink-50 text-pink-600" },
    { label: "Succeeded Payments", value: succeeded.length, icon: TrendingUp, color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2e0c12]">Mizan Stripe</h1>
          <p className="mt-1 text-sm text-[#8b6f76]">Your platform Stripe account overview</p>
        </div>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-[#635BFF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
        >
          <ExternalLink className="h-4 w-4" />
          Open Stripe Dashboard
        </a>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#550C18]/8 bg-white p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-[#2e0c12]">{s.value}</p>
            <p className="mt-0.5 text-sm text-[#8b6f76]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent payments */}
        <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden lg:col-span-2">
          <div className="border-b border-[#f5ecee] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#2e0c12]">Recent Payment Intents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f5ecee] bg-[#fffafb]">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#8b6f76]">ID</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#8b6f76]">Description</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#8b6f76]">Status</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#8b6f76]">Date</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-[#8b6f76]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ecee]">
                {charges.data.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fffafb] transition">
                    <td className="px-5 py-3 font-mono text-xs text-[#8b6f76]">{c.id.slice(0, 20)}…</td>
                    <td className="px-5 py-3 text-[#2e0c12]">{c.description || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                        c.status === "succeeded" ? "bg-emerald-50 text-emerald-700"
                          : c.status === "processing" ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-700"
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3 text-[#8b6f76]">{fmtDate(c.created)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#2e0c12]">{fmt(c.amount, c.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active subscriptions */}
        <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f5ecee] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#2e0c12]">Active Subscriptions</h2>
          </div>
          <div className="divide-y divide-[#f5ecee]">
            {subscriptions.data.length === 0
              ? <p className="py-8 text-center text-sm text-[#8b6f76]">No active subscriptions</p>
              : subscriptions.data.map((s) => (
                <div key={s.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#2e0c12] font-mono">{s.id.slice(0, 18)}…</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{s.status}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#8b6f76]">
                    Renews {fmtDate(s.current_period_end)} · {s.items.data.length} item(s)
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Recent customers */}
        <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f5ecee] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#2e0c12]">Recent Customers</h2>
          </div>
          <div className="divide-y divide-[#f5ecee]">
            {customers.data.length === 0
              ? <p className="py-8 text-center text-sm text-[#8b6f76]">No customers</p>
              : customers.data.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-[#2e0c12]">{c.name || "—"}</p>
                    <p className="text-xs text-[#8b6f76]">{c.email}</p>
                  </div>
                  <p className="text-xs text-[#8b6f76]">{fmtDate(c.created)}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
