import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, ShieldCheck, Building2 } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      masjids: { select: { id: true, name: true } },
      Orders: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2e0c12]">Users</h1>
        <p className="mt-1 text-sm text-[#8b6f76]">{users.length} total accounts</p>
      </div>

      <div className="rounded-2xl border border-[#550C18]/8 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f5ecee] bg-[#fffafb]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Organizations</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Orders</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#8b6f76]">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5ecee]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#fffafb] transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#550C18]/10 text-xs font-bold text-[#550C18]">
                        {u.image
                          ? <img src={u.image} className="h-8 w-8 rounded-full object-cover" alt={u.name} />
                          : u.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-medium text-[#2e0c12]">{u.name}</p>
                        {u.admin && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600">
                            <ShieldCheck className="h-3 w-3" /> Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#8b6f76]">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.masjids.length === 0
                        ? <span className="text-[#8b6f76]">—</span>
                        : u.masjids.map((m) => (
                          <span key={m.id} className="rounded-full bg-[#550C18]/8 px-2 py-0.5 text-xs text-[#550C18]">{m.name}</span>
                        ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#2e0c12] font-medium">{u.Orders.length}</td>
                  <td className="px-5 py-3 text-[#8b6f76] text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
