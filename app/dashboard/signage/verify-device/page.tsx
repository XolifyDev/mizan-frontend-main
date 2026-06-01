import { getUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import VerifyDeviceClient from "./verify-device-client";

export default async function VerifyDevicePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; masjidId?: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/signin");
  }

  const params = await searchParams;

  return (
    <VerifyDeviceClient
      code={params.code || ""}
      initialMasjidId={params.masjidId || user.masjids[0]?.id || ""}
      masjids={user.masjids.map((masjid) => ({
        id: masjid.id,
        name: masjid.name,
      }))}
    />
  );
}
