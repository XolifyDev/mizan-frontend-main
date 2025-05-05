"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { updateMasjid } from "@/lib/actions/masjids";
import { Calendar, CloudOff, Settings, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface GoogleCalendarSettingsProps {
  masjidId: string;
  currentCalendarId: string;
  currentCalendarPfp: string;
}

export function GoogleCalendarSettings({ masjidId, currentCalendarId, currentCalendarPfp }: GoogleCalendarSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Redirect to Google OAuth consent screen
      const response = await fetch(`/api/google/calendar/auth?masjidId=${masjidId}`);
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get Google OAuth URL');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await updateMasjid(masjidId, {
        googleCalendarId: "",
        googleCalendarCredentials: null,
      });
      
      toast({
        title: "Success",
        description: "Disconnected from Google Calendar",
      });
      await fetch("/api/revalidate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect from Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-3/4 md:w-3/4 lg:w-1/2 xl:w-1/3 2xl:w-2/4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Settings
          </DialogTitle>
          <DialogDescription className="text-center text-primary">
            Connect your masjid's Google Calendar to automatically sync events
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            {currentCalendarId ? (
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    width={120}
                    height={120}
                    src={`${currentCalendarPfp}`}
                    alt="Google Account"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Connected to Google Calendar</p>
                  <p className="text-sm text-muted-foreground">Calendar syncing is active</p>
                  <p className="text-sm text-muted-foreground flex flex-row gap-2">Connected to <span className="text-primary">{currentCalendarId}</span></p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-lg border border-dashed p-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Not Connected</p>
                  <p className="text-sm text-muted-foreground">Connect your Google Calendar to sync events</p>
                </div>
              </div>
            )}
          </div>
          
          {currentCalendarId ? (
            <Button
              variant="default"
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              <CloudOff className="h-4 w-4" />
              Disconnect Calendar
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isLoading}
            >
              Connect Google Calendar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 