"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  DollarSign,
  Download,
  PlusCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";

type DonationCategory = {
  categoryId: string;
  category?: { id: string; name: string } | null;
  _sum?: { amount?: number | null } | null;
};

type DonationRecord = {
  id: string;
  donorName?: string | null;
  donorEmail?: string | null;
  createdAt?: string;
  amount?: number;
  status?: string;
  category?: { name?: string | null } | null;
};

export default function ClientPage({
  masjidId,
  totalAmount,
  donationsThisMonth,
  topCategories,
  overview,
  recentDonations,
  totalRecentDonations,
}: {
  masjidId: string;
  totalAmount: number;
  donationsThisMonth: number;
  topCategories: DonationCategory[];
  overview: DonationCategory[];
  recentDonations: DonationRecord[];
  totalRecentDonations: number;
}) {
  const [pagedRecentDonations, setPagedRecentDonations] =
    useState<DonationRecord[]>(recentDonations);
  const [total, setTotal] = useState(totalRecentDonations);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const pageSize = 8;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const totalOverviewAmount = overview.reduce(
    (sum, c) => sum + (c._sum?.amount || 0),
    0
  );
  const getPercent = (amt: number) =>
    totalOverviewAmount > 0 ? Math.round((amt / totalOverviewAmount) * 100) : 0;

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/donations?masjidId=${masjidId}&status=completed&page=${page}&pageSize=${pageSize}`
        );
        if (!res.ok) throw new Error("Failed to fetch donations");
        const data = await res.json();
        if (!ignore) {
          setPagedRecentDonations(data.donations || []);
          if (typeof data.total === "number") {
            setTotal(data.total);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [masjidId, page]);

  const filteredDonations = useMemo(() => {
    if (!search) return pagedRecentDonations;
    const query = search.toLowerCase();
    return pagedRecentDonations.filter((donation) => {
      return (
        donation.donorName?.toLowerCase().includes(query) ||
        donation.donorEmail?.toLowerCase().includes(query) ||
        donation.category?.name?.toLowerCase().includes(query)
      );
    });
  }, [pagedRecentDonations, search]);

  const topCategory = topCategories[0];
  const avgDonation =
    donationsThisMonth > 0 ? totalAmount / donationsThisMonth : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Donations
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Keep giving moving forward.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Track donation performance, kiosk activity, and donor trends in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/donations/categories?masjidId=${masjidId}`}>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-[#3A3A3A]/70">
              <span>Month-to-date</span>
              <DollarSign className="h-4 w-4 text-[#550C18]" />
            </CardDescription>
            <CardTitle className="text-2xl text-[#2e0c12]">
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-[#550C18]">
              <TrendingUp className="h-4 w-4" />
              <span>{donationsThisMonth.toLocaleString()} donations</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#3A3A3A]/70">
              Average donation
            </CardDescription>
            <CardTitle className="text-2xl text-[#2e0c12]">
              ${avgDonation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-[#3A3A3A]/70">
              Based on completed donations
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#3A3A3A]/70">
              Top category
            </CardDescription>
            <CardTitle className="text-2xl text-[#2e0c12]">
              {topCategory?.category?.name || "Not set"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-[#550C18]">
              <ArrowUpRight className="h-4 w-4" />
              <span>
                ${((topCategory?._sum?.amount as number) || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#3A3A3A]/70">
              Active categories
            </CardDescription>
            <CardTitle className="text-2xl text-[#2e0c12]">
              {overview.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-[#3A3A3A]/70">
              Categories with donations this month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-[#2e0c12]">
              Category Mix
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Monthly breakdown by donation category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.map((cat, i) => (
              <div key={cat.category?.id || i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#3A3A3A]">
                    {cat.category?.name || "Category"}
                  </span>
                  <span className="text-sm font-medium text-[#3A3A3A]">
                    {getPercent(cat._sum?.amount || 0)}%
                  </span>
                </div>
                <Progress value={getPercent(cat._sum?.amount || 0)} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-[#2e0c12]">
              Quick Links
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Jump straight into the kiosk and category tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Manage Kiosks",
                description: "Assign devices and refresh status",
                href: `/dashboard/donations/kiosk?masjidId=${masjidId}`,
              },
              {
                label: "Donation Categories",
                description: "Edit kiosks and online options",
                href: `/dashboard/donations/categories?masjidId=${masjidId}`,
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center justify-between rounded-2xl border border-[#550C18]/10 p-4 transition hover:-translate-y-0.5 hover:border-[#550C18]/30 hover:shadow-md"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[#2e0c12]">
                    {item.label}
                  </h3>
                  <p className="text-sm text-[#3A3A3A]/70">
                    {item.description}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#550C18]" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#550C18]/10 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-[#2e0c12]">
                Recent Donations
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Review donor activity and transaction details.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#550C18]/60" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search donor or category"
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-[#550C18]/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-[#3A3A3A]/70">
                      Loading donations...
                    </TableCell>
                  </TableRow>
                ) : filteredDonations.length > 0 ? (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                              {donation.donorName
                                ? donation.donorName
                                    .split(" ")
                                    .map((part) => part.charAt(0))
                                    .join("")
                                    .slice(0, 2)
                                : "--"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-[#3A3A3A]">
                              {donation.donorName || "Anonymous"}
                            </p>
                            <p className="text-xs text-[#3A3A3A]/70">
                              {donation.donorEmail || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-[#550C18]/30 text-[#550C18]"
                        >
                          {donation.category?.name || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#3A3A3A]">
                        {donation.createdAt
                          ? new Date(donation.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-[#550C18]">
                        ${donation.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-green-500 text-green-600"
                        >
                          {donation.status?.charAt(0).toUpperCase() +
                            donation.status?.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-[#3A3A3A]/70">
                      No donations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="text-sm text-[#3A3A3A]/70">
              Showing {filteredDonations.length} of {total} donations
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-[#3A3A3A]/70">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
