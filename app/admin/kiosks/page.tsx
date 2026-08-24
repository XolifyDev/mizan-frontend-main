import { prisma } from "@/lib/db";
import { CreditCard, MapPin, Activity } from "lucide-react";

export default async function AdminKiosksPage() {
  const kiosks = await prisma.kioskInstance.findMany({
    orderBy: { activatedAt: "desc" },
    include: {
      masjid: { select: { name: true, city: true, logo: true } },
      product: { select: { name: true } },
      donations: { select: { amount: true } },
    },
  });

  const totalRevenue = kiosks.reduce(
    (sum, k) => sum + k.donations.reduce((s, d) => s + d.amount, 0),
    0
  );
  const activeKiosks = kiosks.filter((k) => k.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2e0c12]">Kiosk Instances</h1>
          <p className="mt-1 text-sm text-[#8b6f76]">{kiosks.length} kiosks · {activeKiosks} active</p>
        </div>
        <div className="rounded-xl border border-[#e8d8db] bg-white px-4 py-2 text-right shadow-sm">
          <p className="text-xs text-[#8b6f76]">Total donations processed</p>
          <p className="text-lg font-bold text-emerald-700">
            ${(totalRevenue / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f5ecee] bg-[#fffafb]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Kiosk</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Organization</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Serial</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#8b6f76]">Donations</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#8b6f76]">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5ecee]">
              {kiosks.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-sm text-[#8b6f76]">No kiosks yet</td></tr>
              ) : kiosks.map((k) => {
                const rev = k.donations.reduce((s, d) => s + d.amount, 0);
                return (
                  <tr key={k.id} className="hover:bg-[#fffafb] transition">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-[#2e0c12]">{k.kioskName || "Unnamed kiosk"}</p>
                        {k.kioskLocation && (
                          <p className="flex items-center gap-1 text-xs text-[#8b6f76]">
                            <MapPin className="h-3 w-3" />{k.kioskLocation}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {k.masjid.logo && (
                          <img src={k.masjid.logo} className="h-6 w-6 rounded object-contain" alt="" />
                        )}
                        <div>
                          <p className="text-[#2e0c12] font-medium">{k.masjid.name}</p>
                          <p className="text-xs text-[#8b6f76]">{k.masjid.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#8b6f76]">{k.product.name}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        k.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}>{k.status}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[#8b6f76]">{k.serial}</td>
                    <td className="px-5 py-3 text-right text-[#2e0c12] font-medium">{k.donations.length}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-700">${(rev / 100).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
