"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  LayoutDashboard,
  BarChart3,
  Users,
  ChevronRight,
  Shield,
  Building2,
  CreditCard,
  Tv,
  MonitorSpeaker,
} from "lucide-react";
import { ProgressProvider } from "@bprogress/next/app";

const adminNav = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: BarChart3 },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Products", href: "/admin/products", icon: Package },
    ],
  },
  {
    group: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Organizations", href: "/admin/orgs", icon: Building2 },
      { label: "Orgs Stripe", href: "/admin/orgs/stripe", icon: CreditCard },
    ],
  },
  {
    group: "Platform",
    items: [
      { label: "Mizan Stripe", href: "/admin/stripe", icon: CreditCard },
      { label: "Kiosks", href: "/admin/kiosks", icon: MonitorSpeaker },
      { label: "MizanTVs", href: "/admin/mizantvs", icon: Tv },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.push("/signin"); return; }
    if (!session.user?.admin) { router.push("/dashboard"); return; }
  }, [isPending, session, router]);

  if (isPending || !session?.user?.admin) {
    return <div className="min-h-screen bg-[#f9f5f4]" />;
  }

  return (
    <ProgressProvider height="3px" color="#550C18" options={{ showSpinner: false }} shallowRouting>
      <Toaster />
      <div className="flex min-h-screen bg-[#f9f5f4]">
        {/* Sidebar */}
        <aside className="flex w-60 shrink-0 flex-col border-r border-[#550C18]/10 bg-white">
          {/* Logo / brand */}
          <div className="flex items-center gap-3 border-b border-[#550C18]/8 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#550C18] text-white">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2e0c12] leading-none">Mizan Admin</p>
              <p className="mt-0.5 text-xs text-[#8b6f76]">Internal control panel</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {adminNav.map((group) => (
              <div key={group.group}>
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-[#8b6f76]">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-[#550C18] text-white shadow-sm"
                            : "text-[#6d5560] hover:bg-[#550C18]/6 hover:text-[#2e0c12]"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-[#550C18]/8 px-5 py-4 space-y-2">
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
              <div className="h-7 w-7 rounded-full bg-[#550C18]/10 flex items-center justify-center text-xs font-bold text-[#550C18]">
                {session.user.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#2e0c12]">{session.user.name}</p>
                <p className="truncate text-[10px] text-[#8b6f76]">{session.user.email}</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#8b6f76] transition hover:bg-[#550C18]/5 hover:text-[#550C18]"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-10 border-b border-[#550C18]/8 bg-white/90 backdrop-blur-sm px-8 py-4">
            <div className="flex items-center gap-2 text-xs text-[#8b6f76]">
              <Link href="/admin" className="hover:text-[#550C18] transition">Admin</Link>
              {pathname !== "/admin" && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="capitalize text-[#2e0c12] font-medium">
                    {pathname.split("/").filter(Boolean).slice(1).join(" / ")}
                  </span>
                </>
              )}
            </div>
          </header>

          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </ProgressProvider>
  );
}
