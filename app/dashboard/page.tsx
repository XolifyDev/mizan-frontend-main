"use client"

import { useState } from "react"
import { BarChart3, Bell, Calendar, CreditCard, Home, Menu, MessageSquare, Search, Settings } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard() {
  const [progress, setProgress] = useState(65)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-white">
        <div className="absolute inset-0 bg-white"></div>

        <Sidebar className="sticky top-0 z-10 border-r border-[#550C18]/10 bg-white/80 backdrop-blur-md">
          <SidebarHeader className="border-b border-[#550C18]/10 px-6 py-4 !m-0">
            <div className="flex items-center gap-2 !m-0">
              <div className="h-8 w-8 rounded-full bg-[#550C18] flex items-center justify-center">
                <span className="text-[#FDF0D5] font-bold">M</span>
              </div>
              <h1 className="text-xl font-semibold text-[#550C18] !m-0">Mizan</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5 data-[active=true]:bg-[#550C18]/10 data-[active=true]:text-[#550C18]"
                  isActive
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5">
                  <Calendar className="h-5 w-5" />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5">
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5">
                  <CreditCard className="h-5 w-5" />
                  <span>Payments</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 text-[#3A3A3A] hover:text-[#550C18] hover:bg-[#550C18]/5">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-[#550C18]/10 p-4 bg-white/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-[#550C18] text-[#FDF0D5]">JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-[#3A3A3A]">John Doe</p>
                <p className="text-xs text-[#3A3A3A]/70">Admin</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="relative z-10 flex-1 h-min">
          <header className="border-b border-[#550C18]/10 bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden text-[#3A3A3A]">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <h1 className="text-2xl font-semibold text-[#550C18] !m-0">Dashboard</h1>
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
                      <span className="text-xs text-muted-foreground">2 minutes ago</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">Prayer times updated</span>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">New event scheduled</span>
                      <span className="text-xs text-muted-foreground">Yesterday</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-sm">View all notifications</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-[#550C18] text-[#FDF0D5]">JD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-[#3A3A3A]">Total Donations</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">This month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#550C18]">$12,450</div>
                  <p className="text-xs text-[#3A3A3A]/70 mt-1">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-[#3A3A3A]">Active Users</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">This week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#550C18]">1,245</div>
                  <p className="text-xs text-[#3A3A3A]/70 mt-1">+5% from last week</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-[#3A3A3A]">Events</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">Upcoming</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#550C18]">8</div>
                  <p className="text-xs text-[#3A3A3A]/70 mt-1">Next: Friday Prayer</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-[#3A3A3A]">Prayer Times</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">Today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#550C18]">5</div>
                  <p className="text-xs text-[#3A3A3A]/70 mt-1">Next: Asr 4:30 PM</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white border-[#550C18]/10 col-span-2 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Donation Overview</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">Monthly breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#3A3A3A]">General Fund</span>
                            <span className="text-sm font-medium text-[#3A3A3A]">65%</span>
                          </div>
                          <Progress value={65} className="h-2 bg-[#550C18] bg-opacity-5" indicatorClassName="bg-[#550C18]" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#3A3A3A]">Zakat</span>
                            <span className="text-sm font-medium text-[#3A3A3A]">45%</span>
                          </div>
                          <Progress value={45} className="h-2 bg-[#550C18] bg-opacity-5" indicatorClassName="bg-[#550C18]" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#3A3A3A]">Building Fund</span>
                            <span className="text-sm font-medium text-[#3A3A3A]">80%</span>
                          </div>
                          <Progress value={80} className="h-2 bg-[#550C18] bg-opacity-5" indicatorClassName="bg-[#550C18]" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#3A3A3A]">Education</span>
                            <span className="text-sm font-medium text-[#3A3A3A]">30%</span>
                          </div>
                          <Progress value={30} className="h-2 bg-[#550C18] bg-opacity-5" indicatorClassName="bg-[#550C18]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#550C18]/10 row-span-2 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Upcoming Events</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">Next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b border-[#550C18]/10">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                        <span className="text-xs font-medium">FRI</span>
                        <span className="text-lg font-bold">15</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#3A3A3A]">Friday Prayer</p>
                        <p className="text-sm text-[#3A3A3A]/70">1:30 PM - 2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b border-[#550C18]/10">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                        <span className="text-xs font-medium">SAT</span>
                        <span className="text-lg font-bold">16</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#3A3A3A]">Quran Study</p>
                        <p className="text-sm text-[#3A3A3A]/70">10:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b border-[#550C18]/10">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                        <span className="text-xs font-medium">SUN</span>
                        <span className="text-lg font-bold">17</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#3A3A3A]">Community Iftar</p>
                        <p className="text-sm text-[#3A3A3A]/70">7:30 PM - 9:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                        <span className="text-xs font-medium">MON</span>
                        <span className="text-lg font-bold">18</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#3A3A3A]">Youth Program</p>
                        <p className="text-sm text-[#3A3A3A]/70">6:00 PM - 8:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#550C18]/10 col-span-2 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Recent Donations</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">Last 5 transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#550C18]/10">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">AH</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#3A3A3A]">Ahmed Hassan</p>
                          <p className="text-xs text-[#3A3A3A]/70">General Fund</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#550C18]">$100.00</p>
                        <p className="text-xs text-[#3A3A3A]/70">Today, 10:30 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#550C18]/10">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">SA</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#3A3A3A]">Sarah Ali</p>
                          <p className="text-xs text-[#3A3A3A]/70">Zakat</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#550C18]">$250.00</p>
                        <p className="text-xs text-[#3A3A3A]/70">Yesterday, 3:45 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#550C18]/10">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">MK</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#3A3A3A]">Mohammed Khan</p>
                          <p className="text-xs text-[#3A3A3A]/70">Building Fund</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#550C18]">$500.00</p>
                        <p className="text-xs text-[#3A3A3A]/70">Yesterday, 1:20 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#550C18]/10">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">FQ</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#3A3A3A]">Fatima Qureshi</p>
                          <p className="text-xs text-[#3A3A3A]/70">Education</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#550C18]">$150.00</p>
                        <p className="text-xs text-[#3A3A3A]/70">2 days ago, 9:15 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">YA</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#3A3A3A]">Yusuf Abdullah</p>
                          <p className="text-xs text-[#3A3A3A]/70">General Fund</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#550C18]">$75.00</p>
                        <p className="text-xs text-[#3A3A3A]/70">2 days ago, 5:30 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

