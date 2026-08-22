"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { updateMasjid } from "@/lib/actions/masjid";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";
import { ImageCropModal } from "@/components/ImageCropModal";

interface Masjid {
  id: string;
  name: string;
  description: string;
  address?: string | null;
  city: string;
  postal: string;
  country: string;
  email: string;
  phone: string;
  websiteUrl: string;
  logo: string;
  timezone: string;
  taxId?: string | null;
}

export function OrganizationForm({ masjid }: { masjid: Masjid }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(masjid.logo);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: masjid.name || "",
    description: masjid.description || "",
    email: masjid.email || "",
    phone: masjid.phone || "",
    websiteUrl: masjid.websiteUrl || "",
    address: masjid.address || "",
    city: masjid.city || "",
    postal: masjid.postal || "",
    country: masjid.country || "",
    timezone: masjid.timezone || "",
    logo: masjid.logo || "",
    taxId: masjid.taxId || "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const handleCropDone = async (blob: Blob) => {
    setCropSrc(null);
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("files", new File([blob], "logo.png", { type: "image/png" }));
      const res = await fetch("/api/uploadthing", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const first = Array.isArray(data) ? data[0] : data;
      const url = first?.data?.ufsUrl || first?.data?.url || first?.url || first?.ufsUrl;
      if (!url) throw new Error("No URL returned");
      setLogoPreview(url);
      setForm((prev) => ({ ...prev, logo: url }));
      await updateMasjid(masjid.id, { logo: url });
      toast({ title: "Logo saved" });
    } catch {
      toast({ title: "Logo upload failed", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await updateMasjid(masjid.id, form);
      if (result?.error) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Organization info updated." });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    {cropSrc && (
      <ImageCropModal
        imageSrc={cropSrc}
        onCancel={() => setCropSrc(null)}
        onCrop={handleCropDone}
        aspect={1}
      />
    )}
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl overflow-hidden border border-[#550C18]/10 bg-[#fffafb] shadow-sm">
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" fill className="object-contain p-1" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#550C18]">
                {form.name[0] || "M"}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingLogo}
            className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#550C18] text-white shadow-md transition hover:bg-[#6a1220] disabled:opacity-60"
          >
            {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2e0c12]">Organization Logo</p>
          <p className="mt-0.5 text-xs text-[#8b6f76]">PNG, JPG or SVG. Recommended 400×400.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingLogo}
            className="mt-2 rounded-lg border border-[#550C18]/20 px-3 py-1.5 text-xs font-semibold text-[#550C18] transition hover:bg-[#550C18]/5 disabled:opacity-50"
          >
            {uploadingLogo ? "Uploading…" : "Change logo"}
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organization Name" required>
          <input value={form.name} onChange={set("name")} className={inputCls} placeholder="Islamic Circle of Suwanee" required />
        </Field>
        <Field label="Email">
          <input value={form.email} onChange={set("email")} type="email" className={inputCls} placeholder="info@yourmasjid.org" />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={set("phone")} className={inputCls} placeholder="+1 (770) 000-0000" />
        </Field>
        <Field label="Website">
          <input value={form.websiteUrl} onChange={set("websiteUrl")} className={inputCls} placeholder="https://yourmasjid.org" />
        </Field>
        <Field label="Timezone">
          <input value={form.timezone} onChange={set("timezone")} className={inputCls} placeholder="America/New_York" />
        </Field>
        <Field label="Tax ID / EIN / ABN">
          <input value={form.taxId} onChange={set("taxId")} className={inputCls} placeholder="12-3456789" />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            className={inputCls + " resize-none"}
            placeholder="A welcoming Islamic center serving the community…"
          />
        </Field>
      </div>

      <div className="border-t border-[#550C18]/8 pt-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8b6f76]">Address</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Street Address" className="sm:col-span-2">
            <input value={form.address} onChange={set("address")} className={inputCls} placeholder="80 Celebration Dr" />
          </Field>
          <Field label="City">
            <input value={form.city} onChange={set("city")} className={inputCls} placeholder="Suwanee" />
          </Field>
          <Field label="Postal Code">
            <input value={form.postal} onChange={set("postal")} className={inputCls} placeholder="30024" />
          </Field>
          <Field label="Country" className="sm:col-span-2">
            <input value={form.country} onChange={set("country")} className={inputCls} placeholder="United States" />
          </Field>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#550C18] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6a1220] disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
    </>
  );
}

function Field({ label, children, className, required }: { label: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-[#2e0c12]">
        {label}{required && <span className="ml-0.5 text-[#550C18]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#e8d8db] bg-white px-4 py-2.5 text-sm text-[#2e0c12] placeholder:text-[#bba0a7] outline-none transition focus:border-[#550C18]/50 focus:ring-2 focus:ring-[#550C18]/10";
