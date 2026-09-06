"use client";
import { useState, useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  Home,
  Menu,
  Search,
  Settings,
  Users,
  FileText,
  Clock,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Philosopher } from "next/font/google";
import { Masjid } from "@prisma/client";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { MasjidSwitcher } from "./masjid-switcher";
import { canAccessGroup, canAccessPath, getEffectiveRole } from "@/lib/permissions";
import { isPathLocked } from "@/lib/plan";
import { roleCanAccess } from "@/lib/masjid-roles";

const mainNavItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    title: "Prayer Times",
    icon: Clock,
    path: "/dashboard/prayer-times",
  },
  {
    title: "Events",
    icon: Calendar,
    path: "/dashboard/events",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/dashboard/analytics",
  },
];

const contentNavItems = [
  {
    title: "Signage",
    icon: FileText,
    path: "/dashboard/signage",
  },
];

const managementNavItems = [
  {
    title: "Users",
    icon: Users,
    path: "/dashboard/users",
  },
  {
    title: "Billing",
    icon: CreditCard,
    path: "/dashboard/billing",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
];

/** Small "PRO" chip shown beside locked nav items. */
function ProBadge() {
  return (
    <span className="ml-auto rounded-full bg-gradient-to-r from-[#550C18] to-[#78001A] px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wider text-white">
      Pro
    </span>
  );
}

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] });

type SidebarSession = {
  user?: {
    id?: string | null;
    name?: string | null;
    image?: string | null;
    role?: string | null;
    admin?: boolean | null;
    masjids?: Masjid[];
  } | null;
} | null;

export default function DashboardSidebar({
  session,
  children,
  masjid,
  setShowAddMasjidModal,
}: {
  children: React.ReactNode;
  session: SidebarSession;
  isPending: boolean;
  masjid: Masjid;
  setShowAddMasjidModal: (show: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId");
  const user = session?.user;
  const masjidQuery = masjidId ? `?masjidId=${masjidId}` : "";
  const [hasPendingOrder, setHasPendingOrder] = useState(false);

  useEffect(() => {
    fetch("/api/orders/pending")
      .then((r) => r.ok ? r.json() : { pending: false })
      .then((d) => setHasPendingOrder(Boolean(d.pending)))
      .catch(() => {});
  }, []);

  // Per-masjid role. Falls back to the legacy global role below until every
  // membership has a MasjidMember row.
  const [masjidRole, setMasjidRole] = useState<string | null>(null);
  useEffect(() => {
    if (!masjidId) return;
    fetch(`/api/masjids/${masjidId}/role`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMasjidRole(d?.role ?? null))
      .catch(() => {});
  }, [masjidId]);
  const effectiveRole = getEffectiveRole({
    role: user?.role,
    isOwner: masjid?.ownerId === user?.id,
    isAdmin: Boolean(user?.admin),
  });

  const plan = (masjid as any)?.plan as string | undefined;

  /**
   * Renders one nav row. Pro routes on a Free masjid render as a non-link with
   * a PRO chip; clicking is a no-op and the destination is blocked server-side
   * regardless.
   */
  const renderNavItem = (item: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
  }) => {
    // Role check first: a route the role can't reach is hidden entirely rather
    // than shown as an upsell, since upgrading wouldn't grant access.
    if (masjidRole && !roleCanAccess(item.path, masjidRole)) return null;

    const locked = isPathLocked(item.path, plan);
    const Icon = item.icon;

    const button = (
      <SidebarMenuButton
        className={cn(
          "text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#7c3742]/10 data-[active=true]:text-[#7c3742]",
          locked && "cursor-not-allowed opacity-55 hover:bg-transparent hover:text-[#3A3A3A]"
        )}
        isActive={!locked && item.path === pathname}
        aria-disabled={locked || undefined}
        title={locked ? `${item.title} is available on the Pro plan` : undefined}
      >
        <Icon className="h-5 w-5" />
        <span>{item.title}</span>
        {locked && <ProBadge />}
        {!locked && item.path === "/dashboard/billing" && hasPendingOrder && (
          <span className="ml-auto flex h-2 w-2 rounded-full bg-amber-500" />
        )}
      </SidebarMenuButton>
    );

    return (
      <SidebarMenuItem key={item.path}>
        {locked ? (
          <Link
            href={`/dashboard/billing${masjidQuery}`}
            aria-label={`${item.title} — upgrade to Pro`}
          >
            {button}
          </Link>
        ) : (
          <Link href={`${item.path}${masjidQuery}`}>{button}</Link>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-white w-full">
        <Sidebar className="border-r border-[#550C18]/10 bg-white z-20">
          <SidebarHeader className="border-b border-[#550C18]/8 px-5 h-16 flex justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 !m-0"
            >
              <Image src="/mizan.svg" width={28} height={28} alt="Mizan Logo" />
              <h1
                className={`text-3xl font-semibold text-[#550C18] !m-0 ${philosopher.className}`}
              >
                Mizan
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavItems
                    .filter((item) =>
                      canAccessPath(item.path, {
                        role: effectiveRole,
                        isOwner: masjid?.ownerId === user?.id,
                        isAdmin: Boolean(user?.admin),
                      })
                    )
                    .map((item) => renderNavItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Donations Group */}
            {canAccessGroup("donations", {
              role: effectiveRole,
              isOwner: masjid?.ownerId === user?.id,
              isAdmin: Boolean(user?.admin),
            }) && (
              <SidebarGroup>
                <SidebarGroupLabel>Donations</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {[
                      { title: "Kiosk", icon: CreditCard, path: "/dashboard/donations/kiosk" },
                      { title: "Categories", icon: FileText, path: "/dashboard/donations/categories" },
                      { title: "Donations", icon: DollarSign, path: "/dashboard/donations" },
                    ].map((item) => renderNavItem(item))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {canAccessGroup("content", {
              role: effectiveRole,
              isOwner: masjid?.ownerId === user?.id,
              isAdmin: Boolean(user?.admin),
            }) && (
              <SidebarGroup>
                <SidebarGroupLabel>Content</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {contentNavItems.map((item) => renderNavItem(item))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {canAccessGroup("management", {
              role: effectiveRole,
              isOwner: masjid?.ownerId === user?.id,
              isAdmin: Boolean(user?.admin),
            }) && (
              <SidebarGroup>
                <SidebarGroupLabel>Masjid Management</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {managementNavItems.map((item) => renderNavItem(item))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        <main className="flex min-h-screen w-full flex-col overflow-hidden bg-[#faf7f5]">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#550C18]/8 bg-white px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden text-[#3A3A3A]">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <div className="flex flex-row items-center gap-1 justify-starts">
                <div className="flex flex-row items-center">
                  Welcome,&nbsp;<span className="font-medium text-[#550C18]">{session?.user?.name || "User"}</span>
                </div>
                <div className="text-[#3A3A3A]/70 mx-2">
                  |
                </div>
                {session?.user && (
                  <MasjidSwitcher masjids={session.user.masjids || []} activeMasjid={masjid} setShowAddMasjidModal={setShowAddMasjidModal} />
                )}
              </div>
              {/* <h1 className="text-2xl font-semibold text-[#550C18]">
                {getCurrentPageTitle()}
              </h1> */}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-[200px] lg:w-[300px] bg-white/50 border-[#550C18]/10 focus:border-[#550C18] focus:ring-[#550C18]"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative border-[#550C18]/20 text-[#3A3A3A] hover:bg-[#550C18]/5 hover:text-[#550C18]"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#550C18] text-[10px] text-white flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">New donation received</span>
                      <span className="text-xs text-muted-foreground">
                        2 minutes ago
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">Prayer times updated</span>
                      <span className="text-xs text-muted-foreground">
                        1 hour ago
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">New event scheduled</span>
                      <span className="text-xs text-muted-foreground">
                        Yesterday
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-sm">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Avatar>
                <AvatarImage
                  src={session?.user?.image || undefined}
                />
                <AvatarFallback className="bg-[#550C18] text-[#FDF0D5]">
                  {session?.user?.name
                    ?.split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part.charAt(0))
                    .join("")
                    .toUpperCase() || "MI"}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <div className="flex-1 overflow-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
