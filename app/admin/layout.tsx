"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { Package, ShoppingBag, LayoutDashboard, ChevronRight } from "lucide-react";
import { ProgressProvider } from "@bprogress/next/app";

const adminNav = [
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
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
    return <div className="min-h-screen bg-[#f6f0ef]" />;
  }

  return (
    <ProgressProvider height="4px" color="#550C18" options={{ showSpinner: false }} shallowRouting>
      <Toaster />
      <div className="flex min-h-screen bg-[#f6f0ef]">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-[#550C18]/10 bg-white">
          <div className="px-5 py-5 border-b border-[#550C18]/8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#550C18]">Admin</p>
            <p className="mt-0.5 text-xs text-[#8b6f76]">Internal management</p>
          </div>
          <nav className="p-3 space-y-0.5">
            {adminNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#550C18] text-white"
                      : "text-[#6d5560] hover:bg-[#550C18]/5 hover:text-[#2e0c12]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-4 px-5">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#8b6f76] hover:text-[#550C18] transition">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </ProgressProvider>
  );
}
