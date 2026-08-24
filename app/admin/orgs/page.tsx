import { prisma } from "@/lib/db";
import Link from "next/link";
import { Building2, Users, Tv, CreditCard, ExternalLink } from "lucide-react";

export default async function AdminOrgsPage() {
  const orgs = await prisma.masjid.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { id: true } },
      tvDisplays: { select: { id: true, status: true } },
      kioskInstances: { select: { id: true } },
      Orders: { select: { id: true } },
      owner: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2e0c12]">Organizations</h1>
        <p className="mt-1 text-sm text-[#8b6f76]">{orgs.length} masjids registered</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {orgs.map((org) => {
          const onlineDisplays = org.tvDisplays.filter((d) => d.status === "online").length;
          return (
            <div key={org.id} className="rounded-2xl border border-[#550C18]/8 bg-white p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl border border-[#e8d8db] bg-[#fffafb] overflow-hidden flex items-center justify-center text-base font-bold text-[#550C18]">
                  {org.logo
                    ? <img src={org.logo} alt={org.name} className="h-full w-full object-contain p-1" />
                    : org.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#2e0c12] truncate">{org.name}</p>
                  <p className="text-xs text-[#8b6f76]">{[org.city, org.country].filter(Boolean).join(", ")}</p>
                  {org.stripeAccountStatus && (
                    <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      org.stripeAccountStatus === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : org.stripeAccountStatus === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                    }`}>
                      Stripe: {org.stripeAccountStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[#fffafb] border border-[#f0e4e6] py-2">
                  <p className="text-base font-bold text-[#2e0c12]">{org.users.length}</p>
                  <p className="text-[10px] text-[#8b6f76]">Users</p>
                </div>
                <div className="rounded-xl bg-[#fffafb] border border-[#f0e4e6] py-2">
                  <p className="text-base font-bold text-[#2e0c12]">{onlineDisplays}/{org.tvDisplays.length}</p>
                  <p className="text-[10px] text-[#8b6f76]">Displays</p>
                </div>
                <div className="rounded-xl bg-[#fffafb] border border-[#f0e4e6] py-2">
                  <p className="text-base font-bold text-[#2e0c12]">{org.Orders.length}</p>
                  <p className="text-[10px] text-[#8b6f76]">Orders</p>
                </div>
              </div>

              {/* Owner */}
              <div className="text-xs text-[#8b6f76]">
                Owner: <span className="text-[#2e0c12] font-medium">{org.owner.name || org.owner.email}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {org.email && (
                  <a href={`mailto:${org.email}`} className="flex-1 rounded-xl border border-[#e8d8db] py-1.5 text-center text-xs font-medium text-[#550C18] transition hover:bg-[#550C18]/5">
                    Email
                  </a>
                )}
                {org.websiteUrl && (
                  <a href={org.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 rounded-xl border border-[#e8d8db] px-3 py-1.5 text-xs font-medium text-[#8b6f76] transition hover:bg-[#550C18]/5">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
