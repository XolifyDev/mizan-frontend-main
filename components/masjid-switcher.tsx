"use client"

import * as React from "react"
import { ChevronsUpDown, MapPin, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Masjid } from "@prisma/client"
import { User } from "better-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export function MasjidSwitcher({
  masjids,
  activeMasjid,
  user,
  setShowAddMasjidModal,
}: {
  masjids: Masjid[]
  activeMasjid: Masjid
  user: User
  setShowAddMasjidModal: (show: boolean) => void
}) {
  const router = useRouter()
  if (!activeMasjid) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-row items-center gap-2 cursor-pointer hover:text-sidebar-primary">
          <div className="text-sidebar-primary">
            <MapPin className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium text-lg">{activeMasjid.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto text-sidebar-primary" size={14} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side="top"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Masjids
        </DropdownMenuLabel>
        <DropdownMenuItem
            disabled={true}
            className="flex flex-row items-center gap-2 p-1 bg-[#550C18]/10 hover:bg-[#550C18]/10"
          >
            <span className="font-medium text-gray-500">{activeMasjid.name}</span>
            <span className="text-primary/60 text-xs ml-auto">Current</span>
        </DropdownMenuItem> 
        {masjids.filter((masjid) => masjid.id !== activeMasjid.id).map((masjid, index) => (
          <DropdownMenuItem
            key={masjid.id}
            onClick={() => router.push(`/dashboard?masjidId=${masjid.id}`)}
            className="flex flex-row items-center gap-2 p-1 hover:bg-[#550C18]/5"
          >
            <Avatar>
                <AvatarImage src={(masjid && masjid.logo) || undefined} />
                <AvatarFallback className="bg-[#550C18] text-[#FDF0D5]">
                    {masjid?.name || "Masjid"}
                </AvatarFallback>
            </Avatar>
            <span className="ml-auto">{masjid.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2" onClick={() => setShowAddMasjidModal(true)}>
          <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
            <Plus className="size-4" />
          </div>
          <div className="text-muted-foreground font-medium">Add masjid</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
