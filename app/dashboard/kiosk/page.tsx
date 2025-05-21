import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { getProducts } from "@/lib/actions/products";

export default function KioskDashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [configureKiosk, setConfigureKiosk] = useState<any | null>(null);
  const [copiedConfigKioskId, setCopiedConfigKioskId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ productId: "", serial: "", masjidId: masjidId || "" });
  const [savingConfig, setSavingConfig] = useState(false);
  const [addingKiosk, setAddingKiosk] = useState(false);
  const [addErrors, setAddErrors] = useState<any>({});
  const [configErrors, setConfigErrors] = useState<any>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMasjids, setLoadingMasjids] = useState(false);
  const [loadingKiosks, setLoadingKiosks] = useState(false);

  // Fetch products and masjids with loading skeletons
  useEffect(() => {
    setLoadingProducts(true);
    setLoadingMasjids(true);
    Promise.all([
      getProducts().then((products) => setProducts(products)),
      getMasjids().then((masjids) => setMasjids(masjids)),
    ]).finally(() => {
      setLoadingProducts(false);
      setLoadingMasjids(false);
    });
  }, []);

  // Fetch kiosks with loading skeleton
  const fetchKiosks = async () => {
    setLoadingKiosks(true);
    try {
      const res = await fetch(`/api/kiosk-instances?masjidId=${masjidId}`);
      const data = await res.json();
      setKiosks(data);
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
        layout: source.layout,
        color: source.color,
        timeout: source.timeout,
        categories: source.categories,
      });
      setCopiedConfigKioskId(kioskId);
    }
  };

  // Add New Kiosk validation
  const validateAddForm = () => {
    const errors: any = {};
    if (!addForm.productId) errors.productId = "Product is required.";
    if (!addForm.masjidId) errors.masjidId = "Masjid is required.";
    if (!addForm.categories || addForm.categories.length === 0) errors.categories = "Select at least one category.";
    return errors;
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

  // Add new kiosk
  const handleAddKiosk = async () => {
    const errors = validateAddForm();
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setAddingKiosk(true);
    try {
      const res = await fetch("/api/kiosk-instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error("Failed to add kiosk");
      toast({ title: "Kiosk added!", description: "New kiosk registered successfully." });
      setAddDialogOpen(false);
      setAddForm({ productId: "", serial: "", masjidId: masjidId || "" });
      // Refresh kiosks
      fetch(`/api/kiosk-instances?masjidId=${masjidId}`)
        .then((res) => res.json())
        .then((data) => setKiosks(data));
    } catch (err) {
      toast({ title: "Error", description: "Failed to add kiosk", variant: "destructive" });
    } finally {
      setAddingKiosk(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#550C18]">Kiosks</h1>
          <p className="text-[#3A3A3A]/70">Manage your assigned kiosks and view performance</p>
        </div>
        <div className="flex items-center gap-3">
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
          {session?.user?.admin && (
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Kiosk
            </Button>
          )}
        </div>
      </div>
      <Tabs defaultValue="kiosks" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="kiosks">Kiosks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="kiosks">
          <Card className="bg-white border-[#550C18]/10">
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
                  {/* ... existing code ... */}
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
                <div>
                  <Label>Copy Config From</Label>
                  <select
                    className="w-full p-2 border border-[#550C18]/20 rounded"
                    value={copiedConfigKioskId || ""}
                    onChange={(e) => handleCopyConfig(e.target.value)}
                  >
                    <option value="">Select a kiosk...</option>
                    {kiosks.filter((k) => k.id !== configureKiosk?.id).map((k) => (
                      <option key={k.id} value={k.id}>{k.name || k.product?.name || "Kiosk"}</option>
                    ))}
                  </select>
                </div>
                {/* Layout selection */}
                <div>
                  <Label>Layout</Label>
                  <select className={`w-full p-2 border border-[#550C18]/20 rounded ${configErrors.layout ? 'border-red-500' : ''}`} value={configureKiosk?.layout || "default"} onChange={e => setConfigureKiosk({ ...configureKiosk, layout: e.target.value })}>
                    <option value="default">Default</option>
                    <option value="compact">Compact</option>
                    <option value="expanded">Expanded</option>
                  </select>
                  {configErrors.layout && <div className="text-red-500 text-xs">{configErrors.layout}</div>}
                </div>
                {/* Color selection */}
                <div>
                  <Label>Custom Color</Label>
                  <input type="color" className={`w-full h-10 border border-[#550C18]/20 rounded ${configErrors.color ? 'border-red-500' : ''}`} value={configureKiosk?.color || "#550C18"} onChange={e => setConfigureKiosk({ ...configureKiosk, color: e.target.value })} />
                  {configErrors.color && <div className="text-red-500 text-xs">{configErrors.color}</div>}
                </div>
                {/* Timeout */}
                <div>
                  <Label>Screen Timeout (seconds)</Label>
                  <input type="number" className={`w-full p-2 border border-[#550C18]/20 rounded ${configErrors.timeout ? 'border-red-500' : ''}`} min={10} max={600} value={configureKiosk?.timeout || 60} onChange={e => setConfigureKiosk({ ...configureKiosk, timeout: Number(e.target.value) })} />
                  {configErrors.timeout && <div className="text-red-500 text-xs">{configErrors.timeout}</div>}
                </div>
                {/* Donation categories */}
                <div>
                  <Label>Donation Categories</Label>
                  <div className="space-y-2">
                    {donationCategories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={configureKiosk?.categories?.includes(category.id)}
                          onChange={e => {
                            const checked = e.target.checked;
                            setConfigureKiosk({
                              ...configureKiosk,
                              categories: checked
                                ? [...(configureKiosk.categories || []), category.id]
                                : (configureKiosk.categories || []).filter((id: any) => id !== category.id),
                            });
                          }}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                  {configErrors.categories && <div className="text-red-500 text-xs">{configErrors.categories}</div>}
                </div>
              </div>
              <DrawerFooter>
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" onClick={handleSaveConfig} disabled={savingConfig}>
                  {savingConfig ? "Saving..." : "Save"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Add New Kiosk Dialog */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Kiosk</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <Label>Product</Label>
                {loadingProducts ? <Skeleton className="h-10 w-full rounded" /> : (
                  <select
                    className={`w-full p-2 border border-[#550C18]/20 rounded ${addErrors.productId ? 'border-red-500' : ''}`}
                    value={addForm.productId}
                    onChange={e => setAddForm(f => ({ ...f, productId: e.target.value }))}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
                {addErrors.productId && <div className="text-red-500 text-xs">{addErrors.productId}</div>}
                <Label>Serial</Label>
                <input
                  className="w-full p-2 border border-[#550C18]/20 rounded"
                  value={addForm.serial}
                  onChange={e => setAddForm(f => ({ ...f, serial: e.target.value }))}
                  placeholder="Enter serial number (optional)"
                />
                <Label>Assign to Masjid</Label>
                {loadingMasjids ? <Skeleton className="h-10 w-full rounded" /> : (
                  <select
                    className={`w-full p-2 border border-[#550C18]/20 rounded ${addErrors.masjidId ? 'border-red-500' : ''}`}
                    value={addForm.masjidId}
                    onChange={e => setAddForm(f => ({ ...f, masjidId: e.target.value }))}
                  >
                    <option value="">Select masjid...</option>
                    {masjids.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}
                {addErrors.masjidId && <div className="text-red-500 text-xs">{addErrors.masjidId}</div>}
                {/* Initial config fields */}
                <Label>Initial Layout</Label>
                <select className="w-full p-2 border border-[#550C18]/20 rounded" value={addForm.layout || "default"} onChange={e => setAddForm(f => ({ ...f, layout: e.target.value }))}>
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="expanded">Expanded</option>
                </select>
                <Label>Initial Color</Label>
                <input type="color" className="w-full h-10 border border-[#550C18]/20 rounded" value={addForm.color || "#550C18"} onChange={e => setAddForm(f => ({ ...f, color: e.target.value }))} />
                <Label>Initial Timeout (seconds)</Label>
                <input type="number" className="w-full p-2 border border-[#550C18]/20 rounded" min={10} max={600} value={addForm.timeout || 60} onChange={e => setAddForm(f => ({ ...f, timeout: Number(e.target.value) }))} />
                <Label>Initial Donation Categories</Label>
                <div className="space-y-2">
                  {donationCategories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={addForm.categories?.includes(category.id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setAddForm(f => ({
                            ...f,
                            categories: checked
                              ? [...(f.categories || []), category.id]
                              : (f.categories || []).filter((id: any) => id !== category.id),
                          }));
                        }}
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
                {addErrors.categories && <div className="text-red-500 text-xs">{addErrors.categories}</div>}
              </div>
              <DialogFooter>
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" onClick={handleAddKiosk} disabled={addingKiosk}>
                  {addingKiosk ? "Adding..." : "Add Kiosk"}
                </Button>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
} 