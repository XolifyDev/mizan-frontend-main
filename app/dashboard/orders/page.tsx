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
import { Input } from "@/components/ui/input";
import { Edit, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const masjidId = useSearchParams().get("masjidId") || "";

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      const data = await fetch(`/api/orders?masjidId=${masjidId}`).then(async (res) => {
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
  }, [masjidId]);

  const refreshOrders = async () => {
    setRefreshing(true);
    const data = await fetch(`/api/orders?masjidId=${masjidId}`).then(async (res) => {
      if(!res.ok) {
        return [];
      }
      return res.json();
    });
    setOrders(data);
    setRefreshing(false);
  };

  const filteredOrders = orders.filter((order) =>
    [order.id, order.user?.name, order.user?.email, order.status]
      .filter(Boolean)
      .some((value: string) => value.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Orders
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Track hardware and subscription fulfillment.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Review recent purchases, update statuses, and keep donors informed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              onClick={refreshOrders}
            >
              {refreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-white border-[#550C18]/10 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-[#2e0c12]">Orders</CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Manage and update customer orders
              </CardDescription>
            </div>
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
              <Input
                placeholder="Search orders..."
                className="pl-10 border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No orders found.</div>
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
                {filteredOrders.map((order) => (
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
                      <Link href={`/dashboard/orders/${order.id}?masjidId=${masjidId}`}>
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

    </div>
  );
} 
