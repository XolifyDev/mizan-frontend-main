import {
  getTotalDonationsThisMonth,
  getTopDonationCategories,
  getDonationOverview,
  getRecentDonations,
  seedTestDonationsAndCategories,
} from "@/lib/actions/donations";
import ClientPage from "./ClientPage";
export default async function DonationsPage() {
  // Fetch all dashboard data in parallel
  const [
    totalDonations,
    topCategories,
    overview,
    recentDonationsResult,
  ] = await Promise.all([
    getTotalDonationsThisMonth(),
    getTopDonationCategories(),
    getDonationOverview(),
    getRecentDonations(undefined, 1, 2),
  ]);

  // Calculate total count for this month
  const totalCount = overview.reduce((sum, c) => sum + (c._sum?.amount ? 1 : 0), 0);
  const totalAmount = totalDonations;
  const { donations: recentDonations, total: totalRecentDonations } = recentDonationsResult;

  if(!totalDonations || !totalAmount || !totalCount) {
    return <div>No data available</div>;
  }

  return (
    <ClientPage
      totalDonations={totalDonations}
      totalAmount={totalAmount}
      totalCount={totalCount}
      topCategories={topCategories}
      overview={overview}
      recentDonations={recentDonations}
      totalRecentDonations={totalRecentDonations}
    />
  );
}
