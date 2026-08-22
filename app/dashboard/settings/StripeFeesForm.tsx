"use client";

import { useState } from "react";
import { Loader2, Info } from "lucide-react";
import { saveStripeFees } from "@/lib/actions/stripe-connect";
import { useToast } from "@/hooks/use-toast";

interface Props {
  masjidId: string;
  stripeFlatFee: number;
  stripePercentageFee: number;
}

export function StripeFeesForm({ masjidId, stripeFlatFee, stripePercentageFee }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [flatFee, setFlatFee] = useState(stripeFlatFee.toFixed(2));
  const [percentFee, setPercentFee] = useState(stripePercentageFee.toFixed(2));

  const example = (100 * (1 + parseFloat(percentFee) / 100) + parseFloat(flatFee)).toFixed(2);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveStripeFees(masjidId, parseFloat(flatFee), parseFloat(percentFee));
      if (result.error) {
        toast({ title: "Error", description: (result as any).message, variant: "destructive" });
      } else {
        toast({ title: "Fees saved" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#550C18]/10 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[#2e0c12]">Processing Fee Configuration</h2>
      <p className="mt-1 text-sm text-[#8b6f76]">
        Adjust what donors see as the processing fee when covering transaction costs.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#2e0c12]">
            Flat Fee (per transaction)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8b6f76]">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={flatFee}
              onChange={(e) => setFlatFee(e.target.value)}
              className="w-full rounded-xl border border-[#e8d8db] bg-white pl-7 pr-4 py-2.5 text-sm text-[#2e0c12] outline-none transition focus:border-[#550C18]/50 focus:ring-2 focus:ring-[#550C18]/10"
            />
          </div>
          <p className="mt-1 text-xs text-[#bba0a7]">Default: $0.30</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#2e0c12]">
            Percentage Fee
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={percentFee}
              onChange={(e) => setPercentFee(e.target.value)}
              className="w-full rounded-xl border border-[#e8d8db] bg-white pl-4 pr-8 py-2.5 text-sm text-[#2e0c12] outline-none transition focus:border-[#550C18]/50 focus:ring-2 focus:ring-[#550C18]/10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8b6f76]">%</span>
          </div>
          <p className="mt-1 text-xs text-[#bba0a7]">Default: 2.90%</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#fffafb] border border-[#e8d8db] px-4 py-3 text-xs text-[#8b6f76]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#550C18]/50" />
        <span>
          Example: $100 donation → donor covers{" "}
          <strong className="text-[#2e0c12]">${example}</strong> when fee coverage is enabled.
        </span>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#550C18] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6a1220] disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save Fees"}
        </button>
      </div>
    </div>
  );
}
