"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Mail,
  UserPlus,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const users = [
    {
      id: 1,
      name: "Ahmed Hassan",
      email: "ahmed.h@example.com",
      phone: "+1 (555) 123-4567",
      role: "admin",
      status: "active",
      lastActive: "Today, 10:30 AM",
      joinDate: "2022-01-15",
    },
    {
      id: 2,
      name: "Sarah Ali",
      email: "sarah.a@example.com",
      phone: "+1 (555) 234-5678",
      role: "editor",
      status: "active",
      lastActive: "Yesterday, 3:45 PM",
      joinDate: "2022-03-22",
    },
    {
      id: 3,
      name: "Mohammed Khan",
      email: "m.khan@example.com",
      phone: "+1 (555) 345-6789",
      role: "viewer",
      status: "active",
      lastActive: "2 days ago",
      joinDate: "2022-05-10",
    },
    {
      id: 4,
      name: "Fatima Qureshi",
      email: "fatima.q@example.com",
      phone: "+1 (555) 456-7890",
      role: "editor",
      status: "inactive",
      lastActive: "2 weeks ago",
      joinDate: "2022-02-18",
    },
    {
      id: 5,
      name: "Yusuf Abdullah",
      email: "yusuf.a@example.com",
      phone: "+1 (555) 567-8901",
      role: "viewer",
      status: "pending",
      lastActive: "Never",
      joinDate: "2023-04-05",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and set their permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="user-firstname">First Name</Label>
                    <Input id="user-firstname" placeholder="Enter first name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user-lastname">Last Name</Label>
                    <Input id="user-lastname" placeholder="Enter last name" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user-phone">Phone Number</Label>
                  <Input id="user-phone" placeholder="Enter phone number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user-role">Role</Label>
                  <select
                    id="user-role"
                    className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user-password">Temporary Password</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Enter temporary password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#550C18] hover:bg-[#78001A] text-white"
                >
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          >
            <Mail className="mr-2 h-4 w-4" />
            Invite Users
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Users
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              All registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {users.length}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              {users.filter((u) => u.status === "active").length} active users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Admins
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Users with admin access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {users.filter((u) => u.role === "admin").length}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">Full system access</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              New Users
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">1</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              Pending approval: 1
            </p>
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
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
              <TabsTrigger value="editors">Editors</TabsTrigger>
              <TabsTrigger value="viewers">Viewers</TabsTrigger>
            </TabsList>
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-4 bg-muted/50 text-sm font-medium">
                <div>User</div>
                <div>Contact</div>
                <div>Role</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-5 p-4 border-t hover:bg-muted/20 transition-colors"
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
                          Since {user.joinDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-sm text-[#3A3A3A]">{user.email}</p>
                      <p className="text-xs text-[#3A3A3A]/70">{user.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-purple-500"
                            : user.role === "editor"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "border-green-500 text-green-500"
                            : user.status === "inactive"
                            ? "border-orange-500 text-orange-500"
                            : "border-blue-500 text-blue-500"
                        }
                      >
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
