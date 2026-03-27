"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Power, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function KioskDashboardPage() {
  const [configureKiosk, setConfigureKiosk] = useState<any | null>(null);
  const [copiedConfigKioskId, setCopiedConfigKioskId] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configErrors, setConfigErrors] = useState<any>({});
  const [loadingKiosks, setLoadingKiosks] = useState(false);
  const [kiosks, setKiosks] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [donationCategories, setDonationCategories] = useState<any[]>([]);
  const masjidId = useSearchParams().get("masjidId") || "";
  const [quickActionsOpen, setQuickActionsOpen] = useState<string | null>(null);
  const [performingAction, setPerformingAction] = useState(false);

  if (!masjidId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-white border border-[#550C18]/10 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#550C18] mb-2">
          Select a Masjid
        </h2>
        <p className="text-[#3A3A3A]/70">
          Choose a masjid to manage kiosk devices.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (masjidId) {
      fetchData();
    }
  }, [masjidId]);

  // Fetch kiosks with loading skeleton
  const fetchData = async () => {
    setLoadingKiosks(true);
    try {
      const [kioskRes, categoriesRes] = await Promise.all([
        fetch(`/api/kiosk-instances?masjidId=${masjidId}`),
        fetch(`/api/donation-categories?masjidId=${masjidId}`),
      ]);
      if (!kioskRes.ok) throw new Error("Failed to fetch kiosks");
      if (!categoriesRes.ok) throw new Error("Failed to fetch donation categories");

      const [kioskData, categoriesData] = await Promise.all([
        kioskRes.json(),
        categoriesRes.json(),
      ]);

      setDonationCategories(categoriesData);
      setKiosks(kioskData);
    } finally {
      setLoadingKiosks(false);
    }
  };

  // Handler to copy config from another kiosk
  const handleCopyConfig = (kioskId: string) => {
    const source = kiosks.find((k) => k.id === kioskId);
    if (source && configureKiosk) {
      setConfigureKiosk({
        ...configureKiosk,
        layout: source.config?.layout || source.layout || "default",
        color: source.config?.color || source.color || "#550C18",
        timeout: source.config?.timeout || source.timeout || 60,
        categories: source.config?.categories || source.categories || [],
      });
      setCopiedConfigKioskId(kioskId);
    }
  };

  // Configure Kiosk validation
  const validateConfigForm = () => {
    const errors: any = {};
    if (!configureKiosk?.layout) errors.layout = "Layout is required.";
    if (!configureKiosk?.color) errors.color = "Color is required.";
    if (!configureKiosk?.timeout) errors.timeout = "Timeout is required.";
    if (!configureKiosk?.categories || configureKiosk.categories.length === 0) errors.categories = "Select at least one category.";
    return errors;
  };

  // Save kiosk config
  const handleSaveConfig = async () => {
    const errors = validateConfigForm();
    setConfigErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!configureKiosk) return;
    setSavingConfig(true);
    try {
      const res = await fetch("/api/kiosk-instances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kioskId: configureKiosk.id, config: {
          layout: configureKiosk.layout,
          color: configureKiosk.color,
          timeout: configureKiosk.timeout,
          categories: configureKiosk.categories,
        } }),
      });
      if (!res.ok) throw new Error("Failed to save config");
      toast({ title: "Kiosk configuration saved!", description: "Kiosk settings updated successfully." });
      setConfigureKiosk(null);
      // Optionally refresh kiosks
      fetch(`/api/kiosk-instances?masjidId=${masjidId}`)
        .then((res) => res.json())
        .then((data) => setKiosks(data));
    } catch (err) {
      toast({ title: "Error", description: "Failed to save kiosk config", variant: "destructive" });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!quickActionsOpen) return;
    setPerformingAction(true);
    try {
      // TODO: Integrate with ManageEngine MDM
      // This is a placeholder for future MDM integration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Action Initiated",
        description: `${action} command sent to kiosk. This may take a few moments to complete.`,
      });
      setQuickActionsOpen(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPerformingAction(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Donation Kiosks
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Manage kiosk devices.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Assign kiosks, keep settings consistent, and track status in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              onClick={() => {
                setIsRefreshing(true);
                fetch(`/api/kiosk-instances?masjidId=${masjidId}`)
                  .then((res) => res.json())
                  .then((data) => setKiosks(data))
                  .finally(() => setIsRefreshing(false));
              }}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </div>
        </div>
      </div>
      <Tabs defaultValue="kiosks" className="w-full">
        <TabsContent value="kiosks">
          <Card className="bg-white border-[#550C18]/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Kiosk Management</CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">View and manage all assigned kiosks</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingKiosks ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded" />
                  ))}
                </div>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4">Name</th>
                      <th className="text-left py-2 px-4">Location</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Last Transaction</th>
                      <th className="text-left py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kiosks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-[#3A3A3A]/70">No kiosks found for this masjid.</td>
                      </tr>
                    ) : (
                      kiosks.map((kiosk) => (
                        <tr key={kiosk.id} className="bg-white border-b border-[#550C18]/10 hover:bg-[#550C18]/5 transition">
                          <td className="py-3 px-4 font-semibold text-[#550C18]">{kiosk.kioskName || kiosk.product?.name || "Kiosk"}</td>
                          <td className="py-3 px-4">{kiosk.location || kiosk.masjid?.name || "-"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${kiosk.status === "online" ? "bg-green-100 text-green-700" : kiosk.status === "offline" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{kiosk.status || "Unknown"}</span>
                          </td>
                          <td className="py-3 px-4">{kiosk.lastTransaction || "-"}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/10"
                              onClick={() =>
                                setConfigureKiosk({
                                  ...kiosk,
                                  ...kiosk.config,
                                  layout: kiosk.config?.layout || "default",
                                  color: kiosk.config?.color || "#550C18",
                                  timeout: kiosk.config?.timeout || 60,
                                  categories: kiosk.config?.categories || [],
                                })
                              }
                            >
                              Configure
                            </Button>
                            <Button size="sm" variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/10" onClick={() => setQuickActionsOpen(kiosk.id)}>Quick Actions</Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Remove</Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Configure Kiosk Drawer */}
          <Drawer open={!!configureKiosk} onOpenChange={(open) => !open && setConfigureKiosk(null)}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Configure Kiosk</DrawerTitle>
                <DrawerDescription>Settings for {configureKiosk?.name || configureKiosk?.product?.name || "Kiosk"}</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                {/* Copy Config From */}
                <div className="space-y-2">
                  <Label htmlFor="copyConfig">Copy Config From</Label>
                  <Select
                    value={copiedConfigKioskId || ""}
                    onValueChange={(value) => handleCopyConfig(value)}
                  >
                    <SelectTrigger id="copyConfig">
                      <SelectValue placeholder="Select a kiosk..." />
                    </SelectTrigger>
                    <SelectContent>
                      {kiosks
                        .filter((k) => k.id !== configureKiosk?.id)
                        .map((k) => (
                          <SelectItem key={k.id} value={k.id}>
                            {k.name || k.product?.name || "Kiosk"}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Layout selection */}
                <div className="space-y-2">
                  <Label htmlFor="layout">Layout</Label>
                  <Select
                    value={configureKiosk?.layout || "default"}
                    onValueChange={(value) => setConfigureKiosk({ ...configureKiosk, layout: value })}
                  >
                    <SelectTrigger id="layout" className={configErrors.layout ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select layout..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="expanded">Expanded</SelectItem>
                    </SelectContent>
                  </Select>
                  {configErrors.layout && (
                    <p className="text-sm text-red-500">{configErrors.layout}</p>
                  )}
                </div>

                {/* Color selection */}
                <div className="space-y-2">
                  <Label htmlFor="color">Custom Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      className={`h-10 w-20 p-1 border border-[#550C18]/20 rounded ${configErrors.color ? 'border-red-500' : ''}`}
                      value={configureKiosk?.color || "#550C18"}
                      onChange={(e) => setConfigureKiosk({ ...configureKiosk, color: e.target.value })}
                    />
                    <Input
                      type="text"
                      value={configureKiosk?.color || "#550C18"}
                      onChange={(e) => setConfigureKiosk({ ...configureKiosk, color: e.target.value })}
                      className="flex-1"
                      placeholder="#550C18"
                    />
                  </div>
                  {configErrors.color && (
                    <p className="text-sm text-red-500">{configErrors.color}</p>
                  )}
                </div>

                {/* Timeout */}
                <div className="space-y-2">
                  <Label htmlFor="timeout">Screen Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min={10}
                    max={600}
                    value={configureKiosk?.timeout || 60}
                    onChange={(e) => setConfigureKiosk({ ...configureKiosk, timeout: Number(e.target.value) })}
                    className={configErrors.timeout ? 'border-red-500' : ''}
                  />
                  {configErrors.timeout && (
                    <p className="text-sm text-red-500">{configErrors.timeout}</p>
                  )}
                </div>

                {/* Donation categories */}
                <div className="space-y-2">
                  <Label>Donation Categories</Label>
                  <div className="space-y-2 border rounded-md p-4">
                    {donationCategories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          className="h-4 w-4 rounded border-gray-300 text-[#550C18] focus:ring-[#550C18]"
                          checked={configureKiosk?.categories?.includes(category.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setConfigureKiosk({
                              ...configureKiosk,
                              categories: checked
                                ? [...(configureKiosk.categories || []), category.id]
                                : (configureKiosk.categories || []).filter((id: any) => id !== category.id),
                            });
                          }}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {configErrors.categories && (
                    <p className="text-sm text-red-500">{configErrors.categories}</p>
                  )}
                </div>
              </div>
              <DrawerFooter>
                <Button 
                  className="bg-[#550C18] hover:bg-[#78001A] text-white" 
                  onClick={handleSaveConfig} 
                  disabled={savingConfig}
                >
                  {savingConfig ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Quick Actions Dialog */}
          <Dialog open={!!quickActionsOpen} onOpenChange={(open) => !open && setQuickActionsOpen(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Quick Actions</DialogTitle>
                <DialogDescription>
                  Perform quick actions on {kiosks.find(k => k.id === quickActionsOpen)?.name || "this kiosk"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleQuickAction("Restart")}
                    disabled={performingAction}
                  >
                    <RefreshCw className="h-6 w-6" />
                    <span>Restart Device</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleQuickAction("Shutdown")}
                    disabled={performingAction}
                  >
                    <Power className="h-6 w-6" />
                    <span>Shutdown</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleQuickAction("Update")}
                    disabled={performingAction}
                  >
                    <Download className="h-6 w-6" />
                    <span>Check for Updates</span>
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setQuickActionsOpen(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
