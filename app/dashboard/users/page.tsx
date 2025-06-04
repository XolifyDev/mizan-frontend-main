"use client";

import { useEffect, useState, useRef } from "react";
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Mail,
  UserPlus,
  ChevronDown,
  UserMinus,
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUsersByMasjid } from "@/lib/actions/user";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { filterSearchUsers } from "@/lib/actions/user";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { declineMasjidInvite, getPendingInvites, inviteUserToMasjid, removeUserFromMasjid } from "@/lib/actions/masjid";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const masjidId = useSearchParams().get("masjidId");
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [decliningLoading, setDecliningLoading] = useState(false);
  const [removingLoading, setRemovingLoading] = useState(false);
  const router = useRouter();
  const [removeUserModal, setRemoveUserModal] = useState(false);
  const [inviteUserModal, setInviteUserModal] = useState(false);
  const [pendingInvitesModal, setPendingInvitesModal] = useState(false);
  
  const fetchUsers = async () => {
    const users = await getUsersByMasjid(masjidId as string, session.user.id);
    setUsers(users);
    console.log(users);
    const pendingInvites = await getPendingInvites(masjidId as string);
    setPendingInvites(pendingInvites);
  }
  useEffect(() => {
    if (!session) return;
    fetchUsers();
  }, [masjidId, session]);

  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowUsers(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  const handleSearchUsers = async (value: string) => {
    if (!value || value.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await filterSearchUsers(value, masjidId as string, session)
      setSearchResults(results);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteUser = async () => {
    if (!selectedUser) return;
    const invite = await inviteUserToMasjid(masjidId as string, selectedUser.id, session?.user.id as string);
    if (invite.error) {
      toast({
        title: "Error",
        description: invite.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
      });
      router.refresh();
      setInviteUserModal(false);
      setSelectedUser(null);
      setEmailQuery("");
      setSearchQuery("");
      setSearchResults([]);
      setShowUsers(false);
      fetchUsers();
    }
  }

  const handleDeclineInvite = async (inviteId: string) => {
    setDecliningLoading(true);
    const invite = await declineMasjidInvite(inviteId);
    if (invite.error) {
      toast({
        title: "Error",
        description: invite.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Success",
      description: invite.message,
    });
    router.refresh();
    fetchUsers();
    setPendingInvites(pendingInvites.filter((invite) => invite.id !== inviteId));
    setDecliningLoading(false);
    setPendingInvitesModal(false);
  }

  const handleRemoveUser = async (userId: string) => {
    setRemovingLoading(true);
    const user = await removeUserFromMasjid(masjidId as string, userId);
    if (user.error) {
      toast({
        title: "Error",
        description: user.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: user.message,
      });
      router.refresh();
      fetchUsers();
      setRemovingLoading(false);
      setRemoveUserModal(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Users</h2>
          <p className="text-[#3A3A3A]/70">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={inviteUserModal} onOpenChange={setInviteUserModal}>
            <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
            >
              <Mail className="mr-2 h-4 w-4" />
              Invite Users
            </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
                <DialogDescription>
                  Invite a user to join your masjid management
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="user-email">Email</Label>
                <Popover open={showUsers} onOpenChange={setShowUsers}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      {selectedUser && <div className="flex flex-row justify-between w-full items-center">
                        <span>{selectedUser.email}</span>

                        <ChevronDown className="h-4 w-4" />
                      </div> || (
                        <div className="flex flex-row w-full justify-between items-center">
                          Enter email address
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput 
                        id="user-email"
                        placeholder="Enter email address"
                        value={emailQuery}
                        onValueChange={(value) => {
                          setEmailQuery(value);
                          if (!value) {
                            setShowUsers(false);
                          } else {
                            setShowUsers(true);
                          }
                          handleSearchUsers(value);
                        }}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {searchResults.map(user => (
                            <CommandItem
                              key={user.id}
                              value={user.email}
                              onSelect={() => {
                                setSelectedUser(user);
                                setShowUsers(false);
                              }}
                            >
                              <div className="flex items-center">
                                <span>{user.email}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleInviteUser}
                  className="bg-[#550C18] hover:bg-[#78001A] text-white"
                >
                  Invite User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={pendingInvitesModal} onOpenChange={setPendingInvitesModal}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                <Mail className="mr-2 h-4 w-4" />
                Pending Invites
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pending Invites</DialogTitle>
                <DialogDescription>View all pending invites sent to users</DialogDescription>
              </DialogHeader>
              <hr className="border-[#550C18]/40 shadow-sm shadow-[#550C18]/40" />
              <div className="space-y-4">
                {pendingInvites.map((invite) => {
                  const isExpired = new Date(invite.expiresAt) < new Date();
                  const isDeclined = invite.status === "declined";
                  const isDisabled = isExpired || isDeclined;
                  
                  return (
                    <div 
                      key={invite.token}
                      className={cn(
                        "p-4 rounded-lg border",
                        isDisabled ? "opacity-50 bg-gray-100" : "border-[#550C18]/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invite.invitedBy.name}</p>
                          <p className="text-sm text-gray-500">
                            {isExpired ? "Expired" : isDeclined ? "Declined" : "Pending"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-gray-500">
                            Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 p-0 ml-auto hover:bg-red-800 hover:text-white border-red-800",
                              decliningLoading && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => handleDeclineInvite(invite.id)}
                            disabled={decliningLoading}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {pendingInvites.length === 0 && (
                  <p className="text-center text-gray-500 mt-3 mb-3">No pending invites</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Users
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              All users under this masjid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {users.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Pending Invites
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
                Number of pending invites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {pendingInvites.length}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">Number of pending invites</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                User Management
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                View and manage user accounts
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
                <Input
                  placeholder="Search users..."
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
            <div className="grid grid-cols-3 p-4 bg-muted/50 text-sm font-medium">
              <div>User</div>
              <div>Email</div>
              <div>Actions</div>  
            </div>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-3 p-4 border-t hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                        {user.name.split(" ")[0]?.charAt(0) +
                          user.name.split(" ")[1]?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-[#3A3A3A]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[#3A3A3A]/70">
                        Since {user.masjidInvites
                          .filter((invite: any) => invite.masjidId === masjidId)
                          .sort((a: any, b: any) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())[0]
                          ?.joinDate.toLocaleDateString() || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm text-[#3A3A3A]">{user.email}</p>
                    <p className="text-xs text-[#3A3A3A]/70">{user.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={removeUserModal} onOpenChange={setRemoveUserModal}>
                      <DialogTrigger asChild>
                        {/* <TooltipProvider delayDuration={0}>
                           <Tooltip>
                            <TooltipTrigger asChild> */}
                              <Button
                                type="button"
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                aria-label="Remove User"
                                aria-placeholder="Remove User"
                                title="Remove User"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            {/* </TooltipTrigger>
                            <TooltipContent>
                              <span>Remove User</span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider> */}
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Remove User</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p>Are you sure you want to remove this user from the masjid?</p>
                        </div>
                        <div className="flex justify-end gap-3">
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button 
                            type="button"
                            variant="destructive" 
                            onClick={() => handleRemoveUser(user.id)} 
                            disabled={removingLoading}
                          >
                            Remove User
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 border-t">
                <Users className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                  No users found
                </h3>
                <p className="text-[#3A3A3A]/70 mb-4">
                  No users match your search criteria. Try adjusting your
                  search.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
