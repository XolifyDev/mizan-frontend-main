"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function GoogleCalendarCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state"); // This is the masjidId

      if (!code || !state) {
        toast({
          title: "Error",
          description: "Missing required parameters",
          variant: "destructive",
        });
        router.push("/dashboard/events");
        return;
      }

      try {
        const response = await fetch("/api/google/calendar/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          throw new Error("Failed to handle OAuth callback");
        }

        toast({
          title: "Success",
          description: "Successfully connected to Google Calendar",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to connect to Google Calendar",
          variant: "destructive",
        });
      } finally {
        router.push("/dashboard/events");
      }
    };

    handleCallback();
  }, [searchParams, router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
        </div>
        <h1 className="text-2xl font-bold text-[#550C18]">Connecting to Google Calendar...</h1>
        <p className="text-muted-foreground">
          Please wait while we connect your calendar.
        </p>
      </div>
    </div>
  );
} 