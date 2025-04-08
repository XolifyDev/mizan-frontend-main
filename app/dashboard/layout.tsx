"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Philosopher } from "next/font/google";

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  // Navigation items with their paths
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
      title: "Donations",
      icon: DollarSign,
      path: "/dashboard/donations",
    },
  ];

  const contentNavItems = [
    {
      title: "TV Displays",
      icon: Monitor,
      path: "/dashboard/tv-displays",
    },
    {
      title: "Announcements",
      icon: MessageSquare,
      path: "/dashboard/announcements",
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
      title: "Payment Kiosks",
      icon: CreditCard,
      path: "/dashboard/payment-kiosks",
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

  // Get the current page title based on pathname
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
                      <Link href={item.path} passHref legacyBehavior>
                        <SidebarMenuButton
                          className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                          isActive={pathname === item.path}
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

            <SidebarGroup>
              <SidebarGroupLabel>Content</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {contentNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <Link href={item.path} passHref legacyBehavior>
                        <SidebarMenuButton
                          className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                          isActive={pathname === item.path}
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

            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <Link href={item.path} passHref legacyBehavior>
                        <SidebarMenuButton
                          className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                          isActive={pathname === item.path}
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
          </SidebarContent>
          <SidebarFooter className="border-t border-[#550C18]/10 p-4 bg-white/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={(session && session.user.image) || undefined}
                />
                <AvatarFallback className="bg-[#550C18] text-[#FDF0D5]">
                  {(session &&
                    session.user?.name?.split(" ")[0]?.charAt(0) +
                      session.user?.name?.split(" ")[1]?.charAt(0)) ||
                    "MU"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-[#3A3A3A]">
                  {(session && session.user?.name) || "Mizan User"}
                </p>
                <p className="text-xs text-[#3A3A3A]/70">Admin</p>
              </div>
            </div>
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
                    "MU"}
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
