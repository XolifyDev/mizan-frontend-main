"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation"
import { DollarSign, Settings, CreditCard, Users, Bell } from "lucide-react"

export default function MizanDonationsPage() {
  const searchParams = useSearchParams()
  const masjidId = searchParams.get("masjidId") || ""
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">MizanDonations Kiosk</h2>
          <p className="text-[#3A3A3A]/70">
            Configure and customize your donation kiosk settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          >
            <Bell className="mr-2 h-4 w-4" />
            View Activity
          </Button>
          <Button 
            className="bg-[#550C18] hover:bg-[#78001A] text-white"
          >
            <Settings className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic kiosk settings and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kiosk Name</Label>
                <Input placeholder="Main Entrance Kiosk" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Main Entrance" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Kiosk</Label>
                  <p className="text-sm text-[#3A3A3A]/70">
                    Allow donations through this kiosk
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Donation Settings</CardTitle>
              <CardDescription>
                Configure donation options and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Donation Amounts</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="$5" />
                  <Input placeholder="$10" />
                  <Input placeholder="$20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum Donation</Label>
                <Input placeholder="$1" />
              </div>
              <div className="space-y-2">
                <Label>Maximum Donation</Label>
                <Input placeholder="$1000" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Custom Amounts</Label>
                  <p className="text-sm text-[#3A3A3A]/70">
                    Let donors enter custom donation amounts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize the kiosk's appearance and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Input placeholder="Welcome to our Masjid" />
              </div>
              <div className="space-y-2">
                <Label>Thank You Message</Label>
                <Input placeholder="Thank you for your donation" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Prayer Times</Label>
                  <p className="text-sm text-[#3A3A3A]/70">
                    Display current prayer times on the kiosk
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Connect with payment processors and other services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stripe API Key</Label>
                <Input type="password" placeholder="sk_test_..." />
              </div>
              <div className="space-y-2">
                <Label>Google Calendar ID</Label>
                <Input placeholder="Enter Google Calendar ID" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Receipts</Label>
                  <p className="text-sm text-[#3A3A3A]/70">
                    Send email receipts to donors
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 