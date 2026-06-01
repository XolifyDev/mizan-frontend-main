"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MasjidOption = {
  id: string;
  name: string;
};

export default function VerifyDeviceClient({
  code,
  initialMasjidId,
  masjids,
}: {
  code: string;
  initialMasjidId: string;
  masjids: MasjidOption[];
}) {
  const router = useRouter();
  const [selectedMasjidId, setSelectedMasjidId] = useState(initialMasjidId);
  const [status, setStatus] = useState<"idle" | "loading" | "verified" | "error">("idle");
  const [message, setMessage] = useState("");
  const [deviceName, setDeviceName] = useState("");

  const currentMasjid = useMemo(
    () => masjids.find((masjid) => masjid.id === selectedMasjidId),
    [masjids, selectedMasjidId]
  );

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("Missing pairing code.");
      return;
    }

    const loadSession = async () => {
      setStatus("loading");

      try {
        const response = await fetch(`/api/mizantv/pairing/sessions/${code}`);
        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Failed to load pairing session.");
          return;
        }

        setDeviceName(data.device?.name || data.device?.id || "MizanTV Device");
        setStatus("idle");
      } catch {
        setStatus("error");
        setMessage("Failed to load pairing session.");
      }
    };

    loadSession();
  }, [code]);

  const handleVerify = async () => {
    if (!selectedMasjidId) {
      setStatus("error");
      setMessage("Select a masjid to continue.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/mizantv/pairing/sessions/${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          masjidId: selectedMasjidId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Verification failed.");
        return;
      }

      setStatus("verified");
      setMessage(`Device verified for ${data.masjid?.name || currentMasjid?.name}.`);
    } catch {
      setStatus("error");
      setMessage("Verification failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f6] px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#550C18]/10 bg-white p-8 shadow-[0_30px_80px_rgba(85,12,24,0.08)]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#550C18]/50">
            Device Verification
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#2e0c12]">
            Link this MizanTV display
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#5f4b51]">
            Verify the device against one of your masjids. The display must already be assigned
            from the admin app before this step will succeed.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[24px] border border-[#550C18]/10 bg-[#fff8f7] p-6">
            <p className="text-sm font-medium text-[#550C18]/60">Pairing code</p>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-[0.14em] text-[#550C18]">
              {code || "—"}
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#2e0c12]">
                Device
              </label>
              <div className="rounded-2xl border border-[#550C18]/10 bg-white px-4 py-3 text-[#2e0c12]">
                {deviceName || "Loading device..."}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#2e0c12]">
                Verify to masjid
              </label>
              <select
                value={selectedMasjidId}
                onChange={(event) => setSelectedMasjidId(event.target.value)}
                className="w-full rounded-2xl border border-[#550C18]/15 bg-white px-4 py-3 text-[#2e0c12] outline-none transition focus:border-[#550C18]"
              >
                {masjids.map((masjid) => (
                  <option key={masjid.id} value={masjid.id}>
                    {masjid.name}
                  </option>
                ))}
              </select>
            </div>

            {message ? (
              <div
                className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                  status === "verified"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {message}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleVerify}
                disabled={status === "loading" || !selectedMasjidId}
                className="rounded-2xl bg-[#550C18] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#69101f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? "Verifying..." : "Verify Device"}
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    selectedMasjidId
                      ? `/dashboard/signage?masjidId=${selectedMasjidId}`
                      : "/dashboard/signage"
                  )
                }
                className="rounded-2xl border border-[#550C18]/15 px-5 py-3 text-sm font-semibold text-[#550C18]"
              >
                Back to Signage
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#550C18]/10 bg-[#2e0c12] p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">How it works</p>
            <ol className="mt-5 space-y-4 text-sm text-white/80">
              <li>1. Open this page from the QR code shown on the TV device.</li>
              <li>2. Pick the masjid account that should own this screen session.</li>
              <li>3. The device will finish setup automatically after verification.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
