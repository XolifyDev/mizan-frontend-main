import { prisma } from "@/lib/db";
import { Tv, Wifi, WifiOff, Clock } from "lucide-react";

const fmtDate = (d: Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default async function AdminMizanTVsPage() {
  const displays = await prisma.tVDisplay.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      masjid: { select: { name: true, city: true, logo: true } },
    },
  });

  const online = displays.filter((d) => d.status === "online").length;
  const offline = displays.filter((d) => d.status !== "online").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2e0c12]">MizanTV Displays</h1>
          <p className="mt-1 text-sm text-[#8b6f76]">{displays.length} total devices</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
            <p className="text-lg font-bold text-emerald-700">{online}</p>
            <p className="text-xs text-emerald-600">Online</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-center">
            <p className="text-lg font-bold text-gray-600">{offline}</p>
            <p className="text-xs text-gray-500">Offline</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displays.length === 0 ? (
          <p className="col-span-3 py-12 text-center text-sm text-[#8b6f76]">No MizanTV devices registered yet</p>
        ) : displays.map((d) => (
          <div key={d.id} className="rounded-2xl border border-[#550C18]/8 bg-white p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#550C18]/8 text-[#550C18]">
                  <Tv className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#2e0c12]">{d.name}</p>
                  {d.location && <p className="text-xs text-[#8b6f76]">{d.location}</p>}
                </div>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                d.status === "online"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {d.status === "online"
                  ? <Wifi className="h-3 w-3" />
                  : <WifiOff className="h-3 w-3" />}
                {d.status}
              </span>
            </div>

            {/* Org */}
            <div className="flex items-center gap-2">
              {d.masjid.logo && <img src={d.masjid.logo} className="h-5 w-5 rounded object-contain" alt="" />}
              <p className="text-sm text-[#2e0c12] font-medium">{d.masjid.name}</p>
              {d.masjid.city && <p className="text-xs text-[#8b6f76]">· {d.masjid.city}</p>}
            </div>

            {/* Device info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {d.platform && (
                <div className="rounded-lg bg-[#fffafb] border border-[#f0e4e6] px-3 py-2">
                  <p className="text-[#8b6f76]">Platform</p>
                  <p className="font-medium text-[#2e0c12] capitalize">{d.platform}</p>
                </div>
              )}
              {d.appVersion && (
                <div className="rounded-lg bg-[#fffafb] border border-[#f0e4e6] px-3 py-2">
                  <p className="text-[#8b6f76]">App Version</p>
                  <p className="font-medium text-[#2e0c12]">{d.appVersion}</p>
                </div>
              )}
              {d.model && (
                <div className="rounded-lg bg-[#fffafb] border border-[#f0e4e6] px-3 py-2">
                  <p className="text-[#8b6f76]">Model</p>
                  <p className="font-medium text-[#2e0c12]">{d.model}</p>
                </div>
              )}
              {d.ipAddress && (
                <div className="rounded-lg bg-[#fffafb] border border-[#f0e4e6] px-3 py-2">
                  <p className="text-[#8b6f76]">IP</p>
                  <p className="font-medium text-[#2e0c12] font-mono text-[10px]">{d.ipAddress}</p>
                </div>
              )}
            </div>

            {/* Last seen */}
            <div className="flex items-center gap-1.5 text-xs text-[#8b6f76]">
              <Clock className="h-3 w-3" />
              Last seen: {fmtDate(d.lastSeen)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
