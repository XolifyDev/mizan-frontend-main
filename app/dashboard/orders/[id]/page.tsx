"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  updateOrder,
  getSessionAndOrder,
  getPaymentAndOrder,
} from "@/lib/actions/order";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusOptions = ["processing", "shipped", "delivered", "cancelled"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [cart, setCart] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const masjidId = useSearchParams().get("masjidId") || "";

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      if (!id) {
        return router.push(`/dashboard/orders?masjidId=${masjidId}`);
      }
      const orderData = await fetch(`/api/orders/${id}`).then(async (res) => {
        if (!res.ok) {
          return router.push(`/dashboard/orders?masjidId=${masjidId}`);
        }
        return res.json();
      });

      if (!orderData || orderData.error) {
        return router.push(`/dashboard/orders?masjidId=${masjidId}`);
      }

      setOrder(orderData);
      setCart(JSON.parse(orderData.cart));
      setStatus(orderData.status);
      setTracking(orderData.trackingNumber || "");

      if (orderData.stripeSessionId) {
        try {
          if (orderData.stripeSessionId.includes("cs_")) {
            const payment = await getSessionAndOrder(orderData.stripeSessionId);
            setPaymentInfo(payment.stripeSession);
          } else {
            const payment = await getPaymentAndOrder(orderData.stripeSessionId);
            setPaymentInfo(payment.stripeSession);
          }
        } catch (error) {
          console.error("Error fetching payment info:", error);
        }
      }
    } catch (error) {
      console.error("Error in fetchOrder:", error);
      router.push(`/dashboard/orders?masjidId=${masjidId}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/signin?message=You need to login to access this page!");
      return;
    }
    fetchOrder();
  }, [isPending, id, session, router]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await updateOrder(order.id, { status, trackingNumber: tracking });
    await fetchOrder();
    setSaving(false);
  };

  if (isPending || !session || !order || isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Order Details
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Order {order.id}
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2">
              Review fulfillment, payment, and line items for this order.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/orders?masjidId=${masjidId}`)}
            >
              Back to Orders
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#550C18] hover:bg-[#78001A] text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white border-[#550C18]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#2e0c12]">
              Summary
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Customer and order metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#3A3A3A]/70">Customer</span>
              <span className="font-medium text-[#2e0c12]">{order.user?.name || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#3A3A3A]/70">Masjid</span>
              <span className="font-medium text-[#2e0c12]">{order.masjid?.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#3A3A3A]/70">Placed</span>
              <span className="font-medium text-[#2e0c12]">
                {new Date(order.createdAt).toLocaleString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </span>
            </div>
            {paymentInfo && (
              <div className="flex items-center justify-between">
                <span className="text-[#3A3A3A]/70">Amount</span>
                <span className="font-medium text-[#2e0c12]">
                  ${(paymentInfo.amount_total / 100).toFixed(2)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#2e0c12]">
              Fulfillment
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Update status and tracking details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="capitalize">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option} className="capitalize">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tracking Number</label>
              <Input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white border-[#550C18]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#2e0c12]">Items</CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Products purchased in this order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name || item.productName || item.id}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>{item.size || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#2e0c12]">Payment</CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Stripe checkout details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#3A3A3A]/70">Amount</span>
              <span className="font-medium text-[#2e0c12]">
                {paymentInfo?.amount_total ? `$${(paymentInfo.amount_total / 100).toFixed(2)}` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#3A3A3A]/70">Payment Date</span>
              <span className="font-medium text-[#2e0c12]">
                {paymentInfo?.created ? new Date(paymentInfo.created * 1000).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#3A3A3A]/70">Session</span>
              <span className="font-medium text-[#2e0c12] break-all">
                {order.stripeSessionId || "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
