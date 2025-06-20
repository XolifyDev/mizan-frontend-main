"use client";

import { useState, useEffect } from "react";
import {
  Monitor,
  Plus,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Edit,
  Trash,
  ImageIcon,
  Tv,
  FileText,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getAllTVDisplays, createTVDisplay, updateTVDisplay, deleteTVDisplay, assignContentToDisplay, updateDisplayStatus } from "@/lib/actions/tvdisplays";
import { getAllContentTemplates, createContentTemplate, updateContentTemplate, deleteContentTemplate, toggleContentTemplate } from "@/lib/actions/content-templates";
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface TVDisplay {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
  lastSeen: Date | null;
  ipAddress: string | null;
  status: string;
  config: any;
  assignedContentId: string | null;
  masjidId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  content?: string;
}

interface Content {
  id: string;
  title: string;
  type: string;
  url: string | null;
  data: any;
  startDate: string | Date | null;
  endDate: string | Date | null;
  zones: string[];
  active: boolean;
  masjidId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  description?: string;
  config?: any;
  name?: string;
}

interface TVDisplayForm {
  name: string;
  location: string;
  content: string;
  notes: string;
  autoPower: boolean;
}

interface TVDisplayUpdate {
  name: string;
  location: string;
  status: string;
  config?: {
    notes: string;
    autoPower: boolean;
  };
}

interface ContentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  active: boolean;
  config: {
    layout: string;
    refreshInterval: number;
    customSettings?: Record<string, any>;
  };
}

export default function TVDisplaysPage() {
  const masjidId = useSearchParams().get("masjidId") as string;
  const [displays, setDisplays] = useState<TVDisplay[]>([]);
  const [activeDisplays, setActiveDisplays] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState<TVDisplayForm>({ 
    name: "", 
    location: "", 
    content: "prayer", 
    notes: "", 
    autoPower: false 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<TVDisplay | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [displayToDelete, setDisplayToDelete] = useState<TVDisplay | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [templates, setTemplates] = useState<Content[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<ContentTemplate>>({
    name: "",
    type: "prayer",
    description: "",
    active: true,
    config: {
      layout: "default",
      refreshInterval: 30
    }
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [isCreatingDisplay, setIsCreatingDisplay] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newDisplay, setNewDisplay] = useState({ name: '', location: '' });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'announcement',
    content: '',
  });
  const { isPending, data: session } = authClient.useSession();
  // @ts-ignore
  const isAdmin = session?.user?.admin;

  useEffect(() => {
    fetchData();
  }, [masjidId]);

  useEffect(() => {
    fetchData(); // initial fetch
    const interval = setInterval(() => {
      fetchData();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [masjidId]);

  const fetchData = async () => {
    try {
      const displaysData = await getAllTVDisplays(masjidId);
      const templatesData = await getAllContentTemplates(masjidId);
      setDisplays(displaysData);
      setTemplates(templatesData);
      setActiveDisplays(displaysData.filter((d: TVDisplay) => d.status === "online").length);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Failed to fetch data. Please try again.");
    }
  };

  const handleAddDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const display = await createTVDisplay({
        ...form,
        masjidId,
        isActive: true,
        config: { notes: form.notes, autoPower: form.autoPower },
        assignedContentId: null,
        status: 'offline',
        layout: 'default',
      });
      setForm({ name: "", location: "", content: "prayer", notes: "", autoPower: false });
      setAddDialogOpen(false);
      setDisplays([...displays, display]);
      setActiveDisplays(displays.filter((d: any) => d.status === "online").length + 1);
      toast.success('Display created successfully');
    } catch (err: any) {
      setError("Failed to add display. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setLoading(true);
    setError(null);
    try {
      const updateData = {
        name: editForm.name,
        location: editForm.location || '',
        status: editForm.status,
        config: editForm.config,
      };
      const updatedDisplay = await updateTVDisplay(editForm.id, updateData);
      setDisplays(displays.map(d => d.id === updatedDisplay.id ? updatedDisplay : d));
      setActiveDisplays(displays.filter((d: TVDisplay) => d.status === "online").length);
      toast.success('Display updated successfully');
    } catch (err: any) {
      setError("Failed to update display. Please try again.");
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
      setDeleteDialogOpen(false);
      setDisplayToDelete(null);
      setDisplays(displays.filter(d => d.id !== displayToDelete.id));
      setActiveDisplays(displays.filter((d: any) => d.status === "online").length - 1);
      toast.success('Display deleted successfully');
    } catch (err: any) {
      setError("Failed to delete display. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async (displayId: string) => {
    setRefreshing(true);
    try {
      const updatedDisplay = await updateDisplayStatus(displayId, 'online');
      setDisplays(displays.map(d => d.id === displayId ? updatedDisplay : d));
      setActiveDisplays(displays.filter((d: TVDisplay) => d.status === "online").length);
      toast.success('Display status updated');
    } catch (err: any) {
      setError("Failed to refresh display status. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleDisplay = async (display: TVDisplay) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = display.status === "online" ? "offline" : "online";
      const updatedDisplay = await updateDisplayStatus(display.id, newStatus);
      setDisplays(displays.map(d => d.id === updatedDisplay.id ? updatedDisplay : d));
      setActiveDisplays(prev => newStatus === "online" ? prev + 1 : prev - 1);
      toast.success('Display status updated');
    } catch (err: any) {
      setError("Failed to update display status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.type || !templateForm.description) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const template = await createContentTemplate({
        name: templateForm.name,
        type: templateForm.type,
        description: templateForm.description,
        active: templateForm.active ?? true,
        config: templateForm.config!,
        masjidId,
      });
      setTemplates([...templates, template]);
      setTemplateDialogOpen(false);
      setTemplateForm({
        name: "",
        type: "prayer",
        description: "",
        active: true,
        config: {
          layout: "default",
          refreshInterval: 30
        }
      });
      toast.success('Template created successfully');
    } catch (err: any) {
      setError("Failed to create template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplate = async (template: Content) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTemplate = await toggleContentTemplate(template.id, !template.active);
      setTemplates(templates.map(t => 
        t.id === updatedTemplate.id ? updatedTemplate : t
      ));
    } catch (err: any) {
      setError("Failed to update template status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateFormChange = (field: keyof ContentTemplate, value: any) => {
    setTemplateForm(prev => {
      if (field === 'config') {
        return {
          ...prev,
          config: {
            ...prev.config,
            ...value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Add connection status indicator
  const ConnectionStatus = () => {
    const hasActive = displays.some((d) => d.status === "online");
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${hasActive ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={hasActive ? 'text-green-600' : 'text-red-600'}>
          {hasActive ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">TV Displays</h2>
          <p className="text-[#3A3A3A]/70">
            Manage content on your masjid's display screens
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          {isAdmin && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Display
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Display</DialogTitle>
                  <DialogDescription>
                    Register a new display screen for your masjid.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDisplay} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input id="display-name" placeholder="Enter display name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="display-location">Location</Label>
                    <Input id="display-location" placeholder="Where is this display located?" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="display-content">Default Content</Label>
                    <select
                      id="display-content"
                      className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    >
                      <option value="prayer">Prayer Times</option>
                      <option value="announcements">Announcements</option>
                      <option value="events">Events Calendar</option>
                      <option value="donation">Donation Progress</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="display-notes">Notes</Label>
                    <Textarea
                      id="display-notes"
                      placeholder="Any additional information about this display"
                      className="min-h-[100px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-power" checked={form.autoPower} onCheckedChange={v => setForm(f => ({ ...f, autoPower: v }))} />
                    <Label htmlFor="auto-power">Enable auto power schedule</Label>
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-[#550C18] hover:bg-[#78001A] text-white"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Display"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
            disabled={refreshing}
          >
            <Tv className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Active Displays
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Currently online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {activeDisplays}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              Out of {displays.length} total displays
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Content Templates
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Available layouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {templates.length}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              {templates.filter((t) => t.active).length} currently active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Next Update
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Content refresh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">5:00 PM</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              Auto-updates every 30 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3A3A3A] w-full flex items-center gap-2 justify-between">
            Display Screens
            <Link href={`/dashboard/tv-displays/signage-config?masjidId=${masjidId}`}>
              <Button variant="outline">
                Display Screen Setup
              </Button>
            </Link>
          </CardTitle>
          <CardDescription className="text-[#3A3A3A]/70">
            Manage your masjid's display screens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="displays">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="displays">Display Screens</TabsTrigger>
              <TabsTrigger value="content">Content Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="displays" className="space-y-4">
              {displays.map((display) => (
                <div
                  key={display.id}
                  className="border border-[#550C18]/10 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                        <Monitor className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[#3A3A3A] text-lg">
                            {display.name}
                          </h3>
                          <Badge
                            className={
                              display.status === "online"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {display.status.charAt(0).toUpperCase() +
                              display.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Location: {display.location}
                        </p>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Content: {display.content} • Updated{" "}
                          {display.lastSeen ? display.lastSeen.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/tv-displays/signage-config?masjidId=${masjidId}&displayId=${display.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditForm({
                            ...display,
                            config: {
                              notes: display.config?.notes || "",
                              autoPower: display.config?.autoPower || false
                            }
                          });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setDisplayToDelete(display);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleToggleDisplay(display)}
                        disabled={loading}
                      >
                        {display.status === "online" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {displays.length === 0 && (
                <div className="text-center text-gray-500 mt-3 mb-3">No displays found, you can buy MizanTv from our store. Click <Link href="/products/mizantv" className="text-[#550C18] hover:text-[#78001A] underline" target="_blank">here</Link> to buy.</div>
              )}
            </TabsContent>
            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-[#550C18]/10 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-[100px] h-[60px] rounded-md bg-[#550C18]/10 flex items-center justify-center overflow-hidden">
                        <ImageIcon className="h-6 w-6 text-[#550C18]/50" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[#3A3A3A] text-lg">
                              {template.name}
                            </h3>
                            <Badge
                              className={
                                template.active ? "bg-green-500" : "bg-gray-500"
                              }
                            >
                              {template.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleToggleTemplate(template)}
                              disabled={loading}
                            >
                              {template.active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-[#3A3A3A]/70 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Display</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditDisplay} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-display-name">Display Name</Label>
                <Input 
                  id="edit-display-name" 
                  value={editForm?.name || ''} 
                  onChange={e => setEditForm(f => f ? ({ ...f, name: e.target.value }) : null)} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-display-location">Location</Label>
                <Input 
                  id="edit-display-location" 
                  value={editForm?.location || ''} 
                  onChange={e => setEditForm(f => f ? ({ ...f, location: e.target.value }) : null)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-display-notes">Notes</Label>
                <Textarea 
                  id="edit-display-notes" 
                  value={editForm?.config?.notes || ''} 
                  onChange={e => setEditForm(f => f ? ({ 
                    ...f, 
                    config: { 
                      ...(f.config || { notes: '', autoPower: false }), 
                      notes: e.target.value 
                    } 
                  }) : null)} 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-auto-power" 
                  checked={editForm?.config?.autoPower || false} 
                  onCheckedChange={v => setEditForm(f => f ? ({ 
                    ...f, 
                    config: { 
                      ...(f.config || { notes: '', autoPower: false }), 
                      autoPower: v 
                    } 
                  }) : null)} 
                />
                <Label htmlFor="edit-auto-power">Enable auto power schedule</Label>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Display</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete <b>{displayToDelete?.name}</b>? This action cannot be undone.</div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} type="button">Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={handleDeleteDisplay} type="button" disabled={loading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTemplate} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input id="template-name" placeholder="Enter template name" value={templateForm.name} onChange={e => handleTemplateFormChange('name', e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-type">Template Type</Label>
              <select
                id="template-type"
                className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                value={templateForm.type}
                onChange={e => handleTemplateFormChange('type', e.target.value)}
              >
                <option value="prayer">Prayer Times</option>
                <option value="announcement">Announcements</option>
                <option value="calendar">Events Calendar</option>
                <option value="donation">Donation Progress</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Enter template description"
                className="min-h-[100px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                value={templateForm.description}
                onChange={e => handleTemplateFormChange('description', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-active">Active</Label>
              <Switch id="template-active" checked={templateForm.active} onCheckedChange={v => handleTemplateFormChange('active', v)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-layout">Layout</Label>
              <select
                id="template-layout"
                className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                value={templateForm.config?.layout}
                onChange={e => handleTemplateFormChange('config', { layout: e.target.value })}
              >
                <option value="default">Default</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-refresh-interval">Refresh Interval</Label>
              <select
                id="template-refresh-interval"
                className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                value={templateForm.config?.refreshInterval}
                onChange={e => handleTemplateFormChange('config', { refreshInterval: parseInt(e.target.value) })}
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="300">300 minutes</option>
              </select>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <DialogFooter>
              <Button type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={loading}>
                {loading ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
