"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Download,
  ImageIcon,
  FileIcon,
  Video,
  Music,
  Calendar,
  BookOpen,
  Hand,
  Clock,
  Moon,
  Globe,
  BookMarked,
  EyeOff,
  Info,
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAllContent, createContent, updateContent, deleteContent, getAllAnnouncements } from "@/lib/actions/content";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { deleteAnnouncement, updateAnnouncement } from "@/lib/actions/announcements";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CONTENT_TYPES = [
  {
    type: "announcement",
    icon: <FileText className="h-8 w-8 text-[#550C18]" />,
    title: "Announcement",
    description: "Show announcements such as funeral, reminders and important messages."
  },
  {
    type: "image",
    icon: <ImageIcon className="h-8 w-8 text-[#550C18]" />,
    title: "Image",
    description: "Upload your images such as flyers, donation requests, event reminders and more."
  },
  {
    type: "predesigned",
    icon: <FileIcon className="h-8 w-8 text-[#550C18]" />,
    title: "Pre-Designed Image",
    description: "Use one of our provided images."
  },
  {
    type: "website",
    icon: <FileIcon className="h-8 w-8 text-[#550C18]" />,
    title: "Website",
    description: "Add a website to be displayed."
  },
  {
    type: "google_calendar",
    icon: <Calendar className="h-8 w-8 text-[#550C18]" />,
    title: "Google Calendar",
    description: "Display your Google calendar."
  },
  {
    type: "daily_verse",
    icon: <BookOpen className="h-8 w-8 text-[#550C18]" />,
    title: "Daily Verse",
    description: "Display a verse from the Quran (in English) daily."
  },
  {
    type: "daily_hadith",
    icon: <BookOpen className="h-8 w-8 text-[#550C18]" />,
    title: "Daily Hadith",
    description: "Display a different Hadith (in English) daily."
  },
  {
    type: "daily_dua",
    icon: <Hand className="h-8 w-8 text-[#550C18]" />,
    title: "Daily Dua",
    description: "Display a different dua (in English) daily."
  },
  {
    type: "ramadan_countdown",
    icon: <Clock className="h-8 w-8 text-[#550C18]" />,
    title: "Ramadan Countdown",
    description: "Display a Ramadan countdown on the screen."
  },
  {
    type: "eid_countdown",
    icon: <Moon className="h-8 w-8 text-[#550C18]" />,
    title: "Eid Countdown",
    description: "Display an Eid countdown on the screen."
  },
  {
    type: "days_countdown",
    icon: <Calendar className="h-8 w-8 text-[#550C18]" />,
    title: "Days Countdown",
    description: "Display a Days countdown on the screen."
  },
  {
    type: "taraweeh_timings",
    icon: <Clock className="h-8 w-8 text-[#550C18]" />,
    title: "Taraweeh Timings",
    description: "Display taraweeh timings on the screen."
  },
];

// Add interfaces for content item and announcement
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
  [key: string]: any;
}

interface Announcement {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string | Date;
  startDate: string | Date;
  endDate: string | Date;
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({
    title: "",
    type: "announcement",
    description: "",
    content: "",
    tags: "",
  });
  const masjidId = useSearchParams().get("masjidId");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [displayFilter, setDisplayFilter] = useState<string>("all");
  const [zonesFilter, setZonesFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Live polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [masjidId]);

  const fetchData = async () => {
    if(!masjidId) return;
    setLoading(true);
    try {
      const data = await getAllContent(masjidId);
      // Map zones from string to array if needed
      const mappedData = data.map((item: any) => ({
        ...item,
        zones: Array.isArray(item.zones)
          ? item.zones
          : typeof item.zones === 'string' && item.zones.startsWith('[')
            ? JSON.parse(item.zones)
            : item.zones ? [item.zones] : [],
      }));
      setContentItems(mappedData);
      const announcements = await getAllAnnouncements(masjidId);
      setAnnouncements(announcements);
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
      console.log("Error deleting announcement", err);
      toast({
        title: "Error Deleting Announcement",
        description: "Failed to delete announcement",
      });
      setError("Failed to delete announcement");
    } finally {
      setLoading(false);
    }
  }

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
  }


  const handleHide = async (id: string, active: boolean) => {
    setLoading(true);
    try {
      await updateContent(id, { active });
      toast({
        title: "Content Hidden",
        description: "Content has been hidden successfully",
      });
      fetchData();
    } catch (err: any) {
      setError("Failed to hide content");
    } finally {
      setLoading(false);
    }
  }

  const filteredContent = contentItems
    .filter((item: ContentItem) =>
      (typeFilter === "all" || item.type === typeFilter) &&
      (activeFilter === "all" || (activeFilter === "yes" ? item.active : !item.active)) &&
      (displayFilter === "all" || (item.displays && item.displays.some((d: any) => d.name === displayFilter))) &&
      (zonesFilter === "all" || (item.zones && item.zones.includes(zonesFilter))) &&
      (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.data?.tags && item.data.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    )
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getIconForType = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-6 w-6" />;
      case "image":
        return <ImageIcon className="h-6 w-6" />;
      case "video":
        return <Video className="h-6 w-6" />;
      case "audio":
        return <Music className="h-6 w-6" />;
      case "website":
        return <Globe className="h-6 w-6" />;
      default:
        return <FileIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#550C18] mb-2">Add New Content</h2>
        <p className="text-[#3A3A3A]/70 mb-4">Click on a tile to display that content on your TV/App</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {CONTENT_TYPES.map((ct) => (
            <Link
              key={ct.type}
              href={`/dashboard/content-library/create/${ct.type}?masjidId=${masjidId}`}
              className={`rounded-lg border border-[#550C18]/10 bg-white p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#550C18]`}
            >
              {ct.icon}
              <div className="mt-3 font-semibold text-[#3A3A3A] text-lg">{ct.title}</div>
              <div className="mt-1 text-[#3A3A3A]/70 text-sm text-center">{ct.description}</div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]" id="content-library-table">Content Library</h2>
          <p className="text-[#3A3A3A]/70">
            Manage and organize your masjid's digital content
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Upload Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Upload New Content</DialogTitle>
              <DialogDescription>
                Add new content to your masjid's digital library.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="content-title">Title</Label>
                <Input id="content-title" placeholder="Enter content title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content-type">Content Type</Label>
                <select
                  id="content-type"
                  className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                >
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content-file">File</Label>
                <div className="border border-dashed border-[#550C18]/20 rounded-md p-6 text-center">
                  <FileIcon className="h-8 w-8 mx-auto text-[#550C18]/50 mb-2" />
                  <p className="text-sm text-[#3A3A3A]/70 mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <Input id="content-file" type="file" className="hidden" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                    onClick={() => {
                      const fileInput = document.getElementById("content-file");
                      if (fileInput) (fileInput as HTMLInputElement).click();
                    }}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content-description">Description</Label>
                <Textarea
                  id="content-description"
                  placeholder="Enter content description"
                  className="min-h-[100px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content-tags">Tags (comma separated)</Label>
                <Input
                  id="content-tags"
                  placeholder="e.g. ramadan, schedule, event"
                  className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#550C18] hover:bg-[#78001A] text-white"
              >
                Upload Content
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Content Files
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Browse and manage your content library
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
                <Input
                  placeholder="Search content..."
                  className="pl-10 border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-[#550C18]/20 text-[#3A3A3A] hover:bg-[#550C18]/5"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-4 w-full">
              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="type-filter">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {CONTENT_TYPES.map(ct => (
                      <SelectItem key={ct.type} value={ct.type}>{ct.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="active-filter">Active</Label>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="flex-1 min-w-[150px]">
                <Label htmlFor="display-filter">Display</Label>
                <Select value={displayFilter} onValueChange={setDisplayFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select display" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="zones-filter">Zones</Label>
                <Select value={zonesFilter} onValueChange={setZonesFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Zone 1">Zone 1</SelectItem>
                    <SelectItem value="Zone 2">Zone 2</SelectItem>
                    <SelectItem value="Zone 3">Zone 3</SelectItem>
                    <SelectItem value="Zone 4">Zone 4</SelectItem>
                    <SelectItem value="Zone 5">Zone 5</SelectItem>
                    <SelectItem value="Zone 6">Zone 6</SelectItem>
                    <SelectItem value="Zone 7">Zone 7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[100px]">
                <Label htmlFor="page-size">Page Size</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50, 100].map(size => (
                      <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><BookMarked className="h-4 w-4 ml-3" /></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="ml-auto text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.length > 0 ? (
                  filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-md bg-[#550C18]/10 text-[#550C18]">
                            {getIconForType(item.type)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#550C18]/10 text-[#550C18]">
                          {item.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={item.active ? "success" : "danger"}>{item.active ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      <TableCell className="ml-auto flex items-center justify-end flex-row gap-3">
                        <Button onClick={() => handleHide(item.id, !item.active)} variant="outline" size="sm" className="h-8 w-8 p-0">
                          {!item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Link href={`/dashboard/content-library/${item.type}/edit/${item.id}?masjidId=${masjidId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={loading}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Content</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this content? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                                disabled={loading}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="py-8">
                        <FileText className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                        <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                          No content found
                        </h3>
                        <p className="text-[#3A3A3A]/70">
                          No content matches your search criteria. Try adjusting your search or upload new content.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {contentItems.length > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="flex-1 text-sm text-[#3A3A3A]/70">
                  Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, contentItems.length)}
                  </span>{" "}
                  of <span className="font-medium">{contentItems.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({length: Math.ceil(contentItems.length / pageSize)}, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.min(Math.ceil(contentItems.length / pageSize), page + 1))}
                    disabled={currentPage === Math.ceil(contentItems.length / pageSize)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                <div className="flex flex-row items-center w-full">
                  <h2 className="text-xl font-semibold text-[#3A3A3A]" id="announcement-table">Announcements</h2>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="inline-block ml-2 h-4 w-4 text-[#3A3A3A]/50 hover:text-[#3A3A3A]/70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      MizanTv: Announcements will be displayed in a animating text on the bottom.<br /> Or can be displayed in a fullscreen mode once you add into the screens settings.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Browse and manage your announcements
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
                <Input
                  placeholder="Search announcements..."
                  className="pl-10 border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-[#550C18]/20 text-[#3A3A3A] hover:bg-[#550C18]/5"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Zones</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="ml-auto text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#550C18]/10 text-[#550C18]">
                          {announcement.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(announcement.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(announcement.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{typeof announcement.zones === "string" ? announcement.zones : announcement.zones.join(", ")}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={announcement.active ? "success" : "danger"}
                        >
                          {announcement.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="ml-auto flex items-center gap-2 justify-end flex-row gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleHideAnnouncement(announcement.id)} 
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link href={`/dashboard/content-library/announcement/edit/${announcement.id}?masjidId=${masjidId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={loading}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Announcement</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this announcement? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                  disabled={loading}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex flex-col items-center py-6">
                        <FileText className="h-16 w-16 text-[#550C18]/50 mb-4" />
                        <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                          No announcements found
                        </h3>
                        <p className="text-[#3A3A3A]/70">
                          No announcements match your search criteria. Try adjusting your search or create new announcements.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
