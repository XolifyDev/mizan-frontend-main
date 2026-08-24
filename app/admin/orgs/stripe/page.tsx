import { prisma } from "@/lib/db";
import { stripeClient } from "@/lib/stripe";
import { CheckCircle2, AlertCircle, XCircle, ExternalLink } from "lucide-react";

export default async function AdminOrgsStripePage() {
  const orgs = await prisma.masjid.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, logo: true, city: true, country: true,
      stripeAccountId: true, stripeAccountStatus: true,
      stripeFlatFee: true, stripePercentageFee: true,
      email: true,
    },
  });

  // Fetch live balance for connected accounts
  const withBalance = await Promise.all(
    orgs.map(async (org) => {
      if (!org.stripeAccountId) return { ...org, balance: null };
      try {
        const balance = await stripeClient.balance.retrieve({ stripeAccount: org.stripeAccountId });
        const avail = balance.available.find((b) => b.currency === "usd");
        return { ...org, balance: avail?.amount ?? 0 };
      } catch {
        return { ...org, balance: null };
      }
    })
  );

  const connected = withBalance.filter((o) => o.stripeAccountId);
  const notConnected = withBalance.filter((o) => !o.stripeAccountId);

  const statusIcon = (status: string | null) => {
    if (status === "active") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (status === "pending") return <AlertCircle className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-gray-400" />;
  };

  const statusLabel = (status: string | null) => {
    const map: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      onboarding: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[status ?? ""] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
        {statusIcon(status)}
        {status ?? "Not connected"}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2e0c12]">Orgs — Stripe Connect</h1>
        <p className="mt-1 text-sm text-[#8b6f76]">
          {connected.length} connected · {notConnected.length} not set up
        </p>
      </div>

      {/* Connected */}
      <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#f5ecee] bg-[#fffafb] px-5 py-3">
          <h2 className="text-sm font-semibold text-[#2e0c12]">Connected Accounts ({connected.length})</h2>
        </div>
        {connected.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8b6f76]">No orgs connected yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f5ecee]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Organization</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Account ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Fees</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[#8b6f76]">Available Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ecee]">
                {connected.map((org) => (
                  <tr key={org.id} className="hover:bg-[#fffafb] transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 shrink-0 rounded-lg bg-[#550C18]/8 flex items-center justify-center text-xs font-bold text-[#550C18] overflow-hidden">
                          {org.logo ? <img src={org.logo} className="h-full w-full object-contain p-0.5" alt="" /> : org.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-[#2e0c12]">{org.name}</p>
                          <p className="text-xs text-[#8b6f76]">{[org.city, org.country].filter(Boolean).join(", ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{statusLabel(org.stripeAccountStatus)}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[#8b6f76]">{org.stripeAccountId}</td>
                    <td className="px-5 py-3 text-xs text-[#2e0c12]">
                      ${org.stripeFlatFee.toFixed(2)} + {org.stripePercentageFee.toFixed(2)}%
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-700">
                      {org.balance !== null
                        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(org.balance / 100)
                        : <span className="text-[#8b6f76] font-normal">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Not connected */}
      <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#f5ecee] bg-[#fffafb] px-5 py-3">
          <h2 className="text-sm font-semibold text-[#2e0c12]">Not Connected ({notConnected.length})</h2>
        </div>
        {notConnected.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8b6f76]">All orgs are connected</p>
        ) : (
          <div className="divide-y divide-[#f5ecee]">
            {notConnected.map((org) => (
              <div key={org.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-7 w-7 shrink-0 rounded-lg bg-[#550C18]/8 flex items-center justify-center text-xs font-bold text-[#550C18] overflow-hidden">
                  {org.logo ? <img src={org.logo} className="h-full w-full object-contain p-0.5" alt="" /> : org.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2e0c12]">{org.name}</p>
                  <p className="text-xs text-[#8b6f76]">{org.email}</p>
                </div>
                <span className="text-xs text-gray-400">No Stripe account</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
