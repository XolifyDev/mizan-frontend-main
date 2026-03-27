"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  EyeOff,
  FileIcon,
  FileText,
  Globe,
  ImageIcon,
  Megaphone,
  Monitor,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash,
  Wifi,
  WifiOff,
} from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWebSocketContext } from "@/components/WebSocketProvider";
import {
  deleteTVDisplay,
  getAllTVDisplays,
  updateDisplayStatus,
  updateTVDisplay,
} from "@/lib/actions/tvdisplays";
import {
  deleteContent,
  getAllContent,
  updateContent,
} from "@/lib/actions/content";
import {
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/actions/announcements";
import { getAllAnnouncements } from "@/lib/actions/content";
import { getAllContentTemplatesIncludingInactive, toggleContentTemplate } from "@/lib/actions/content-templates";
import { toast } from "sonner";
import type { Content, TVDisplay } from "@/lib/types/display";

type ContentItem = {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string | Date;
  active: boolean;
  zones?: string[];
  data?: Record<string, unknown>;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  active: boolean;
  zones: string[];
  startDate: string | Date | null;
  endDate: string | Date | null;
};

type SignageDisplay = TVDisplay & {
  assignedContentId?: string | null;
  platform?: string | null;
  config?: Record<string, unknown> | null;
  lastSeen?: string | Date | null;
  location?: string | null;
};

const CONTENT_TYPES = [
  { type: "announcement", title: "Announcement" },
  { type: "image", title: "Image" },
  { type: "predesigned", title: "Pre-Designed Image" },
  { type: "website", title: "Website" },
  { type: "google_calendar", title: "Google Calendar" },
  { type: "daily_verse", title: "Daily Verse" },
  { type: "daily_hadith", title: "Daily Hadith" },
  { type: "daily_dua", title: "Daily Dua" },
  { type: "ramadan_countdown", title: "Ramadan Countdown" },
  { type: "eid_countdown", title: "Eid Countdown" },
  { type: "days_countdown", title: "Days Countdown" },
  { type: "taraweeh_timings", title: "Taraweeh Timings" },
];

const WIDGET_TYPES = new Set([
  "google_calendar",
  "daily_verse",
  "daily_hadith",
  "daily_dua",
  "ramadan_countdown",
  "eid_countdown",
  "days_countdown",
  "taraweeh_timings",
]);

const normalizeZones = (zones: unknown): string[] => {
  if (Array.isArray(zones)) return zones.filter(Boolean) as string[];
  if (typeof zones === "string" && zones.startsWith("[")) {
    try {
      const parsed = JSON.parse(zones);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  if (typeof zones === "string" && zones) return [zones];
  return [];
};

const getTypeMeta = (type: string) => {
  switch (type) {
    case "announcement":
      return {
        icon: Megaphone,
        label: "Announcement",
        tone: "from-[#550C18] to-[#7d1930] text-white",
      };
    case "image":
    case "predesigned":
      return {
        icon: ImageIcon,
        label: "Image Slide",
        tone: "from-[#f5ecef] to-white text-[#550C18]",
      };
    case "website":
      return {
        icon: Globe,
        label: "Website",
        tone: "from-[#f9f4f5] to-white text-[#550C18]",
      };
    default:
      return {
        icon: Sparkles,
        label: "Widget",
        tone: "from-[#f6eef0] to-[#fffdfd] text-[#550C18]",
      };
  }
};

export default function SignagePage() {
  const masjidId = useSearchParams().get("masjidId") || "";

  const [displays, setDisplays] = useState<SignageDisplay[]>([]);
  const [templates, setTemplates] = useState<Content[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDisplay, setEditingDisplay] = useState<SignageDisplay | null>(null);
  const [displayToDelete, setDisplayToDelete] = useState<SignageDisplay | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [contentStatusFilter, setContentStatusFilter] = useState("all");
  const [libraryView, setLibraryView] = useState<"content" | "announcements">("content");
  const [assetFilter, setAssetFilter] = useState<"all" | "slides" | "videos" | "widgets">("all");

  const { isConnected, isConnecting, error: wsError, sendMessage } = useWebSocketContext();

  const fetchData = useCallback(async () => {
    if (!masjidId) return;
    setLoading(true);
    setError(null);

    try {
      const [
        displayData,
        templateData,
        contentData,
        announcementData,
      ] = await Promise.all([
        getAllTVDisplays(masjidId),
        getAllContentTemplatesIncludingInactive(masjidId),
        getAllContent(masjidId),
        getAllAnnouncements(masjidId),
      ]);

      if (!displayData || !templateData || !contentData) {
        setError("Unauthorized");
        return;
      }

      setDisplays(displayData as SignageDisplay[]);
      setTemplates(
        templateData.map((template: Content) => ({
          ...template,
          zones: normalizeZones(template.zones),
        }))
      );
      setContentItems(
        contentData.map((item: ContentItem & { zones?: unknown }) => ({
          ...item,
          zones: normalizeZones(item.zones),
        }))
      );
      setAnnouncements(
        (announcementData || []).map(
          (item: AnnouncementItem & { zones?: unknown }) => ({
          ...item,
          zones: normalizeZones(item.zones),
        }))
      );
    } catch {
      setError("Failed to load signage data");
    } finally {
      setLoading(false);
    }
  }, [masjidId]);

  useEffect(() => {
    if (!masjidId) return;
    fetchData();
  }, [fetchData, masjidId]);

  const handleUpdateDisplay = async (event: React.FormEvent) => {
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

      setDisplays((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditDialogOpen(false);
      setEditingDisplay(null);
      toast.success("Display updated successfully");
    } catch {
      setError("Failed to update display");
      toast.error("Failed to update display");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDisplay = async () => {
    if (!displayToDelete) return;

    setLoading(true);
    setError(null);

    try {
      await deleteTVDisplay(displayToDelete.id);
      setDisplays((prev) =>
        prev.filter((item) => item.id !== displayToDelete.id)
      );
      setDeleteDialogOpen(false);
      setDisplayToDelete(null);
      toast.success("Display removed");
    } catch {
      setError("Failed to delete display");
      toast.error("Failed to delete display");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisplayStatus = async (display: SignageDisplay) => {
    setLoading(true);
    setError(null);

    try {
      const nextStatus = display.status === "online" ? "offline" : "online";
      const updated = await updateDisplayStatus(display.id, nextStatus);
      if (!updated) throw new Error("Unauthorized");

      setDisplays((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success("Display status updated");
    } catch {
      setError("Failed to update display status");
      toast.error("Failed to update display status");
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

      setTemplates((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success("Template updated");
    } catch {
      setError("Failed to update template");
      toast.error("Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    setLoading(true);
    try {
      await deleteContent(id);
      setContentItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Content deleted");
    } catch {
      setError("Failed to delete content");
      toast.error("Failed to delete content");
    } finally {
      setLoading(false);
    }
  };

  const handleHideContent = async (id: string, active: boolean) => {
    setLoading(true);
    try {
      await updateContent(id, { active });
      setContentItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, active } : item))
      );
      toast.success(active ? "Content published" : "Content hidden");
    } catch {
      setError("Failed to update content");
      toast.error("Failed to update content");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setLoading(true);
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
      toast.success("Announcement deleted");
    } catch {
      setError("Failed to delete announcement");
      toast.error("Failed to delete announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleHideAnnouncement = async (id: string, active: boolean) => {
    setLoading(true);
    try {
      await updateAnnouncement(id, { active });
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, active } : item))
      );
      toast.success(active ? "Announcement published" : "Announcement hidden");
    } catch {
      setError("Failed to update announcement");
      toast.error("Failed to update announcement");
    } finally {
      setLoading(false);
    }
  };

  const sendDeviceCommand = async (
    display: TVDisplay,
    action: "restart" | "stop" | "start"
  ) => {
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

  const displayStats = useMemo(() => {
    const total = displays.length;
    const online = displays.filter((display) => display.status === "online").length;
    const offline = total - online;
    return { total, online, offline };
  }, [displays]);

  const activeAssignments = useMemo(() => {
    return new Set(
      displays
        .map((display) => display.assignedContentId)
        .filter(Boolean)
    );
  }, [displays]);

  const filteredCardItems = useMemo(() => {
    return contentItems.filter((item) => {
      if (assetFilter === "slides") {
        return item.type === "image" || item.type === "predesigned";
      }
      if (assetFilter === "videos") {
        return item.type === "website";
      }
      if (assetFilter === "widgets") {
        return WIDGET_TYPES.has(item.type);
      }
      return true;
    });
  }, [assetFilter, contentItems]);

  const filteredContentTableItems = useMemo(() => {
    return contentItems.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesType =
        contentTypeFilter === "all" || item.type === contentTypeFilter;
      const matchesStatus =
        contentStatusFilter === "all" ||
        (contentStatusFilter === "active" ? item.active : !item.active);

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [contentItems, contentStatusFilter, contentTypeFilter, searchQuery]);

  if (!masjidId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 rounded-2xl border border-[#550C18]/10 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#550C18] mb-2">
          Select a Masjid
        </h2>
        <p className="text-[#3A3A3A]/70">
          Choose a masjid to manage signage displays and content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-[#550C18]/10 bg-[linear-gradient(135deg,rgba(255,246,247,1)_0%,rgba(255,255,255,1)_42%,rgba(249,241,243,1)_100%)] p-6 shadow-[0_30px_80px_-55px_rgba(85,12,24,0.45)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Signage
            </p>
            <h1 className="mt-2 text-1xl font-semibold tracking-tight text-[#2e0c12] md:text-4xl">
              One place to manage every screen and slide.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#6d5560] md:text-base">
              Control TV displays, launch content, and keep live signage smooth across your masjid.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-[#550C18]/15 bg-white/90 text-[#550C18] hover:bg-[#550C18]/5"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Signage
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[24px] border-[#550C18]/10 bg-gradient-to-br from-[#550C18] to-[#7a162c] text-white shadow-[0_20px_45px_-30px_rgba(85,12,24,0.8)]">
          <CardContent className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Monitor className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm text-white/75">Displays</p>
            <p className="mt-1 text-lg font-semibold">Managed by Mizan Admin</p>
            <p className="mt-3 text-sm text-white/75">
              New display devices are assigned to masjids from the admin app before deployment.
            </p>
          </CardContent>
        </Card>

        <Link href="#create-content" className="block">
          <Card className="h-full rounded-[24px] border-[#550C18]/10 bg-white shadow-[0_18px_40px_-32px_rgba(85,12,24,0.35)] transition hover:-translate-y-0.5">
            <CardContent className="flex h-full items-center gap-4 p-6">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#8a6b74]">Content</p>
                <p className="text-lg font-semibold text-[#2e0c12]">
                  Create Content Slide
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={`/dashboard/content-library/create/announcement?masjidId=${masjidId}`}
          className="block"
        >
          <Card className="h-full rounded-[24px] border-none bg-gradient-to-br from-[#a67a08] to-[#d4ab25] text-[#2e2400] shadow-[0_20px_45px_-30px_rgba(166,122,8,0.65)] transition hover:-translate-y-0.5">
            <CardContent className="flex h-full items-center gap-4 p-6">
              <div className="rounded-2xl bg-white/25 p-3">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#2e2400]/70">Broadcast</p>
                <p className="text-lg font-semibold">Quick Announcement</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-1xl font-semibold tracking-tight text-[#2e0c12]">
              Active TV Displays
            </h2>
            <p className="mt-1 text-lg text-[#6d5560]">
              Real-time status of sanctuary digital signage
            </p>
          </div>
          <a
            href="#display-management"
            className="text-base font-semibold text-[#0f5c4d] hover:text-[#0b4a3e]"
          >
            View All Locations
          </a>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {displays.slice(0, 2).map((display) => {
            const assigned = contentItems.find(
              (item) => item.id === display.assignedContentId
            );

            return (
              <Card
                key={display.id}
                className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]"
              >
                <CardContent className="p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-900">
                      <Monitor className="h-7 w-7" />
                    </div>
                    <Badge
                      className={
                        display.status === "online"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      <span className="mr-2 h-2 w-2 rounded-full bg-current opacity-70" />
                      {display.status === "online" ? "ONLINE" : "OFFLINE"}
                    </Badge>
                  </div>

                  <h3 className="mt-8 text-lg font-semibold tracking-tight text-[#2e0c12]">
                    {display.name}
                  </h3>
                  <p className="mt-2 text-md text-[#5f646d]">
                    Current:{" "}
                    <span className="font-medium text-[#173f36]">
                      {assigned?.title || "No assigned content"}
                    </span>
                  </p>

                  <div className="mt-6 border-t border-[#550C18]/10 pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-normal uppercase tracking-[0.18em] text-[#8ca0bc]">
                        {display.lastSeen
                          ? `Last seen ${new Date(display.lastSeen).toLocaleDateString()}`
                          : "Awaiting heartbeat"}
                      </p>
                      <Link
                        href={`/dashboard/tv-displays/signage-config?masjidId=${masjidId}&displayId=${display.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#7182a0] hover:bg-[#550C18]/5 hover:text-[#550C18]"
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cad3df] bg-[#f8fafc] px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#b9c2d3] shadow-sm">
              <Plus className="h-8 w-8" />
            </div>
            <p className="mt-8 text-lg font-semibold text-[#9aa9c0]">
              Displays Added Separately
            </p>
            <p className="mt-2 max-w-xs text-sm text-[#b7c2d5]">
              Ask Mizan admin to assign a new device to this masjid before shipping it out.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4" id="create-content">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-1xl font-semibold tracking-tight text-[#2e0c12]">
              Content Library
            </h2>
            <div className="flex rounded-2xl bg-[#eef0f4] p-1">
              {[
                { key: "all", label: "All" },
                { key: "slides", label: "Slides" },
                { key: "videos", label: "Videos" },
                { key: "widgets", label: "Widgets" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setAssetFilter(item.key as "all" | "slides" | "videos" | "widgets")
                  }
                  className={`rounded-xl px-5 py-3 text-lg font-medium transition ${
                    assetFilter === item.key
                      ? "bg-white text-[#173f36] shadow-sm"
                      : "text-[#6d5560] hover:text-[#2e0c12]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCardItems.slice(0, 6).map((item) => {
            const meta = getTypeMeta(item.type);
            const Icon = meta.icon;
            const isAssigned = activeAssignments.has(item.id);

            return (
              <Link
                key={item.id}
                href={`/dashboard/content-library/${item.type}/edit/${item.id}?masjidId=${masjidId}`}
                className="group"
              >
                <Card className="overflow-hidden rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)] transition hover:-translate-y-0.5">
                  <CardContent className="p-0">
                    <div className={`flex min-h-[220px] flex-col justify-between bg-gradient-to-br ${meta.tone} p-6`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                        {isAssigned ? (
                          <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                            Currently Showing
                          </Badge>
                        ) : item.active ? (
                          <Badge className="bg-[#550C18]/10 text-[#550C18] hover:bg-[#550C18]/10">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium opacity-70">{meta.label}</p>
                        <h3 className="mt-2 text-3xl font-semibold leading-tight">
                          {item.title}
                        </h3>
                        <p className="mt-3 line-clamp-2 text-base opacity-75">
                          {item.description || "Ready for your display rotation."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-6 py-5">
                      <div>
                        <p className="text-2xl font-semibold text-[#2e0c12]">
                          {item.title}
                        </p>
                        <p className="text-base text-[#8a6b74]">
                          {item.type.replace(/_/g, " ")}
                        </p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-[#550C18]/60 transition group-hover:text-[#550C18]" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          <Link href="#display-management" className="group">
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cad3df] bg-[#fbfcfd] px-8 text-center transition hover:border-[#550C18]/30 hover:bg-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#b9c2d3] shadow-sm">
                <Plus className="h-8 w-8" />
              </div>
              <p className="mt-8 text-2xl font-semibold text-[#9aa9c0]">
                New Asset
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#d6bc60]/50 bg-white p-6 shadow-[0_24px_60px_-45px_rgba(85,12,24,0.3)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5efe0] text-[#8d6e00]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-[#2e0c12]">
                Digital Signage Best Practice
              </h3>
              <p className="mt-1 max-w-3xl text-lg text-[#6d5560]">
                Research shows that adding 15-second spiritual break slides between scheduled content can increase community engagement and readability.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-base font-semibold text-[#0f5c4d] hover:bg-[#0f5c4d]/5 hover:text-[#0f5c4d]"
          >
            Apply Suggestion
          </Button>
        </div>
      </section>

      <section id="display-management" className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-2xl text-[#2e0c12]">
                  Display Management
                </CardTitle>
                <CardDescription className="text-[#6d5560]">
                  View live device status, edit metadata, and configure each screen.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#6d5560]">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isConnected
                        ? "bg-green-500"
                        : isConnecting
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  {isConnected ? "Live" : isConnecting ? "Connecting" : "Offline"}
                </div>
                {wsError ? <span className="text-red-500">WS Error</span> : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {displays.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#550C18]/15 py-12 text-center text-[#6d5560]">
                No displays registered yet.
              </div>
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
                          <h3 className="text-lg font-semibold text-[#2e0c12]">
                            {display.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={
                              display.status === "online"
                                ? "border-green-500 text-green-600"
                                : "border-gray-300 text-gray-500"
                            }
                          >
                            {display.status}
                          </Badge>
                          {display.status === "online" ? (
                            <Wifi className="h-4 w-4 text-green-500" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Location: {display.location || "Not set"}
                        </p>
                        {display.lastSeen ? (
                          <p className="text-xs text-[#3A3A3A]/60">
                            Last seen: {new Date(display.lastSeen).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/tv-displays/signage-config?masjidId=${masjidId}&displayId=${display.id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                        >
                          <Settings className="mr-1 h-4 w-4" />
                          Configure
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                        onClick={() => handleToggleDisplayStatus(display)}
                      >
                        {display.status === "online" ? (
                          <Pause className="mr-1 h-4 w-4" />
                        ) : (
                          <Play className="mr-1 h-4 w-4" />
                        )}
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
                      {display.platform ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                          onClick={() => sendDeviceCommand(display, "restart")}
                        >
                          Restart
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#2e0c12]">
                Display Summary
              </CardTitle>
              <CardDescription className="text-[#6d5560]">
                A quick pulse on connected screens and reusable templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Total Displays", value: displayStats.total },
                { label: "Online", value: displayStats.online },
                { label: "Offline", value: displayStats.offline },
                { label: "Templates", value: templates.length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#550C18]/10 bg-[#fcfafb] p-4"
                >
                  <p className="text-sm text-[#8a6b74]">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[#2e0c12]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#2e0c12]">
                Template Toggles
              </CardTitle>
              <CardDescription className="text-[#6d5560]">
                Control which template blocks stay available to display operators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.length === 0 ? (
                <div className="text-sm text-[#6d5560]">No templates yet.</div>
              ) : (
                templates.slice(0, 6).map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between rounded-2xl border border-[#550C18]/10 p-4"
                  >
                    <div>
                      <p className="font-semibold text-[#2e0c12]">
                        {template.title}
                      </p>
                      <p className="text-sm text-[#6d5560]">
                        {template.description || template.type}
                      </p>
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
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <Card className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl text-[#2e0c12]">
                  Library Management
                </CardTitle>
                <CardDescription className="text-[#6d5560]">
                  Search, publish, edit, and retire the content that appears on your displays.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={libraryView === "content" ? "default" : "outline"}
                  className={
                    libraryView === "content"
                      ? "bg-[#550C18] hover:bg-[#78001A] text-white"
                      : "border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                  }
                  onClick={() => setLibraryView("content")}
                >
                  Content
                </Button>
                <Button
                  variant={libraryView === "announcements" ? "default" : "outline"}
                  className={
                    libraryView === "announcements"
                      ? "bg-[#550C18] hover:bg-[#78001A] text-white"
                      : "border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                  }
                  onClick={() => setLibraryView("announcements")}
                >
                  Announcements
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#550C18]/60" />
                <Input
                  placeholder="Search by title or description"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-9"
                />
              </div>

              {libraryView === "content" ? (
                <>
                  <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          {type.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={contentStatusFilter}
                    onValueChange={setContentStatusFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : null}
            </div>

            {libraryView === "content" ? (
              <div className="overflow-hidden rounded-xl border border-[#550C18]/10 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Zones</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContentTableItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-5 w-5 text-[#550C18]" />
                            <div>
                              <div className="font-semibold text-[#3A3A3A]">
                                {item.title}
                              </div>
                              <div className="text-xs text-[#3A3A3A]/70">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-[#550C18]/20 text-[#550C18]"
                          >
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.active ? (
                            <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100">
                              Hidden
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.zones && item.zones.length > 0 ? (
                            item.zones.map((zone, index) => (
                              <Badge
                                key={index}
                                className="mr-1 bg-[#550C18]/10 text-[#550C18] hover:bg-[#550C18]/10"
                              >
                                {zone}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-[#3A3A3A]/70">All</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-[#3A3A3A]/70">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/content-library/${item.type}/edit/${item.id}?masjidId=${masjidId}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                              >
                                Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                              onClick={() =>
                                handleHideContent(item.id, !item.active)
                              }
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredContentTableItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-[#3A3A3A]/70"
                        >
                          No content found for your filters.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#550C18]/10 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Zones</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>
                          <div className="font-semibold text-[#3A3A3A]">
                            {announcement.title}
                          </div>
                          <div className="text-xs text-[#3A3A3A]/70">
                            {announcement.content?.slice(0, 60) || "Announcement"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {announcement.active ? (
                            <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100">
                              Hidden
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-[#3A3A3A]/70">
                          {announcement.startDate
                            ? new Date(announcement.startDate).toLocaleDateString()
                            : "Always"}{" "}
                          →{" "}
                          {announcement.endDate
                            ? new Date(announcement.endDate).toLocaleDateString()
                            : "Ongoing"}
                        </TableCell>
                        <TableCell>
                          {announcement.zones && announcement.zones.length > 0 ? (
                            announcement.zones.map((zone, index) => (
                              <Badge
                                key={index}
                                className="mr-1 bg-[#550C18]/10 text-[#550C18] hover:bg-[#550C18]/10"
                              >
                                {zone}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-[#3A3A3A]/70">All</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/content-library/announcement/edit/${announcement.id}?masjidId=${masjidId}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                              >
                                Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                              onClick={() =>
                                handleHideAnnouncement(
                                  announcement.id,
                                  !announcement.active
                                )
                              }
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleDeleteAnnouncement(announcement.id)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {announcements.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-[#3A3A3A]/70"
                        >
                          No announcements found.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Display</DialogTitle>
            <DialogDescription>
              Update display details and notes.
            </DialogDescription>
          </DialogHeader>
          {editingDisplay ? (
            <form onSubmit={handleUpdateDisplay} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Display Name</Label>
                <Input
                  id="edit-name"
                  value={editingDisplay.name}
                  onChange={(event) =>
                    setEditingDisplay((prev) =>
                      prev ? { ...prev, name: event.target.value } : prev
                    )
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingDisplay.location || ""}
                  onChange={(event) =>
                    setEditingDisplay((prev) =>
                      prev ? { ...prev, location: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={
                    typeof editingDisplay.config?.notes === "string"
                      ? editingDisplay.config.notes
                      : ""
                  }
                  onChange={(event) =>
                    setEditingDisplay((prev) =>
                      prev
                        ? {
                            ...prev,
                            config: {
                              ...(prev.config || {}),
                              notes: event.target.value,
                            },
                          }
                        : prev
                    )
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#550C18] hover:bg-[#78001A] text-white"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
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
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteDisplay}
              disabled={loading}
            >
              Delete Display
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
