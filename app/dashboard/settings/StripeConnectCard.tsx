"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, CheckCircle2, AlertCircle, XCircle, Unplug } from "lucide-react";
import {
  createStripeConnectAccount,
  disconnectStripeAccount,
  getStripeConnectDashboardLink,
  refreshStripeAccountStatus,
} from "@/lib/actions/stripe-connect";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

interface Props {
  masjidId: string;
  stripeAccountId: string | null;
  stripeAccountStatus: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: {
    label: "Connected & Active",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  },
  pending: {
    label: "Pending Verification",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
  },
  onboarding: {
    label: "Setup Incomplete",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
  },
};

export function StripeConnectCard({ masjidId, stripeAccountId, stripeAccountStatus }: Props) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [status, setStatus] = useState(stripeAccountStatus);
  const [accountId, setAccountId] = useState(stripeAccountId);

  // Handle return from Stripe onboarding
  useEffect(() => {
    if (searchParams.get("connected") === "1" || searchParams.get("reconnect") === "1") {
      handleRefreshStatus();
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const returnUrl = `${origin}/dashboard/settings${masjidId ? `?masjidId=${masjidId}` : ""}`;
      const result = await createStripeConnectAccount(masjidId, returnUrl);
      if (result.error || !result.url) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
        return;
      }
      window.location.href = result.url;
    } finally {
      setLoading(false);
    }
  };

  const handleDashboard = async () => {
    setLoading(true);
    try {
      const result = await getStripeConnectDashboardLink(masjidId);
      if (result.error || !result.url) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
        return;
      }
      window.location.href = result.url;
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    const result = await refreshStripeAccountStatus(masjidId);
    if (!result.error && result.status) {
      setStatus(result.status);
      if (result.status === "active") {
        toast({ title: "Stripe account connected!" });
      }
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect your Stripe account? Kiosk payments will stop working until reconnected.")) return;
    setDisconnecting(true);
    try {
      await disconnectStripeAccount(masjidId);
      setAccountId(null);
      setStatus(null);
      toast({ title: "Stripe account disconnected" });
    } finally {
      setDisconnecting(false);
    }
  };

  const statusInfo = status ? statusConfig[status] : null;

  return (
    <div className="rounded-2xl border border-[#550C18]/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            {/* Stripe logo mark */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF] text-white text-xs font-bold tracking-tight">
              S
            </div>
            <h2 className="text-base font-semibold text-[#2e0c12]">Stripe Connect</h2>
          </div>
          <p className="mt-1.5 text-sm text-[#8b6f76] max-w-sm">
            Connect your Stripe account so kiosk donations go directly into your bank account. Mizan handles checkout; you keep full control of payouts.
          </p>
        </div>
        {statusInfo && (
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        )}
      </div>

      {accountId && (
        <div className="mt-4 rounded-xl border border-[#e8d8db] bg-[#fffafb] px-4 py-3">
          <p className="text-xs text-[#8b6f76] font-mono">Account ID: {accountId}</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {!accountId ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F46E5] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
              </svg>
            )}
            Connect Stripe Account
          </button>
        ) : (
          <>
            <button
              onClick={handleDashboard}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F46E5] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Open Stripe Dashboard
            </button>
            {(status === "onboarding" || status === "pending") && (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-[#635BFF] px-5 py-2.5 text-sm font-semibold text-[#635BFF] transition hover:bg-[#635BFF]/5 disabled:opacity-60"
              >
                Complete Setup
              </button>
            )}
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
              Disconnect
            </button>
          </>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-[#fffafb] border border-[#e8d8db] px-4 py-3 text-xs text-[#8b6f76] space-y-1">
        <p>• Donations collected via your kiosk go directly to your Stripe account</p>
        <p>• Mizan never holds your funds — payouts are controlled entirely by you</p>
        <p>• You'll need a Stripe account. <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-[#635BFF] underline">Create one free at stripe.com</a></p>
      </div>
    </div>
  );
}
