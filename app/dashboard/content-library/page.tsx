"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  EyeOff,
  FileIcon,
  FileText,
  Globe,
  Hand,
  ImageIcon,
  Moon,
  PlusCircle,
  Search,
  Sparkles,
  Trash,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllContent, getAllAnnouncements, updateContent, deleteContent } from "@/lib/actions/content";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { deleteAnnouncement, updateAnnouncement } from "@/lib/actions/announcements";

const CONTENT_TYPES = [
  {
    type: "announcement",
    icon: <FileText className="h-5 w-5" />,
    title: "Announcement",
    description: "Show announcements such as funeral, reminders and important messages.",
  },
  {
    type: "image",
    icon: <ImageIcon className="h-5 w-5" />,
    title: "Image",
    description: "Upload images such as flyers, donation requests, and event reminders.",
  },
  {
    type: "predesigned",
    icon: <FileIcon className="h-5 w-5" />,
    title: "Pre-Designed Image",
    description: "Use one of our provided images.",
  },
  {
    type: "website",
    icon: <Globe className="h-5 w-5" />,
    title: "Website",
    description: "Add a website to be displayed.",
  },
  {
    type: "google_calendar",
    icon: <Calendar className="h-5 w-5" />,
    title: "Google Calendar",
    description: "Display your Google calendar.",
  },
  {
    type: "daily_verse",
    icon: <BookOpen className="h-5 w-5" />,
    title: "Daily Verse",
    description: "Display a verse from the Quran daily.",
  },
  {
    type: "daily_hadith",
    icon: <BookOpen className="h-5 w-5" />,
    title: "Daily Hadith",
    description: "Display a different Hadith daily.",
  },
  {
    type: "daily_dua",
    icon: <Hand className="h-5 w-5" />,
    title: "Daily Dua",
    description: "Display a different dua daily.",
  },
  {
    type: "ramadan_countdown",
    icon: <Clock className="h-5 w-5" />,
    title: "Ramadan Countdown",
    description: "Display a Ramadan countdown on the screen.",
  },
  {
    type: "eid_countdown",
    icon: <Moon className="h-5 w-5" />,
    title: "Eid Countdown",
    description: "Display an Eid countdown on the screen.",
  },
  {
    type: "days_countdown",
    icon: <Calendar className="h-5 w-5" />,
    title: "Days Countdown",
    description: "Display a Days countdown on the screen.",
  },
  {
    type: "taraweeh_timings",
    icon: <Clock className="h-5 w-5" />,
    title: "Taraweeh Timings",
    description: "Display taraweeh timings on the screen.",
  },
];

interface ContentItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string | Date;
  active: boolean;
  data?: {
    tags?: string[];
    [key: string]: any;
  };
  displays?: { name: string }[];
  zones?: string[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  [key: string]: any;
}

interface Announcement {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string | Date;
  startDate: string | Date | null;
  endDate: string | Date | null;
  zones: string[];
  active: boolean;
  masjidId: string;
  updatedAt: string | Date;
  contentItemId: string | null;
}

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const masjidId = useSearchParams().get("masjidId");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [view, setView] = useState<"content" | "announcements">("content");

  useEffect(() => {
    if (!masjidId) return;
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [masjidId]);

  const fetchData = async () => {
    if (!masjidId) return;
    setLoading(true);
    try {
      const data = await getAllContent(masjidId);
      if (!data) {
        setError("Unauthorized");
        return;
      }
      const mappedData = data.map((item: any) => ({
        ...item,
        zones: Array.isArray(item.zones)
          ? item.zones
          : typeof item.zones === "string" && item.zones.startsWith("[")
            ? JSON.parse(item.zones)
            : item.zones ? [item.zones] : [],
      }));
      setContentItems(mappedData);
      const announcementData = await getAllAnnouncements(masjidId);
      const mappedAnnouncements = (announcementData || []).map((item: any) => ({
        ...item,
        zones: Array.isArray(item.zones)
          ? item.zones
          : typeof item.zones === "string" && item.zones.startsWith("[")
            ? JSON.parse(item.zones)
            : item.zones ? [item.zones] : [],
      }));
      setAnnouncements(mappedAnnouncements);
      setError(null);
    } catch (err: any) {
      setError("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteContent(id);
      toast({
        title: "Content Deleted",
        description: "Content has been deleted successfully",
      });
      fetchData();
    } catch (err: any) {
      setError("Failed to delete content");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setLoading(true);
    try {
      await deleteAnnouncement(id);
      toast({
        title: "Announcement Deleted",
        description: "Announcement has been deleted successfully",
      });
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error Deleting Announcement",
        description: "Failed to delete announcement",
      });
      setError("Failed to delete announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleHideAnnouncement = async (id: string) => {
    setLoading(true);
    try {
      await updateAnnouncement(id, { active: false });
      toast({
        title: "Announcement Hidden",
        description: "Announcement has been hidden successfully",
      });
      fetchData();
    } catch (err: any) {
      setError("Failed to hide announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async (id: string, active: boolean) => {
    setLoading(true);
    try {
      await updateContent(id, { active });
      toast({
        title: active ? "Content Published" : "Content Hidden",
        description: active
          ? "Content is now live on displays."
          : "Content has been hidden successfully",
      });
      fetchData();
    } catch (err: any) {
      setError("Failed to hide content");
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = contentItems
    .filter((item: ContentItem) =>
      (typeFilter === "all" || item.type === typeFilter) &&
      (activeFilter === "all" || (activeFilter === "yes" ? item.active : !item.active)) &&
      (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.data?.tags && item.data.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    )
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const total = contentItems.length;
    const active = contentItems.filter((item) => item.active).length;
    const hidden = total - active;
    const scheduled = contentItems.filter((item) => item.startDate || item.endDate).length;
    return { total, active, hidden, scheduled };
  }, [contentItems]);

  if (!masjidId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-white border border-[#550C18]/10 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#550C18] mb-2">
          Select a Masjid
        </h2>
        <p className="text-[#3A3A3A]/70">
          Choose a masjid to manage content and announcements.
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
              Content Library
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Design the story your screens tell.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Create announcements, countdowns, and rich media playlists for every display.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/content-library/create/announcement?masjidId=${masjidId}`}>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              onClick={fetchData}
            >
              Refresh Library
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Total Content", value: stats.total, icon: Sparkles },
          { label: "Active Items", value: stats.active, icon: ArrowUpRight },
          { label: "Scheduled", value: stats.scheduled, icon: Calendar },
          { label: "Announcements", value: announcements.length, icon: FileText },
        ].map((stat) => (
          <Card key={stat.label} className="border-[#550C18]/10 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-[#3A3A3A]/70">
                <span>{stat.label}</span>
                <stat.icon className="h-4 w-4 text-[#550C18]" />
              </CardDescription>
              <CardTitle className="text-2xl text-[#2e0c12]">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-[#3A3A3A]/70">
                {stat.label === "Active Items" ? `${stats.hidden} hidden` : "Updated just now"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#550C18]/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-[#2e0c12]">Create New Content</CardTitle>
          <CardDescription className="text-[#3A3A3A]/70">
            Pick a template to start building your next screen.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTENT_TYPES.map((ct) => (
            <Link
              key={ct.type}
              href={`/dashboard/content-library/create/${ct.type}?masjidId=${masjidId}`}
              className="group rounded-2xl border border-[#550C18]/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#550C18]/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-[#550C18]/10 flex items-center justify-center text-[#550C18]">
                  {ct.icon}
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#550C18]/60 group-hover:text-[#550C18]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#2e0c12]">{ct.title}</h3>
              <p className="text-sm text-[#3A3A3A]/70">{ct.description}</p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="border-[#550C18]/10 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-[#2e0c12]">Library</CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Search and manage the content that appears on your displays.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={view === "content" ? "default" : "outline"}
                className={
                  view === "content"
                    ? "bg-[#550C18] hover:bg-[#78001A] text-white"
                    : "border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                }
                onClick={() => setView("content")}
              >
                Content
              </Button>
              <Button
                variant={view === "announcements" ? "default" : "outline"}
                className={
                  view === "announcements"
                    ? "bg-[#550C18] hover:bg-[#78001A] text-white"
                    : "border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                }
                onClick={() => setView("announcements")}
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
                placeholder="Search by title, tag, or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {view === "content" && (
              <>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {CONTENT_TYPES.map((ct) => (
                      <SelectItem key={ct.type} value={ct.type}>
                        {ct.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Active</SelectItem>
                    <SelectItem value="no">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {view === "content" ? (
            <div className="rounded-xl border border-[#550C18]/10 bg-white overflow-hidden">
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
                  {filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-5 w-5 text-[#550C18]" />
                          <div>
                            <div className="font-semibold text-[#3A3A3A]">{item.title}</div>
                            <div className="text-xs text-[#3A3A3A]/70">{item.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#550C18]/20 text-[#550C18]">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.active ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.zones && item.zones.length > 0 ? (
                          item.zones.map((z: string, i: number) => (
                            <Badge key={i} className="bg-[#550C18]/10 text-[#550C18] mr-1">
                              {z}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-[#3A3A3A]/70">All</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[#3A3A3A]/70">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/content-library/${item.type}/edit/${item.id}?masjidId=${masjidId}`}>
                            <Button size="sm" variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                            onClick={() => handleHide(item.id, !item.active)}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredContent.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-[#3A3A3A]/70">
                        No content found for your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-xl border border-[#550C18]/10 bg-white overflow-hidden">
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
                        <div className="font-semibold text-[#3A3A3A]">{announcement.title}</div>
                        <div className="text-xs text-[#3A3A3A]/70">
                          {announcement.content?.slice(0, 60) || "Announcement"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {announcement.active ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-[#3A3A3A]/70">
                        {announcement.startDate
                          ? new Date(announcement.startDate).toLocaleDateString()
                          : "Always"} → {announcement.endDate
                          ? new Date(announcement.endDate).toLocaleDateString()
                          : "Ongoing"}
                      </TableCell>
                      <TableCell>
                        {announcement.zones && announcement.zones.length > 0 ? (
                          announcement.zones.map((zone, index) => (
                            <Badge key={index} className="bg-[#550C18]/10 text-[#550C18] mr-1">
                              {zone}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-[#3A3A3A]/70">All</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/content-library/announcement/edit/${announcement.id}?masjidId=${masjidId}`}>
                            <Button size="sm" variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                            onClick={() => handleHideAnnouncement(announcement.id)}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {announcements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-[#3A3A3A]/70">
                        No announcements found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-[#3A3A3A]/70">
              Showing {filteredContent.length} of {contentItems.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Prev
              </Button>
              <span className="text-xs text-[#3A3A3A]/70">{currentPage}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage * pageSize >= contentItems.length}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-sm text-[#3A3A3A]/70">Refreshing content...</div>
      )}
    </div>
  );
}
