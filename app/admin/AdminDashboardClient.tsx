"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  Users, Building2, ShoppingBag, Tv, CreditCard, MonitorSmartphone,
  Wifi, TrendingUp, ArrowRight, Package, DollarSign,
} from "lucide-react";

interface Props {
  stats: {
    totalUsers: number;
    totalMasjids: number;
    totalOrders: number;
    totalMizanTv: number;
    totalKiosks: number;
    totalTVDisplays: number;
    onlineTVDisplays: number;
    totalRevenue: number;
  };
  recentOrders: {
    id: string;
    status: string;
    createdAt: string;
    cart: string;
    user: { name: string | null; email: string | null } | null;
    masjid: { name: string } | null;
  }[];
  recentMasjids: {
    id: string;
    name: string;
    city: string;
    country: string;
    logo: string | null;
    email: string | null;
  }[];
  recentCharges: {
    id: string;
    amount: number;
    currency: string;
    created: number;
    description: string | null;
  }[];
}

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const fmtDate = (ts: number | string) =>
  new Date(typeof ts === "number" ? ts * 1000 : ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    completed: "bg-emerald-50 text-emerald-700",
    processing: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
    canceled: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default function AdminDashboardClient({ stats, recentOrders, recentMasjids, recentCharges }: Props) {
  const { data: session } = authClient.useSession();
  const name = session?.user?.name?.split(" ")[0] ?? "Admin";

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-violet-50 text-violet-600", href: "/admin/users" },
    { label: "Organizations", value: stats.totalMasjids, icon: Building2, color: "bg-blue-50 text-blue-600", href: "/admin/organizations" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-[#550C18]/8 text-[#550C18]", href: "/admin/orders" },
    { label: "Revenue (Stripe)", value: fmt(stats.totalRevenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600", href: null },
    { label: "MizanTV Devices", value: stats.totalMizanTv, icon: Tv, color: "bg-orange-50 text-orange-600", href: "/admin/devices" },
    { label: "Kiosk Instances", value: stats.totalKiosks, icon: CreditCard, color: "bg-pink-50 text-pink-600", href: "/admin/kiosks" },
    {
      label: "TV Displays",
      value: `${stats.onlineTVDisplays} / ${stats.totalTVDisplays}`,
      icon: MonitorSmartphone,
      color: "bg-teal-50 text-teal-600",
      href: "/admin/displays",
      sub: "online",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="rounded-2xl border border-[#550C18]/10 bg-gradient-to-br from-[#550C18] to-[#7a1224] p-6 text-white shadow-sm">
        <p className="text-sm font-medium text-white/70">Welcome back,</p>
        <h1 className="mt-1 text-3xl font-bold">{name} 👋</h1>
        <p className="mt-2 text-sm text-white/60">
          Here's what's happening across all Mizan organizations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
          >
            <ShoppingBag className="h-4 w-4" /> View Orders
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/20"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#550C18]/8 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              {card.href && (
                <Link href={card.href} className="text-[#8b6f76] transition hover:text-[#550C18]">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <p className="mt-4 text-2xl font-bold text-[#2e0c12]">{card.value}</p>
            <p className="mt-0.5 text-sm text-[#8b6f76]">
              {card.label}
              {card.sub && <span className="ml-1 text-teal-600 font-medium">· {card.sub}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#550C18]/8 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-4 w-4 text-[#550C18]" />
              <h2 className="text-sm font-semibold text-[#2e0c12]">Recent Orders</h2>
            </div>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-[#550C18] hover:underline font-medium">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#f5ecee]">
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#8b6f76]">No orders yet</p>
            ) : recentOrders.map((order) => {
              let cart: any[] = [];
              try { cart = JSON.parse(order.cart); } catch {}
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#fffafb]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#550C18]/8 text-[#550C18]">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#2e0c12]">
                      {cart.map((p: any) => p.name || p.productName || p.id).join(", ") || "Order"}
                    </p>
                    <p className="text-xs text-[#8b6f76]">
                      {order.user?.name || order.user?.email || "Unknown"} · {order.masjid?.name ?? "No org"} · {fmtDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0">{statusPill(order.status)}</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Orgs */}
        <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#550C18]/8 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-[#550C18]" />
              <h2 className="text-sm font-semibold text-[#2e0c12]">Recent Organizations</h2>
            </div>
          </div>
          <div className="divide-y divide-[#f5ecee]">
            {recentMasjids.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#8b6f76]">No organizations yet</p>
            ) : recentMasjids.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#550C18]/8 text-sm font-bold text-[#550C18] overflow-hidden">
                  {m.logo ? (
                    <img src={m.logo} alt={m.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    m.name[0]
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#2e0c12]">{m.name}</p>
                  <p className="text-xs text-[#8b6f76]">{[m.city, m.country].filter(Boolean).join(", ") || m.email || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stripe charges */}
        <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#550C18]/8 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-[#2e0c12]">Recent Stripe Payments</h2>
            </div>
            <span className="text-xs text-[#8b6f76]">Last 50 succeeded</span>
          </div>
          {recentCharges.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8b6f76]">No Stripe data</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f5ecee] bg-[#fffafb]">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#8b6f76]">ID</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#8b6f76]">Description</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#8b6f76]">Date</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-[#8b6f76]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5ecee]">
                  {recentCharges.slice(0, 10).map((c) => (
                    <tr key={c.id} className="hover:bg-[#fffafb] transition">
                      <td className="px-5 py-3 font-mono text-xs text-[#8b6f76]">{c.id.slice(0, 18)}…</td>
                      <td className="px-5 py-3 text-[#2e0c12]">{c.description || "—"}</td>
                      <td className="px-5 py-3 text-[#8b6f76]">{fmtDate(c.created)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-emerald-700">{fmt(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
