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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAllContent, createContent, updateContent, deleteContent } from "@/lib/actions/content";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contentItems, setContentItems] = useState([]);
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
  const router = useRouter();
  const masjidId = useSearchParams().get("masjidId");

  // Live polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllContent();
      setContentItems(data);
      setError(null);
    } catch (err: any) {
      setError("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createContent({
        title: form.title,
        type: form.type,
        description: form.description,
        data: { content: form.content, tags: form.tags.split(",") },
        active: true,
      });
      setAddDialogOpen(false);
      setForm({ title: "", type: "announcement", description: "", content: "", tags: "" });
      fetchData();
    } catch (err: any) {
      setError("Failed to create content");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true);
    try {
      await updateContent(editItem.id, {
        title: form.title,
        type: form.type,
        description: form.description,
        data: { content: form.content, tags: form.tags.split(",") },
      });
      setEditDialogOpen(false);
      setEditItem(null);
      setForm({ title: "", type: "announcement", description: "", content: "", tags: "" });
      fetchData();
    } catch (err: any) {
      setError("Failed to update content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteContent(id);
      fetchData();
    } catch (err: any) {
      setError("Failed to delete content");
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = contentItems.filter((item: any) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.data?.tags && item.data.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const getIconForType = (type) => {
    switch (type) {
      case "document":
        return <FileText className="h-6 w-6" />;
      case "image":
        return <ImageIcon className="h-6 w-6" />;
      case "video":
        return <Video className="h-6 w-6" />;
      case "audio":
        return <Music className="h-6 w-6" />;
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
          <h2 className="text-2xl font-bold text-[#550C18]">Content Library</h2>
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
                    onClick={() =>
                      document.getElementById("content-file").click()
                    }
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
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
            </TabsList>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#550C18]/10 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                        {getIconForType(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-[#3A3A3A] text-lg">
                            {item.title}
                          </h3>
                          <Badge
                            className={
                              item.type === "document"
                                ? "bg-blue-500"
                                : item.type === "image"
                                ? "bg-green-500"
                                : item.type === "video"
                                ? "bg-purple-500"
                                : item.type === "audio"
                                ? "bg-orange-500"
                                : "bg-gray-500"
                            }
                          >
                            {item.format.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs text-[#3A3A3A]/70 mt-1">
                          <span>Size: {item.size}</span>
                          <span>Added: {item.createdAt}</span>
                          <span>By: {item.author}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {item.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 col-span-full">
                  <FileText className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                  <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                    No content found
                  </h3>
                  <p className="text-[#3A3A3A]/70 mb-4">
                    No content matches your search criteria. Try adjusting your
                    search or upload new content.
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
