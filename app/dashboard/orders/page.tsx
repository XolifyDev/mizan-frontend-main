"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import Link from "next/link";

const statusOptions = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      const data = await fetch("/api/orders").then(async (res) => {
        if(!res.ok) {
          console.log('Error fetching orders:', res.statusText);
          return [];
        }
        return res.json();
      });
      setOrders(data);
      setIsLoading(false);
    }
    fetchOrders();
  }, []);

  const openEditModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSave = (e: any) => {
    e.preventDefault();
    // Here you would update the order in state/backend
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Orders</CardTitle>
          <CardDescription className="text-[#3A3A3A]/70">Manage and update customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.user?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        let cart = [];
                        try { cart = JSON.parse(order.cart); } catch {}
                        return cart.map((p: any, i: number) => (
                          <Badge key={i} className="bg-[#550C18]/10 hover:text-white text-[#550C18] cursor-default">{p.name || p.productName || p.id}</Badge>
                        ));
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize cursor-default ${
                      order.status === "completed" ? "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-700" :
                      order.status === "processing" ? "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-700" :
                      order.status === "failed" ? "bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-700" :
                      "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-700"
                    }`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.trackingNumber || <span className="text-gray-400">—</span>}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">View/Edit</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Order Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium mb-1">Order ID</label>
              <Input value={selectedOrder?.id || ""} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <Input value={selectedOrder?.customer || ""} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select defaultValue={selectedOrder?.status || statusOptions[0]}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tracking Number</label>
              <Input defaultValue={selectedOrder?.tracking || ""} placeholder="Enter tracking number" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 