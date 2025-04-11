"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Building2,
  AlertCircle,
  MapPin,
  Loader2,
  MapIcon as City,
  Map
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Philosopher } from "next/font/google";
import { Masjid } from "@prisma/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { createMasjid, getUserMasjid } from "@/lib/actions/masjid";
import { toast } from "@/components/ui/use-toast";

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] });

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Masjid name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  state: z.string().min(2, {
    message: "State is required.",
  }),
  zipCode: z.string().min(5, {
    message: "Zip code must be at least 5 characters.",
  }),
  country: z.string().min(2, {
    message: "Country is required.",
  }),
  description: z.string().optional(),
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loadingMasjid, setLoadingMasjid] = useState(true);
  const [masjidCreatedStep, setMasjidCreationStep] = useState<number>(0);
  const [isLoading, setLoading] = useState(false);
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      description: "",
    },
  })

  useEffect(() => {
    const fetchMasjid = async () => {
      const userMasjid = await getUserMasjid();

      setMasjid(userMasjid as Masjid);
      setLoadingMasjid(false)
    };

    fetchMasjid();
  }, [])
  if (isPending || loadingMasjid) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
      </div>
    </div>
  );

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    const masjid = await createMasjid({
      ...values
    });

    if(!masjid || masjid.error) return toast({
      title: "Error",
      description: masjid?.message || "There was an error creating the masjid. Please try again!",
      variant: "destructive",
    });

    router.refresh();
    toast({
      title: `${values.name} was created!`,
      description: "Your masjid was created. You may purchase products/configure your masjid!",
      variant: "default",
    });
  }

  async function onClose() {

  }

  return (
    <>
      {!masjid && (
        <AlertDialog defaultOpen>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          {masjidCreatedStep === 1 && (
            <AlertDialogContent className="sm:max-w-[600px] p-0 border-0 rounded-lg overflow-hidden">
            <div className="bg-[#550C18] text-white p-6">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-6 w-6" />
                <AlertDialogTitle className="text-2xl font-bold">Create New Masjid</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-white/80">
                Fill in the details below to create a new masjid in your account.
              </AlertDialogDescription>
            </div>

            <div className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#550C18]" />
                          Masjid Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter masjid name"
                            {...field}
                            className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-[#550C18]" />
                            Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Main St"
                              {...field}
                              className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <City className="h-4 w-4 text-[#550C18]" />
                            City
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City"
                              {...field}
                              className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            {/* @ts-ignore Ignore */}
                            <Map className="h-4 w-4 text-[#550C18]" />
                            State
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="State"
                              {...field}
                              className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#550C18]" />
                            Zip Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Zip Code"
                              {...field}
                              className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#550C18]" />
                          Country
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-[#550C18]/20 focus:ring-[#550C18]">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of your masjid"
                            className="resize-none border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AlertDialogFooter className="pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Masjid"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </form>
              </Form>
            </div>
          </AlertDialogContent>
          )}
          {masjidCreatedStep === 0 && (
            <AlertDialogContent>
              <div className="flex flex-col items-center text-center pb-2">
                <div className="h-16 w-16 rounded-full bg-[#550C18]/10 flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-[#550C18]" />
                </div>
                <AlertDialogHeader className="mb-2">
                  <AlertDialogTitle className="text-2xl font-bold text-[#550C18]">No Masjid Setup</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="flex items-start gap-2 bg-red-50 p-4 rounded-md mb-6 text-left">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm text-center">
                    To move forward you must create a masjid under your account first. Or be added to an organization.
                  </p>
                </div>
                <Button
                  onClick={() => setMasjidCreationStep(1)}
                  className="bg-[#550C18] hover:bg-[#78001A] text-white text-base font-medium rounded-md transition-all duration-200 hover:shadow-md"
                >
                  Create Masjid
                </Button>
              </div>
            </AlertDialogContent>
          )}
        </AlertDialog>
      )}
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
                <SidebarGroupLabel>Masjid Management</SidebarGroupLabel>
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
                    src={(masjid && masjid.logo) || undefined}
                  />
                  <AvatarFallback className="bg-[#550C18] text-[#FDF0D5]">
                    {masjid?.name || "Masjid"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-lg font-medium text-[#3A3A3A]">
                    {masjid?.name || "Masjid"}
                  </p>
                  <p className="text-xs text-[#3A3A3A]/70 font-bold">Admin</p>
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
    </>
  );
}
