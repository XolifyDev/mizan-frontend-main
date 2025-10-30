"use client";

import { useState, useEffect, useCallback } from "react";
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
  Wifi,
  WifiOff,
  Smartphone,
  Globe,
  Square,
  AlertTriangle,
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
import { getAllTVDisplays, createTVDisplay, updateTVDisplay, deleteTVDisplay, assignContentToDisplay, updateDisplayStatus, getTVDisplaysByStatus } from "@/lib/actions/tvdisplays";
import { getAllContentTemplatesIncludingInactive, createContentTemplate, updateContentTemplate, deleteContentTemplate, toggleContentTemplate } from "@/lib/actions/content-templates";
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWebSocketContext } from "@/components/WebSocketProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TVDisplay, Content, TVDisplayForm, TVDisplayUpdate, ContentTemplate, DisplayStatus, ContentType, Platform } from "@/lib/types/display";

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

  // Track if admin subscription has been received
  const [adminSubscribed, setAdminSubscribed] = useState(false);

  // WebSocket integration - simplified
  const onConnect = useCallback(() => {
    console.log('WebSocket connected for admin dashboard');
    toast.success('Real-time connection established');
  }, []);

  const onDisconnect = useCallback(() => {
    console.log('WebSocket disconnected');
    setAdminSubscribed(false);
    toast.error('Real-time connection lost');
  }, []);

  const onError = useCallback((error: any) => {
    console.error('WebSocket error:', error);
    toast.error('WebSocket connection error');
  }, []);

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching displays for masjid:', masjidId);
      const displaysData = await getAllTVDisplays(masjidId);
      console.log('Displays data:', displaysData);
      
      const templatesData = await getAllContentTemplatesIncludingInactive(masjidId);
      console.log('Templates data:', templatesData);
      
      // Fetch MizanTV devices (fallback for non-WebSocket devices)
      const mizanTvDevicesResponse = await fetch(`/api/admin/masjids/${masjidId}/devices`);
      let mizanTvDevices: TVDisplay[] = [];
      
      if (mizanTvDevicesResponse.ok) {
        const mizanTvData = await mizanTvDevicesResponse.json();
        console.log('MizanTV devices data:', mizanTvData);
        mizanTvDevices = mizanTvData.devices.map((device: any) => ({
          ...device,
          lastSeen: device.lastSeen ? new Date(device.lastSeen) : null,
          registeredAt: device.registeredAt ? new Date(device.registeredAt) : null,
          createdAt: new Date(device.createdAt),
          updatedAt: new Date(device.updatedAt),
        }));
      }
      
      // Combine regular displays and MizanTV devices with deduplication
      const allDevicesMap = new Map();
      
      // Add regular displays
      displaysData.forEach(display => {
        allDevicesMap.set(display.id, display);
      });
      
      // Add MizanTV devices (will overwrite if same ID exists)
      mizanTvDevices.forEach(device => {
        // Convert device to proper TVDisplay format
        const convertedDevice: TVDisplay = {
          ...device,
          platform: device.platform || null,
          model: device.model || null,
          osVersion: device.osVersion || null,
          appVersion: device.appVersion || null,
          buildNumber: device.buildNumber || null,
          installationId: device.installationId || null,
          networkStatus: device.networkStatus || null,
          registeredAt: device.registeredAt || null,
          status: device.status as DisplayStatus,
        };
        allDevicesMap.set(device.id, convertedDevice);
      });
      
      const allDisplays = Array.from(allDevicesMap.values());
      console.log('All displays after combining:', allDisplays);
      
      setDisplays(allDisplays);
      // Convert templates to proper format
      const convertedTemplates = templatesData.map(template => ({
        ...template,
        zones: Array.isArray(template.zones) ? template.zones : [template.zones].filter(Boolean),
      }));
      setTemplates(convertedTemplates);
      setActiveDisplays(allDisplays.filter((d: TVDisplay) => d.status === "online").length);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Failed to fetch data. Please try again.");
    }
  }, [masjidId]);

  const {
    isConnected: wsConnected,
    isConnecting: wsConnecting,
    error: wsError,
    sendMessage,
    devices: wsDevices
  } = useWebSocketContext();

  // Add timeout to clear connecting status after 10 seconds
  useEffect(() => {
    if (wsConnecting && !wsConnected) {
      const timeout = setTimeout(() => {
        console.log('WebSocket connecting timeout - clearing connecting status');
        // Force clear connecting status after 10 seconds
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [wsConnecting, wsConnected]);

  // Update displays when WebSocket devices change
  useEffect(() => {
    if (wsDevices && wsDevices.length > 0) {
      console.log('Updating displays with WebSocket devices:', wsDevices);
      setDisplays(wsDevices);
      setActiveDisplays(wsDevices.filter(d => d.status === "online").length);
      setAdminSubscribed(true);
    }
  }, [wsDevices]);

  useEffect(() => {
    console.log('TV Displays - masjidId:', masjidId);
    console.log('TV Displays - wsConnected:', wsConnected);
    console.log('TV Displays - wsConnecting:', wsConnecting);
    console.log('TV Displays - wsError:', wsError);
    console.log('TV Displays - displays count:', displays.length);
    
    if (masjidId && !wsConnected) {
      console.log('Fetching data for masjid (no WebSocket):', masjidId);
      fetchData();
    }
  }, [masjidId, wsConnected, wsConnecting, wsError]);

  // Log SSE connection status
  useEffect(() => {
    console.log('SSE connection status:', { wsConnected, wsConnecting, wsError });
  }, [wsConnected, wsConnecting, wsError]);

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
      const updatedDisplay = await updateDisplayStatus(displayId, 'online' as DisplayStatus);
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

  // Handle device control actions
  const handleRestartDevice = async (deviceId: string) => {
    try {
      await sendMessage({
        type: 'admin_device_control',
        deviceId,
        action: 'restart',
        data: {}
      });
      toast.success(`Restart command sent to device ${deviceId}`);
    } catch (error) {
      console.error('Failed to restart device:', error);
      toast.error('Failed to restart device');
    }
  };

  const handleStopDevice = async (deviceId: string) => {
    try {
      await sendMessage({
        type: 'admin_device_control',
        deviceId,
        action: 'stop',
        data: {}
      });
      toast.success(`Stop command sent to device ${deviceId}`);
    } catch (error) {
      console.error('Failed to stop device:', error);
      toast.error('Failed to stop device');
    }
  };

  const handleStartDevice = async (deviceId: string) => {
    try {
      await sendMessage({
        type: 'admin_device_control',
        deviceId,
        action: 'start',
        data: {}
      });
      toast.success(`Start command sent to device ${deviceId}`);
    } catch (error) {
      console.error('Failed to start device:', error);
      toast.error('Failed to start device');
    }
  };

  const handleBroadcastMessage = async () => {
    try {
      await sendMessage({
        type: 'admin_broadcast',
        masjidId: masjidId || "",
        message: 'Test broadcast message from admin dashboard',
        data: { type: "info" }
      });
      toast.success('Broadcast message sent to all devices');
    } catch (error) {
      console.error('Failed to broadcast message:', error);
      toast.error('Failed to broadcast message');
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform?: Platform) => {
    switch (platform?.toLowerCase()) {
      case 'ios':
        return <Smartphone className="h-4 w-4" />;
      case 'android':
        return <Smartphone className="h-4 w-4" />;
      case 'web':
        return <Globe className="h-4 w-4" />;
      case 'windows':
      case 'macos':
      case 'linux':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: DisplayStatus, networkStatus?: string) => {
    const isOnline = status === 'online';
    const isRestarting = status === 'restarting';
    const isStopped = status === 'stopped';
    const isError = status === 'error';
    // Assume connected if online and no specific network status, or if networkStatus is 'connected'
    const isConnected = isOnline && (networkStatus === 'connected' || !networkStatus);
    
    let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
    let badgeText = status.charAt(0).toUpperCase() + status.slice(1);
    
    if (isOnline) {
      badgeVariant = "default";
      badgeText = "Online";
    } else if (isRestarting) {
      badgeVariant = "destructive";
      badgeText = "Restarting";
    } else if (isStopped) {
      badgeVariant = "destructive";
      badgeText = "Stopped";
    } else if (isError) {
      badgeVariant = "destructive";
      badgeText = "Error";
    }
    
    return (
      <div className="flex items-center gap-1">
        <Badge variant={badgeVariant}>
          {badgeText}
        </Badge>
        {isOnline && (
          <div className="flex items-center">
            {isConnected ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  // Format last seen
  const formatLastSeen = (lastSeen: Date | string | null) => {
    if (!lastSeen) return 'Never';
    
    // Convert to Date object if it's a string
    const lastSeenDate = typeof lastSeen === 'string' 
      ? new Date(lastSeen) 
      : lastSeen;
    
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Format content type
  const formatContentType = (contentType?: ContentType | string) => {
    if (!contentType || contentType === 'unknown') return 'Mixed Content';
    
    switch (contentType.toLowerCase()) {
      case 'prayer':
      case 'prayer_times':
        return 'Prayer Times';
      case 'announcement':
      case 'announcements':
        return 'Announcements';
      case 'daily_verse':
        return 'Daily Verse';
      case 'daily_hadith':
        return 'Daily Hadith';
      case 'daily_dua':
        return 'Daily Dua';
      case 'eid_countdown':
        return 'Eid Countdown';
      case 'ramadan_countdown':
        return 'Ramadan Countdown';
      case 'taraweeh_timings':
        return 'Taraweeh Timings';
      case 'google_calendar':
        return 'Calendar Events';
      case 'donation':
        return 'Donation Progress';
      case 'image':
        return 'Image Display';
      case 'video':
        return 'Video Display';
      case 'countdown':
        return 'Countdown';
      case 'website':
        return 'Website';
      case 'custom':
        return 'Custom Content';
      case 'content':
        return 'Content Slide';
      default:
        return typeof contentType === 'string' 
          ? contentType.charAt(0).toUpperCase() + contentType.slice(1).replace(/_/g, ' ')
          : 'Unknown Content';
    }
  };

  // Check if content was updated recently (within last 5 minutes)
  const isContentRecentlyUpdated = (lastContentUpdate?: Date | string | null) => {
    if (!lastContentUpdate) return false;
    
    // Convert to Date object if it's a string
    const lastUpdateDate = typeof lastContentUpdate === 'string' 
      ? new Date(lastContentUpdate) 
      : lastContentUpdate;
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdateDate.getTime();
    return diffMs < 5 * 60 * 1000; // 5 minutes
  };

  // WebSocket connection status indicator
  const WebSocketStatus = () => {
    const shouldShowConnecting = wsConnecting && !wsConnected && displays.length === 0 && !adminSubscribed;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : shouldShowConnecting ? 'bg-yellow-500' : 'bg-red-500'}`} />
        <span className={wsConnected ? 'text-green-600' : shouldShowConnecting ? 'text-yellow-600' : 'text-red-600'}>
          {wsConnected ? 'Connected' : shouldShowConnecting ? 'Connecting...' : 'Disconnected'}
        </span>
        {wsError && (
          <span className="text-red-500 text-xs ml-2" title={wsError}>
            Error: {wsError}
          </span>
        )}
        {!masjidId && (
          <span className="text-orange-500 text-xs ml-2">
            No masjidId
          </span>
        )}
      </div>
    );
  };

  // Device connection status indicator
  const ConnectionStatus = () => {
    const onlineDevices = displays.filter((d) => d.status === "online").length;
    const restartingDevices = displays.filter((d) => d.status === "restarting").length;
    const stoppedDevices = displays.filter((d) => d.status === "stopped").length;
    const errorDevices = displays.filter((d) => d.status === "error").length;
    const hasActive = onlineDevices > 0;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${hasActive ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={[hasActive ? 'text-green-600' : 'text-red-600', "w-auto"].join(' ')}>
          {hasActive 
            ? `${onlineDevices} ${onlineDevices < 2 ? "Device" : "Devices"} Online`
            : restartingDevices > 0 
              ? `${restartingDevices} ${restartingDevices < 2 ? "Device" : "Devices"} Restarting`
              : stoppedDevices > 0
                ? `${stoppedDevices} ${stoppedDevices < 2 ? "Device" : "Devices"} Stopped`
                : errorDevices > 0
                  ? `${errorDevices} ${errorDevices < 2 ? "Device" : "Devices"} Error`
                  : 'No Devices Online'
          }
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading displays...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">TV Displays</h2>
          <p className="text-[#3A3A3A]/70">
            Manage content on your masjid's display screens
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WebSocketStatus />
          <ConnectionStatus />
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
          {wsConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBroadcastMessage}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              Send Test Broadcast
            </Button>
          )}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('Current displays data:', displays);
              console.log('Active displays count:', activeDisplays);
              console.log('WebSocket connected:', wsConnected);
              console.log('WebSocket connecting:', wsConnecting);
              console.log('WebSocket error:', wsError);
            }}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            Debug Data
          </Button> */}
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
              {displays
                .filter((display, index, self) => 
                  // Remove duplicates based on ID
                  index === self.findIndex(d => d.id === display.id)
                )
                .sort((a, b) => {
                  // Sort by status (online first), then by name
                  if (a.status === 'online' && b.status !== 'online') return -1;
                  if (a.status !== 'online' && b.status === 'online') return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((display) => (
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
                          {getStatusBadge(display.status as DisplayStatus, display.networkStatus || undefined)}
                          {display.platform && (
                            <Badge className="bg-blue-100 text-blue-800">
                              MizanTV
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Location: {display.location || 'Not specified'}
                        </p>
                        {display.platform || display.id?.includes('mizantv') ? (
                          <div className="space-y-1">
                            <p className="text-sm text-[#3A3A3A]/70">
                              Device ID: <code className="bg-gray-100 px-1 rounded text-xs">{display.id}</code>
                            </p>
                            <p className="text-sm text-[#3A3A3A]/70">
                              Platform: {display.platform || 'android'} • Model: {display.model || 'Unknown'}
                            </p>
                            <p className="text-sm text-[#3A3A3A]/70">
                              App: v{display.appVersion || '1.0.0'} • Network: {display.networkStatus || 'connected'}
                            </p>
                            <p className="text-sm text-[#3A3A3A]/70">
                              Last seen: {formatLastSeen(display.lastSeen)}
                              {display.registeredAt && (
                                <span> • Registered: {new Date(display.registeredAt).toLocaleDateString()}</span>
                              )}
                            </p>
                            <p className={`text-sm ${isContentRecentlyUpdated(display.lastContentUpdate) ? 'text-green-600 font-medium' : 'text-[#3A3A3A]/70'}`}>
                              Content: {formatContentType(display.content)} • Updated {formatLastSeen(display.lastContentUpdate || display.lastSeen)}
                              {isContentRecentlyUpdated(display.lastContentUpdate) && ' • Live'}
                            </p>
                          </div>
                        ) : (
                          <p className={`text-sm ${isContentRecentlyUpdated(display.lastContentUpdate) ? 'text-green-600 font-medium' : 'text-[#3A3A3A]/70'}`}>
                            Content: {formatContentType(display.content)} • Updated {formatLastSeen(display.lastContentUpdate || display.lastSeen)}
                            {isContentRecentlyUpdated(display.lastContentUpdate) && ' • Live'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                          <Link href={`/dashboard/tv-displays/signage-config?masjidId=${masjidId}&displayId=${display.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Display slides settings</p>
                        </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit display settings</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete display</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* <Button
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
                      </Button> */}
                      
                      {/* WebSocket Device Controls - Only show for MizanTV devices */}
                      {display.platform && (
                        <>
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 border-orange-500 text-orange-600 hover:bg-orange-50"
                                  onClick={() => handleRestartDevice(display.id)}
                                  disabled={display.status !== "online"}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Restart device</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 border-red-500 text-red-600 hover:bg-red-50"
                                  onClick={() => handleStopDevice(display.id)}
                                  disabled={display.status !== "online"}
                                >
                                  <Square className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Stop device</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={() => handleStartDevice(display.id)}
                                  disabled={display.status === "online"}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Start device</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {displays.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Tv className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No displays found</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Get started by adding a display or purchasing MizanTV from our store.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {isAdmin && (
                      <Button
                        onClick={() => setAddDialogOpen(true)}
                        className="bg-[#550C18] hover:bg-[#78001A] text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Display
                      </Button>
                    )}
                    <Button variant="outline" asChild>
                      <Link href="/products/mizantv" target="_blank">
                        <Tv className="h-4 w-4 mr-2" />
                        Buy MizanTV
                      </Link>
                    </Button>
                  </div>
                </div>
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
    </ErrorBoundary>
  );
}
