"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const [masjid, setMasjid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      if (!id) {
        console.log("No order ID provided");
        return router.push("/dashboard/orders");
      }
      const orderData = await fetch(`/api/orders/${id}`).then(async (res) => {
        if (!res.ok) {
          console.log("Error fetching order:", res.statusText);
          return router.push("/dashboard/orders");
        }
        return res.json();
      });

      if (!orderData || orderData.error) {
        console.log("No order data found");
        return router.push("/dashboard/orders");
      }

    setOrder(orderData);
    setCart(JSON.parse(orderData.cart));
      console.log(JSON.parse(orderData.cart))
    setMasjid(orderData.masjid);
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
      router.push("/dashboard/orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPending) return console.log("Loading...");
    if (!session)
      return router.push(
        "/signin?message=You need to login to access this page!"
      );
    fetchOrder();
  }, [isPending, id, session, router]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await updateOrder(order.id, { status, trackingNumber: tracking });
    await fetchOrder();
    setSaving(false);
  };

  if (isPending || !session || !order || isLoading)
    return <div className="p-8 text-center text-gray-400 1">Loading...</div>;

  return (
    <div className="px-12 py-8 flex flex-row gap-4">
      <Card className="bg-white border-[#550C18]/10 w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
            Order Details
          </CardTitle>
          <CardDescription className="text-[#3A3A3A]/70">
            View and update order information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex gap-4 items-center">
              <span className="font-medium whitespace-nowrap">Order ID:</span>
              <span className="group w-full text-sm relative p-2 border rounded-md flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
                {order.id}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.id);
                    const btn = document.activeElement as HTMLButtonElement;
                    // Use state instead of class
                    const tooltip = btn.querySelector(
                      ".tooltip"
                    ) as HTMLElement;
                    tooltip.style.opacity = "1";
                    const svg = btn.querySelector(
                      "svg"
                    ) as unknown as HTMLElement;
                    svg.style.color = "green";
                    svg.style.transform = "rotate(360deg)";
                    svg.style.transition = "transform 0.5s ease-in-out";
                    svg.style.boxShadow = "0 0 10px 0 rgba(0, 255, 0, 0.5)";
                    setTimeout(() => {
                      tooltip.style.opacity = "0";
                      svg.style.color = "currentColor";
                      svg.style.transform = "rotate(0deg)";
                      svg.style.boxShadow = "none";
                    }, 1000);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 p-1 hover:bg-gray-100 rounded relative"
                >
                  <span className="tooltip absolute top-[-25px] right-0 bg-black text-white px-2 py-1 rounded text-xs opacity-0 transition-opacity">
                    Copied!
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </button>
              </span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Customer:</span>
              <span>{order.user?.name || "-"}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Masjid:</span>
              <span>
                {order.masjid?.name || <span className="text-gray-400">—</span>}
              </span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Date:</span>
              <span>{new Date(order.createdAt).toLocaleString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}</span>
            </div>
            {paymentInfo && (
              <div className="">
                <span className="font-medium">Payment Info:</span>
                <div className="flex flex-col gap-1 mt-1 text-sm">
                  <span>
                    Amount:{" "}
                    <span className="font-semibold">
                      ${(paymentInfo.amount_total / 100).toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <span className="font-medium">Products:</span>
            <div className="mt-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {cart.map((item: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>
                        {item.name || item.productName || item.id} {item.size && `(${item.size})`}
                      </TableCell>
                      <TableCell className="ml-1">{item.quantity}</TableCell>
                      <TableCell>${item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {session?.user?.admin ? (
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tracking Number
                </label>
                <Input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  className="bg-[#550C18] hover:bg-[#78001A] text-white w-full"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <div className="p-2 border rounded-md capitalize">{status}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tracking Number
                </label>
                <div className="group relative p-2 border rounded-md flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
                  <span>{tracking || "-"}</span>
                  {tracking && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tracking);
                        const btn = document.activeElement as HTMLButtonElement;
                        // Use state instead of class
                        const tooltip = btn.querySelector(
                          ".tooltip"
                        ) as HTMLElement;
                        tooltip.style.opacity = "1";
                        const svg = btn.querySelector(
                          "svg"
                        ) as unknown as HTMLElement;
                        svg.style.color = "green";
                        svg.style.transform = "rotate(360deg)";
                        svg.style.transition = "transform 0.5s ease-in-out";
                        svg.style.boxShadow = "0 0 10px 0 rgba(0, 255, 0, 0.5)";
                        setTimeout(() => {
                          tooltip.style.opacity = "0";
                          svg.style.color = "currentColor";
                          svg.style.transform = "rotate(0deg)";
                          svg.style.boxShadow = "none";
                        }, 1000);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 p-1 hover:bg-gray-100 rounded relative"
                    >
                      <span className="tooltip absolute top-[-25px] right-0 bg-black text-white px-2 py-1 rounded text-xs opacity-0 transition-opacity">
                        Copied!
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    </button>
                  )}
              </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-white border-[#550C18]/10 w-3/4 h-fit">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
            Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tracking Details UI for non-admins */}
          {order.trackingDetails ? (
            <div className="relative mt-3 mx-auto">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="pl-8 mb-6">
                <div className="flex items-center mb-2">
                  <div className="absolute left-3 w-3 h-3 bg-primary rounded-full"></div>
                  <h4 className="font-medium text-lg">Current Status</h4>
                </div>
                <p
                  className={`text-sm ${
                    order.trackingDetails.status === "delivered"
                      ? "text-green-600"
                      : order.trackingDetails.status === "in_transit"
                        ? "text-blue-600"
                        : order.trackingDetails.status === "out_for_delivery"
                          ? "text-purple-600"
                          : order.trackingDetails.status === "failure" ||
                              order.trackingDetails.status === "error"
                            ? "text-red-600"
                            : "text-muted-foreground"
                  }`}
                >
                  {order.trackingDetails.status === "pre_transit"
                    ? "Pre-Transit"
                    : order.trackingDetails.status === "in_transit"
                      ? "In Transit"
                      : order.trackingDetails.status === "out_for_delivery"
                        ? "Out for Delivery"
                        : order.trackingDetails.status === "delivered"
                          ? "Delivered"
                          : order.trackingDetails.status ===
                              "available_for_pickup"
                            ? "Available for Pickup"
                            : order.trackingDetails.status ===
                                "return_to_sender"
                              ? "Return to Sender"
                              : order.trackingDetails.status === "failure"
                                ? "Failed"
                                : order.trackingDetails.status === "cancelled"
                                  ? "Cancelled"
                                  : order.trackingDetails.status === "error"
                                    ? "Error"
                                    : "Unknown"}
                </p>
                {order.trackingDetails.est_delivery_date && (
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground font-bold">
                      Expected delivery:
                    </p>
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      {new Date(
                        order.trackingDetails.est_delivery_date
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </p>
                  </div>
                )}
              </div>
              {order.trackingDetails.tracking_details &&
                order.trackingDetails.tracking_details.length > 0 && (
                  <div className="space-y-4">
                    {[...order.trackingDetails.tracking_details]
                      .reverse()
                      .map((detail: any, index: number) => (
                        <div key={index} className="pl-8 relative">
                          <div className="absolute left-3 w-3 h-3 bg-primary/60 rounded-full"></div>
                          <p className="text-sm font-medium">
                            {new Date(detail.datetime).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {detail.message}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
            </div>
          ) : order.trackingDetails && order.trackingDetails.error ? (
            <div className="flex items-center gap-2 text-red-500 p-4 bg-red-50 rounded-lg mt-8">
              <span className="text-sm">{order.trackingDetails.error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground p-4 bg-gray-50 rounded-lg mt-8">
              <span className="text-sm">No tracking information available</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
