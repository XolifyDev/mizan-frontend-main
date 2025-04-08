"use client";

import { useState } from "react";
import {
  Plus,
  Settings,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

export default function PaymentKiosksPage() {
  const { data: session, isPending } = authClient.useSession();
  const [activeKiosks, setActiveKiosks] = useState(2);
  const [totalKiosks, setTotalKiosks] = useState(3);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const kiosks = [
    {
      id: 1,
      name: "Main Entrance Kiosk",
      location: "Main Lobby",
      status: "online",
      lastTransaction: "Today, 10:30 AM",
      lastUpdated: "5 minutes ago",
      totalTransactions: 156,
      totalAmount: 12450.75,
    },
    {
      id: 2,
      name: "Sisters Section Kiosk",
      location: "Sisters Entrance",
      status: "online",
      lastTransaction: "Today, 9:15 AM",
      lastUpdated: "10 minutes ago",
      totalTransactions: 89,
      totalAmount: 7825.5,
    },
    {
      id: 3,
      name: "Community Hall Kiosk",
      location: "Community Hall",
      status: "offline",
      lastTransaction: "Yesterday, 8:45 PM",
      lastUpdated: "2 hours ago",
      totalTransactions: 112,
      totalAmount: 9340.25,
    },
  ];

  const donationCategories = [
    {
      id: 1,
      name: "General Fund",
      description: "General donations for masjid operations",
      active: true,
      defaultAmounts: [10, 25, 50, 100],
    },
    {
      id: 2,
      name: "Building Fund",
      description: "Donations for building expansion and maintenance",
      active: true,
      defaultAmounts: [50, 100, 250, 500],
    },
    {
      id: 3,
      name: "Zakat",
      description: "Zakat donations for distribution to those in need",
      active: true,
      defaultAmounts: [25, 50, 100, 250],
    },
    {
      id: 4,
      name: "Education Programs",
      description: "Support for educational programs and classes",
      active: false,
      defaultAmounts: [20, 50, 100, 200],
    },
    {
      id: 5,
      name: "Sadaqah",
      description: "Voluntary charity for community support",
      active: true,
      defaultAmounts: [5, 10, 25, 50],
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>
        );
      case "offline":
        return <Badge className="bg-red-500 hover:bg-red-600">Offline</Badge>;
      case "maintenance":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Maintenance
          </Badge>
        );
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>;
    }
  };

  if (isPending) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#550C18]">Payment Kiosks</h1>
          <p className="text-[#3A3A3A]/70">
            Manage your donation kiosks and payment settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh Status
          </Button>
          <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add New Kiosk
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Kiosks
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              All devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {totalKiosks}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Active Kiosks
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Currently online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {activeKiosks}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              {Math.round((activeKiosks / totalKiosks) * 100)}% operational
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Transactions
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">357</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Revenue
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              From kiosks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">$29,616</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kiosks" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="kiosks">Kiosks</TabsTrigger>
          <TabsTrigger value="categories">Donation Categories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="kiosks">
          <Card className="bg-white border-[#550C18]/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Kiosk Management
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                View and manage all payment kiosks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Transaction</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kiosks.map((kiosk) => (
                    <TableRow key={kiosk.id}>
                      <TableCell className="font-medium">
                        {kiosk.name}
                      </TableCell>
                      <TableCell>{kiosk.location}</TableCell>
                      <TableCell>{getStatusBadge(kiosk.status)}</TableCell>
                      <TableCell>{kiosk.lastTransaction}</TableCell>
                      <TableCell>{kiosk.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Refresh Status
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Power className="mr-2 h-4 w-4" />
                              {kiosk.status === "online"
                                ? "Restart"
                                : "Power On"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-[#550C18]/10 pt-4">
              <div className="text-sm text-[#3A3A3A]/70">
                Showing {kiosks.length} kiosks
              </div>
              <Button
                variant="outline"
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                View Transaction History
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white border-[#550C18]/10 mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Kiosk Performance
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Transaction volume by kiosk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {kiosks.map((kiosk) => (
                  <div key={`perf-${kiosk.id}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#3A3A3A]">
                          {kiosk.name}
                        </p>
                        <p className="text-sm text-[#3A3A3A]/70">
                          {kiosk.totalTransactions} transactions · $
                          {kiosk.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(kiosk.status)}
                    </div>
                    <Progress
                      value={(kiosk.totalTransactions / 200) * 100}
                      className="h-2 bg-[#550C18] bg-opacity-5"
                      indicatorClassName="bg-[#550C18]"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="bg-white border-[#550C18]/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Donation Categories
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Manage donation categories displayed on kiosks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Default Amounts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donationCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {category.defaultAmounts.map((amount, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-[#550C18]/20 text-[#550C18]"
                            >
                              ${amount}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.active ? (
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span>Inactive</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {category.active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-[#550C18]/10 pt-4">
              <div className="text-sm text-[#3A3A3A]/70">
                Showing {donationCategories.length} categories
              </div>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-white border-[#550C18]/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Kiosk Settings
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Configure global settings for all kiosks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#3A3A3A]">
                    General Settings
                  </h3>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="receipt-email">
                          Send Receipt Emails
                        </Label>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Send email receipts for donations
                        </p>
                      </div>
                      <Switch id="receipt-email" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="custom-amounts">
                          Allow Custom Amounts
                        </Label>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Let donors enter custom donation amounts
                        </p>
                      </div>
                      <Switch id="custom-amounts" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="recurring">
                          Enable Recurring Donations
                        </Label>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Allow donors to set up recurring donations
                        </p>
                      </div>
                      <Switch id="recurring" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="idle-timeout">Screen Timeout</Label>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Return to home screen after inactivity
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Input
                          id="idle-timeout"
                          type="number"
                          defaultValue="60"
                          className="w-20 mr-2 border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                        />
                        <span className="text-sm text-[#3A3A3A]/70">
                          seconds
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#3A3A3A]">
                    Payment Processing
                  </h3>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="payment-gateway">Payment Gateway</Label>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Select your payment processor
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          id="payment-gateway"
                          className="rounded-md border border-[#550C18]/20 px-3 py-2 text-sm focus:border-[#550C18] focus:ring-[#550C18]"
                          defaultValue="stripe"
                        >
                          <option value="stripe">Stripe</option>
                          <option value="paypal">PayPal</option>
                          <option value="square">Square</option>
                          <option value="authorize">Authorize.net</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="payment-methods">Payment Methods</Label>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Select accepted payment methods
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="credit-card"
                            defaultChecked
                            className="rounded border-[#550C18]/20 text-[#550C18] focus:ring-[#550C18]"
                          />
                          <Label htmlFor="credit-card" className="text-sm">
                            Credit Card
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="apple-pay"
                            defaultChecked
                            className="rounded border-[#550C18]/20 text-[#550C18] focus:ring-[#550C18]"
                          />
                          <Label htmlFor="apple-pay" className="text-sm">
                            Apple Pay
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="google-pay"
                            defaultChecked
                            className="rounded border-[#550C18]/20 text-[#550C18] focus:ring-[#550C18]"
                          />
                          <Label htmlFor="google-pay" className="text-sm">
                            Google Pay
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#3A3A3A]">
                    Appearance
                  </h3>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="logo">Display Logo</Label>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Show masjid logo on kiosk screens
                        </p>
                      </div>
                      <Switch id="logo" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="theme">Kiosk Theme</Label>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Select visual theme for kiosks
                        </p>
                      </div>
                      <select
                        id="theme"
                        className="rounded-md border border-[#550C18]/20 px-3 py-2 text-sm focus:border-[#550C18] focus:ring-[#550C18]"
                        defaultValue="default"
                      >
                        <option value="default">Default</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="ramadan">Ramadan Special</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-[#550C18]/10 pt-4">
              <Button
                variant="outline"
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                Cancel
              </Button>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white border-[#550C18]/10 mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                System Status
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Payment system status and connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[#550C18]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Payment Gateway
                      </p>
                      <p className="text-sm text-[#3A3A3A]/70">
                        Stripe API is operational
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Connected
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#550C18]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Receipt System
                      </p>
                      <p className="text-sm text-[#3A3A3A]/70">
                        Email service is operational
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Connected
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#550C18]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Kiosk Network
                      </p>
                      <p className="text-sm text-[#3A3A3A]/70">
                        1 kiosk offline
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    Warning
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#550C18]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Database Connection
                      </p>
                      <p className="text-sm text-[#3A3A3A]/70">
                        Database is operational
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Connected
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-[#550C18]/10 pt-4">
              <Button
                variant="outline"
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                <DollarSign className="mr-2 h-4 w-4" />
                Test Payment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
