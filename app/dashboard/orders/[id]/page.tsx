"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById, updateOrder, getSessionAndOrder } from "@/lib/actions/order";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusOptions = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchOrder() {
      const o = await getOrderById(id as string);
      setOrder(o);
      setStatus(o?.status || "");
      setTracking(o?.trackingNumber || "");
      // Fetch payment info if available
      if (o?.stripeSessionId) {
        const payment = await getSessionAndOrder(o.stripeSessionId);
        setPaymentInfo(payment.stripeSession);
      }
    }
    fetchOrder();
  }, [id]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await updateOrder(order.id, { status, trackingNumber: tracking });
    setSaving(false);
  };

  if (!order) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  // Parse cart for product info and masjid if available
  let cart = [];
  let masjid = null;
  try {
    cart = JSON.parse(order.cart);
    masjid = cart[0]?.masjidName || cart[0]?.masjid || null;
  } catch {}

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Order Details</CardTitle>
          <CardDescription className="text-[#3A3A3A]/70">View and update order information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <span className="font-medium">Order ID:</span>
              <span>{order.id}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Customer:</span>
              <span>{order.user?.name || "-"}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Masjid:</span>
              <span>{masjid || <span className="text-gray-400">—</span>}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Date:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <span className="font-medium">Products:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {cart.map((item: any, i: number) => (
                <Badge key={i} className="bg-[#550C18]/10 text-[#550C18]">
                  {item.name || item.productName || item.id}
                </Badge>
              ))}
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tracking Number</label>
              <Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking number" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => window.history.back()}>Back</Button>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
          {paymentInfo && (
            <div className="mt-6">
              <span className="font-medium">Payment Info:</span>
              <div className="flex flex-col gap-1 mt-1 text-sm">
                <span>Amount: <span className="font-semibold">${(paymentInfo.amount_total / 100).toFixed(2)}</span></span>
                <span>Date: <span className="font-semibold">{new Date(paymentInfo.created * 1000).toLocaleString()}</span></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 