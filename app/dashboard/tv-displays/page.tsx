"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Monitor,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getAllTVDisplays,
  updateTVDisplay,
  deleteTVDisplay,
  updateDisplayStatus,
} from "@/lib/actions/tvdisplays";
import { getAllContentTemplatesIncludingInactive, toggleContentTemplate } from "@/lib/actions/content-templates";
import type { Content, TVDisplay } from "@/lib/types/display";
import { useWebSocketContext } from "@/components/WebSocketProvider";

export default function TVDisplaysPage() {
  const masjidId = useSearchParams().get("masjidId") || "";
  const [displays, setDisplays] = useState<TVDisplay[]>([]);
  const [templates, setTemplates] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDisplay, setEditingDisplay] = useState<TVDisplay | null>(null);
  const [displayToDelete, setDisplayToDelete] = useState<TVDisplay | null>(null);

  const { isConnected, isConnecting, error: wsError, sendMessage } = useWebSocketContext();

  const fetchData = useCallback(async () => {
    if (!masjidId) return;
    setLoading(true);
    setError(null);
    try {
      const [displayData, templateData] = await Promise.all([
        getAllTVDisplays(masjidId),
        getAllContentTemplatesIncludingInactive(masjidId),
      ]);

      if (!displayData || !templateData) {
        setError("Unauthorized");
        return;
      }

      setDisplays(displayData as TVDisplay[]);
      const convertedTemplates = templateData.map((template: Content) => ({
        ...template,
        zones: Array.isArray(template.zones)
          ? template.zones
          : template.zones
            ? [template.zones]
            : [],
      }));
      setTemplates(convertedTemplates);
    } catch {
      setError("Failed to load TV displays");
    } finally {
      setLoading(false);
    }
  }, [masjidId]);

  useEffect(() => {
    if (!masjidId) return;
    fetchData();
  }, [fetchData, masjidId]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingDisplay) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await updateTVDisplay(editingDisplay.id, {
        name: editingDisplay.name,
        location: editingDisplay.location || "",
        status: editingDisplay.status,
        config: editingDisplay.config,
      });
      if (!updated) throw new Error("Unauthorized");
      setDisplays((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditDialogOpen(false);
      setEditingDisplay(null);
      toast.success("Display updated successfully");
    } catch {
      setError("Failed to update display");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!displayToDelete) return;
    setLoading(true);
    setError(null);
    try {
      await deleteTVDisplay(displayToDelete.id);
      setDisplays((prev) => prev.filter((item) => item.id !== displayToDelete.id));
      setDeleteDialogOpen(false);
      setDisplayToDelete(null);
      toast.success("Display removed");
    } catch {
      setError("Failed to delete display");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (display: TVDisplay) => {
    setLoading(true);
    setError(null);
    try {
      const nextStatus = display.status === "online" ? "offline" : "online";
      const updated = await updateDisplayStatus(display.id, nextStatus);
      if (!updated) throw new Error("Unauthorized");
      setDisplays((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Display status updated");
    } catch {
      setError("Failed to update display status");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplate = async (template: Content) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await toggleContentTemplate(template.id, !template.active);
      if (!updated) throw new Error("Unauthorized");
      setTemplates((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError("Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  const sendDeviceCommand = async (display: TVDisplay, action: "restart" | "stop" | "start") => {
    if (!sendMessage) return;
    try {
      await sendMessage({
        type: "admin_device_control",
        deviceId: display.id,
        action,
        data: {},
      });
      toast.success(`Command sent: ${action}`);
    } catch {
      toast.error("Failed to send device command");
    }
  };

  const stats = useMemo(() => {
    const total = displays.length;
    const online = displays.filter((d) => d.status === "online").length;
    const offline = total - online;
    const templatesActive = templates.filter((t) => t.active).length;
    return { total, online, offline, templatesActive };
  }, [displays, templates]);

  if (!masjidId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-white border border-[#550C18]/10 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#550C18] mb-2">
          Select a Masjid
        </h2>
        <p className="text-[#3A3A3A]/70">
          Choose a masjid to manage display devices.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              TV Displays
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Keep every screen in sync.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Monitor connectivity, push content, and manage MizanTV devices across your masjid.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Displays", value: stats.total },
          { label: "Online", value: stats.online },
          { label: "Offline", value: stats.offline },
          { label: "Active Templates", value: stats.templatesActive },
        ].map((stat) => (
          <Card key={stat.label} className="border-[#550C18]/10 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#3A3A3A]/70">{stat.label}</CardDescription>
              <CardTitle className="text-2xl text-[#2e0c12]">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-[#3A3A3A]/70">
                {stat.label === "Online" ? `${stats.online} connected` : "Updated just now"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#550C18]/10 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-[#2e0c12]">Display Fleet</CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                View live device status and configure each screen.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#3A3A3A]/70">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500" : "bg-red-500"}`} />
                {isConnected ? "Live" : isConnecting ? "Connecting" : "Offline"}
              </div>
              {wsError && <span className="text-red-500">WS Error</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {displays.length === 0 ? (
            <div className="text-center py-12 text-[#3A3A3A]/70">No displays registered yet.</div>
          ) : (
            displays.map((display) => (
              <div
                key={display.id}
                className="rounded-2xl border border-[#550C18]/10 p-4 transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#550C18]/10 text-[#550C18]">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#2e0c12]">{display.name}</h3>
                        <Badge variant="outline" className={display.status === "online" ? "border-green-500 text-green-600" : "border-gray-300 text-gray-500"}>
                          {display.status}
                        </Badge>
                        {display.status === "online" ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-[#3A3A3A]/70">Location: {display.location || "Not set"}</p>
                      {display.lastSeen && (
                        <p className="text-xs text-[#3A3A3A]/60">Last seen: {new Date(display.lastSeen).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/tv-displays/signage-config?masjidId=${masjidId}&displayId=${display.id}`}>
                      <Button variant="outline" size="sm" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                      onClick={() => handleToggleStatus(display)}
                    >
                      {display.status === "online" ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      {display.status === "online" ? "Pause" : "Start"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                      onClick={() => {
                        setEditingDisplay({
                          ...display,
                          config: display.config || { notes: "", autoPower: false },
                        });
                        setEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setDisplayToDelete(display);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {display.platform && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={() => sendDeviceCommand(display, "restart")}
                      >
                        Restart
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-[#550C18]/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-[#2e0c12]">Content Templates</CardTitle>
          <CardDescription className="text-[#3A3A3A]/70">
            Toggle templates that should stay available for displays.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="rounded-2xl border border-[#550C18]/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#2e0c12]">{template.title}</h3>
                  <p className="text-sm text-[#3A3A3A]/70">{template.description || "Template"}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                  onClick={() => handleToggleTemplate(template)}
                >
                  {template.active ? "Disable" : "Enable"}
                </Button>
              </div>
              <div className="mt-2 text-xs text-[#3A3A3A]/60">Type: {template.type}</div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="text-sm text-[#3A3A3A]/70">No templates yet.</div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Display</DialogTitle>
            <DialogDescription>Update display details and notes.</DialogDescription>
          </DialogHeader>
          {editingDisplay && (
            <form onSubmit={handleUpdate} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Display Name</Label>
                <Input id="edit-name" value={editingDisplay.name} onChange={(e) => setEditingDisplay((prev) => prev ? ({ ...prev, name: e.target.value }) : prev)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input id="edit-location" value={editingDisplay.location || ""} onChange={(e) => setEditingDisplay((prev) => prev ? ({ ...prev, location: e.target.value }) : prev)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingDisplay.config?.notes || ""}
                  onChange={(e) =>
                    setEditingDisplay((prev) =>
                      prev
                        ? {
                            ...prev,
                            config: { ...prev.config, notes: e.target.value },
                          }
                        : prev
                    )
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Remove Display</DialogTitle>
            <DialogDescription>
              This will remove the display from your masjid. Devices can re-register later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 text-white" onClick={handleDelete} disabled={loading}>
              Remove Display
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
