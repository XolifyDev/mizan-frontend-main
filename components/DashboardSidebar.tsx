"use client";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
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
  MessageSquare,
  Search,
  Settings,
  Monitor,
  Users,
  FileText,
  Clock,
  DollarSign,
  Building2,
  AlertCircle,
  MapPin,
  Loader2,
  MapIcon as City,
  Map,
  ShoppingBag,
  ChevronDown,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Philosopher } from "next/font/google";
import { Masjid } from "@prisma/client";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { MasjidSwitcher } from "./masjid-switcher";

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
    title: "Orders",
    icon: ShoppingBag,
    path: "/dashboard/orders",
  },
];

const contentNavItems = [
  {
    title: "TV Displays",
    icon: Monitor,
    path: "/dashboard/tv-displays",
  },
  {
    title: "Content Library",
    icon: FileText,
    path: "/dashboard/content-library",
  },
];

const managementNavItems = [
  {
    title: "Users",
    icon: Users,
    path: "/dashboard/users",
  },
  {
    title: "Products",
    icon: ShoppingBag,
    path: "/dashboard/products",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/dashboard/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
];

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] });

export default function DashboardSidebar({
  session,
  isPending,
  children,
  masjid,
  setShowAddMasjidModal,
}: {
  children: React.ReactNode;
  session: any;
  isPending: boolean;
  masjid: Masjid;
  setShowAddMasjidModal: (show: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId");
  const user = session?.user;
  const getCurrentPageTitle = () => {
    const allNavItems = [
      ...mainNavItems,
      ...contentNavItems,
      ...managementNavItems,
    ];
    const currentItem = allNavItems.find((item) => item.path === pathname);
    return currentItem?.title || "Dashboard";
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-white w-full">
        <Sidebar className="border-r border-[#550C18]/10 bg-white z-20">
          <SidebarHeader className="border-b border-[#550C18]/10 px-6 py-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 !m-0"
            >
              <Image src="/mizan.svg" width={27} height={27} alt="Mizan Logo" />
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
                  {mainNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <Link href={item.path + "?masjidId=" + masjidId}>
                        <SidebarMenuButton
                          className={cn(
                            "text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#7c3742]/10 data-[active=true]:text-[#7c3742]"
                          )}
                          isActive={item.path === pathname}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Donations Group */}
            <SidebarGroup>
              <SidebarGroupLabel>Donations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem key="/dashboard/donations/kiosk">
                    <Link
                      href={"/dashboard/donations/kiosk?masjidId=" + masjidId}
                    >
                      <SidebarMenuButton
                        isActive={pathname === "/dashboard/donations/kiosk"}
                        className="text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                      >
                        <CreditCard className="h-5 w-5" />
                        <span>Kiosk</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem key="/dashboard/donations/categories">
                    <Link
                      href={
                        "/dashboard/donations/categories?masjidId=" + masjidId
                      }
                    >
                      <SidebarMenuButton
                        isActive={
                          pathname === "/dashboard/donations/categories"
                        }
                        className="text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                      >
                        <FileText className="h-5 w-5" />
                        <span>Categories</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem key="/dashboard/donations">
                    <Link href={"/dashboard/donations?masjidId=" + masjidId}>
                      <SidebarMenuButton
                        isActive={pathname === "/dashboard/donations"}
                        className="text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                      >
                        <DollarSign className="h-5 w-5" />
                        <span>Donations</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  {/* <SidebarMenuItem key="/dashboard/donations/settings">
                        <Link href="/dashboard/donations/settings" passHref legacyBehavior>
                            <SidebarMenuButton isActive={pathname === "/dashboard/donations/settings"} className="text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]">
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                            </SidebarMenuButton>
                        </Link>
                        </SidebarMenuItem> */}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Content</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {contentNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <Link href={item.path + "?masjidId=" + masjidId}>
                        <SidebarMenuButton
                          className={cn(
                            "text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                          )}
                          isActive={item.path === pathname}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {masjid && masjid.ownerId === session.user.id && (
              <SidebarGroup>
                <SidebarGroupLabel>Masjid Management</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {managementNavItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <Link href={item.path + "?masjidId=" + masjidId}>
                          <SidebarMenuButton
                            className={cn(
                              "text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                            )}
                            isActive={item.path === pathname}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </Link>
                        {item.path === "/dashboard/products" && (
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={
                                  pathname ===
                                  "/dashboard/products/mizan-donations"
                                }
                                className="text-[#3A3A3A] cursor-default hover:cursor-pointer hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                              >
                                <DollarSign className="h-4 w-4" />
                                <span>MizanDonations Kiosk</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={
                                  pathname === "/dashboard/products/manage"
                                }
                                href={
                                  "/dashboard/products/manage?masjidId=" +
                                  masjidId
                                }
                                className="text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                              >
                                <Settings className="h-4 w-4" />
                                <span>Manage Products</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="border-t border-[#550C18]/10 p-4 bg-white/50">
            {session && session.user && (
              <MasjidSwitcher masjids={session.user.masjids || []} activeMasjid={masjid} user={session.user} setShowAddMasjidModal={setShowAddMasjidModal} />
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col w-full">
          <header className="border-b border-[#550C18]/10 bg-white p-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden text-[#3A3A3A]">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <h1 className="text-2xl font-semibold text-[#550C18]">
                {getCurrentPageTitle()}
              </h1>
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
                  src={(session && session.user.image) || undefined}
                />
                <AvatarFallback className="bg-[#550C18] text-[#FDF0D5]">
                  {(session &&
                    session.user?.name?.split(" ")[0]?.charAt(0) +
                      session.user?.name?.split(" ")[1]?.charAt(0)) ||
                    "Loading..."}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
