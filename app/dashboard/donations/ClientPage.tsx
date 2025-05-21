"use client";

import { useEffect, useState } from "react";
import {
Download,
DollarSign,
Filter,
Search,
ArrowUpDown,
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
import { getRecentDonations } from "@/lib/actions/donations";

export default function ClientPage({ totalDonations, totalAmount, totalCount, topCategories, overview, recentDonations, totalRecentDonations }: { totalDonations: number, totalAmount: number, totalCount: number, topCategories: any[], overview: any[], recentDonations: any[], totalRecentDonations: number }) {
 
    const [pagedRecentDonations, setPagedRecentDonations] = useState(recentDonations);
    const [page, setPage] = useState(1);
    const pageSize = 2;
    const totalPages = Math.ceil(totalRecentDonations / pageSize);
    const totalOverviewAmount = overview.reduce((sum, c) => sum + (c._sum?.amount || 0), 0);
    const getPercent = (amt: number) =>
        totalOverviewAmount > 0 ? Math.round((amt / totalOverviewAmount) * 100) : 0;

    const getPagedRecentDonations = async () => {
        const donations = await getRecentDonations(undefined, page, pageSize);
        setPagedRecentDonations(donations.donations);
    }
    useEffect(() => {
        getPagedRecentDonations();
    }, [page, pageSize]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                <h2 className="text-2xl font-bold text-[#550C18]">Donations</h2>
                <p className="text-[#3A3A3A]/70">
                    Track and manage donations for your masjid
                </p>
                </div>
                <div className="flex items-center gap-3">
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                    <DollarSign className="mr-2 h-4 w-4" />
                    New Donation
                </Button>
                <Button
                    variant="outline"
                    className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
                </div>
            </div>

            {/* Top Cards: Total + Top 3 Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-[#3A3A3A]">
                    Total Donations
                    </CardTitle>
                    <CardDescription className="text-[#3A3A3A]/70">
                    This month
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-[#550C18]">
                    ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-[#3A3A3A]/70 mt-1">
                    {recentDonations.length} donations received
                    </p>
                </CardContent>
                </Card>
                {topCategories.map((cat, i) => (
                <Card key={cat.category?.id || i} className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-[#3A3A3A]">
                        {cat.category?.name || "Category"}
                    </CardTitle>
                    <CardDescription className="text-[#3A3A3A]/70">
                        This month
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-bold text-[#550C18]">
                        ${((cat._sum.amount ?? 0) as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-[#3A3A3A]/70 mt-1">
                        {getPercent(cat._sum.amount ?? 0)}% of total
                    </p>
                    </CardContent>
                </Card>
                ))}
            </div>

            {/* Donation Overview */}
            <Card className="bg-white border-[#550C18]/10">
                <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                    <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                        Donation Overview
                    </CardTitle>
                    <CardDescription className="text-[#3A3A3A]/70">
                        Monthly breakdown by category
                    </CardDescription>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                    <div className="w-full max-w-md">
                    <div className="space-y-4">
                        {overview.map((cat, i) => (
                        <div key={cat.category?.id || i}>
                            <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#3A3A3A]">
                                {cat.category?.name || "Category"}
                            </span>
                            <span className="text-sm font-medium text-[#3A3A3A]">
                                {getPercent(cat._sum.amount ?? 0)}%
                            </span>
                            </div>
                            <Progress value={getPercent(cat._sum.amount ?? 0)} className="h-2" />
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card className="bg-white border-[#550C18]/10">
                <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                    <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                        Recent Donations
                    </CardTitle>
                    <CardDescription className="text-[#3A3A3A]/70">
                        View and manage donation transactions
                    </CardDescription>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <div className="rounded-md border">
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
                        {pagedRecentDonations.length > 0 ? (
                        pagedRecentDonations.map((donation: any) => (
                            <TableRow key={donation.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                                    {donation.donorName
                                        ? donation.donorName.split(" ")[0]?.charAt(0) +
                                        (donation.donorName.split(" ")[1]?.charAt(0) || "")
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
                                    className={
                                        `border bg-[${donation.category?.headerBgColor}] hover:bg-[${donation.category?.headerBgColor}]/30`
                                    }
                                >
                                    {donation.category?.name || "-"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <p className="text-sm text-[#3A3A3A]">
                                {donation.createdAt
                                    ? new Date(donation.createdAt).toLocaleDateString()
                                    : "-"}
                                </p>
                            </TableCell>
                            <TableCell>
                                <p className="text-sm font-medium text-[#550C18]">
                                ${donation.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </TableCell>
                            <TableCell>
                                <Badge
                                variant="outline"
                                className="border-green-500 text-green-500"
                                >
                                {donation.status?.charAt(0).toUpperCase() +
                                    donation.status?.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Link href={`/dashboard/donations/${donation.id}`}>
                                <Button size="sm" variant="outline">
                                    View
                                </Button>
                                </Link>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center p-8">
                            <DollarSign className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                            <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                                No donations found
                            </h3>
                            <p className="text-[#3A3A3A]/70 mb-4">
                                No donations match your search criteria. Try adjusting your
                                search.
                            </p>
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
                </CardContent>
            </Card>
        </div>
    )
}