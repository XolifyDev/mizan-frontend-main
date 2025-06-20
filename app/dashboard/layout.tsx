"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { Masjid } from "@prisma/client";
import { getUserMasjid } from "@/lib/actions/masjid";
import { CreateMasjidForm } from "@/components/dashboard/create-masjid-form";
import { ProgressProvider } from "@bprogress/next/app";
import { Toaster } from "@/components/ui/toaster";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loadingMasjid, setLoadingMasjid] = useState(true);
  const [masjidCreatedStep, setMasjidCreationStep] = useState<number>(0);
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId");
  const [showAddMasjidModal, setShowAddMasjidModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if(isPending) return;
    if(!session) return router.push("/signin?message=You need to login to access this page!");
  }, [isPending, session, router]); 

  useEffect(() => {
    const fetchMasjid = async () => {
      if(isPending || !session) return;
      const userMasjid = await getUserMasjid(masjidId || "");

      if (!userMasjid) {
        setMasjid(null);
        setShowAddMasjidModal(true);
        setMasjidCreationStep(1);
        setLoadingMasjid(false);
        return;
      }
      setMasjid(userMasjid as Masjid);
      const params = new URLSearchParams(searchParams);
      params.set("masjidId", userMasjid?.id || "");
      window.history.pushState(null, "", `?${params.toString()}`);
      setLoadingMasjid(false);
    };

    fetchMasjid();
  }, [isPending, pathname, masjidId]);
  if (isPending || loadingMasjid)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
        </div>
      </div>
    );

  if(!session) return <>Loading...</>
  return (
    <>
      <ProgressProvider
        height="4px"
        color="#550C18"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <Toaster />
        {masjid ? (
          <Dialog open={showAddMasjidModal} onOpenChange={setShowAddMasjidModal}>
            <DialogTrigger>Open</DialogTrigger>
            {masjidCreatedStep === 1 && (
              <CreateMasjidForm
                isOpen={true}
                onClose={() => {}}
                onSuccess={() => {}}
              />
            )}
            {masjidCreatedStep === 0 && (
              <DialogContent>
                <div className="flex flex-col items-center text-center pb-2">
                  <div className="h-16 w-16 rounded-full bg-[#550C18]/10 flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-[#550C18]" />
                  </div>
                  <DialogHeader className="mb-2">
                    <DialogTitle className="text-2xl font-bold text-[#550C18]">
                      {masjid ? "Add a new masjid" : "No Masjid Setup"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex items-start gap-2 bg-red-50 p-4 rounded-md mb-6 text-left">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm text-center">
                      To move forward you must create a masjid under your
                      account first. Or be added to an organization.
                    </p>
                  </div>
                  <DialogFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddMasjidModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setMasjidCreationStep(1)}
                      className="bg-[#550C18] hover:bg-[#78001A] text-white text-base font-medium rounded-md transition-all duration-200 hover:shadow-md"
                    >
                      Create Masjid
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            )}
          </Dialog>
        ) : (
          <AlertDialog open={showAddMasjidModal} onOpenChange={setShowAddMasjidModal}>
            <AlertDialogTrigger>Open</AlertDialogTrigger>
            {masjidCreatedStep === 1 && (
              <CreateMasjidForm
                isOpen={true}
                onClose={() => {}}
                onSuccess={() => {}}
              />
            )}
            {masjidCreatedStep === 0 && (
              <AlertDialogContent>
                <div className="flex flex-col items-center text-center pb-2">
                  <div className="h-16 w-16 rounded-full bg-[#550C18]/10 flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-[#550C18]" />
                  </div>
                  <AlertDialogHeader className="mb-2">
                    <AlertDialogTitle className="text-2xl font-bold text-[#550C18]">
                      {masjid ? "Add a new masjid" : "No Masjid Setup"}
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="flex items-start gap-2 bg-red-50 p-4 rounded-md mb-6 text-left">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm text-center">
                      To move forward you must create a masjid under your
                      account first. Or be added to an organization.
                    </p>
                  </div>
                  <Button
                    onClick={() => setMasjidCreationStep(1)}
                    className="bg-[#550C18] hover:bg-[#78001A] text-white text-base font-medium rounded-md transition-all duration-200 hover:shadow-md"
                  >
                    Create Masjid
                  </Button>
                </div>
              </AlertDialogContent>
            )}
          </AlertDialog>
        )}
        <DashboardSidebar
          session={session}
          isPending={isPending}
          masjid={masjid as Masjid}
          setShowAddMasjidModal={setShowAddMasjidModal}
        >
          {children}
        </DashboardSidebar>
      </ProgressProvider>
    </>
  );
}
