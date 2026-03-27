import {
  getTotalDonationsThisMonth,
  getDonationCountThisMonth,
  getTopDonationCategories,
  getDonationOverview,
  getRecentDonations,
} from "@/lib/actions/donations";
import ClientPage from "./ClientPage";

export default async function DonationsPage({
  searchParams,
}: {
  searchParams?: { masjidId?: string };
}) {
  const masjidId = searchParams?.masjidId || "";
  if (!masjidId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-white border border-[#550C18]/10 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#550C18] mb-2">
          Select a Masjid
        </h2>
        <p className="text-[#3A3A3A]/70">
          Choose a masjid to view donations and kiosk performance.
        </p>
      </div>
    );
  }

  const [
    totalDonations,
    donationCount,
    topCategories,
    overview,
    recentDonationsResult,
  ] = await Promise.all([
    getTotalDonationsThisMonth(masjidId),
    getDonationCountThisMonth(masjidId),
    getTopDonationCategories(masjidId),
    getDonationOverview(masjidId),
    getRecentDonations(masjidId, 1, 5),
  ]);

  if (
    totalDonations === null ||
    donationCount === null ||
    !topCategories ||
    !overview ||
    !recentDonationsResult
  ) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-white border border-[#550C18]/10 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#550C18] mb-2">
          Donations unavailable
        </h2>
        <p className="text-[#3A3A3A]/70">
          We couldn’t load your donation data right now. Please try again.
        </p>
      </div>
    );
  }

  const totalAmount = totalDonations ?? 0;
  const { donations: recentDonations, total: totalRecentDonations } =
    recentDonationsResult;

  return (
    <ClientPage
      masjidId={masjidId}
      totalAmount={totalAmount}
      donationsThisMonth={donationCount}
      topCategories={topCategories}
      overview={overview}
      recentDonations={recentDonations}
      totalRecentDonations={totalRecentDonations}
    />
  );
}
