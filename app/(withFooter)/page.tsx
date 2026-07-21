"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Monitor, CreditCard, Globe, LayoutDashboard, Clock, Users, TrendingUp, Tv, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Philosopher } from "next/font/google";
import { useState } from "react";

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] });

const PRAYER_TIMES = [
  { name: "Fajr", adhan: "5:21 AM", iqamah: "5:45 AM" },
  { name: "Dhuhr", adhan: "1:17 PM", iqamah: "1:30 PM", active: true },
  { name: "Asr", adhan: "4:58 PM", iqamah: "5:15 PM" },
  { name: "Maghrib", adhan: "8:24 PM", iqamah: "8:29 PM" },
  { name: "Isha", adhan: "10:01 PM", iqamah: "10:20 PM" },
];

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-[#fdfaf7]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28">
        {/* Background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23550C18' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#550C18]/20 bg-[#550C18]/5 px-4 py-1.5 text-sm font-medium text-[#550C18] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#550C18] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#550C18]"></span>
              </span>
              Now serving masjids across North America
            </div>

            <h1
              className={`text-5xl md:text-6xl lg:text-7xl font-bold text-[#550C18] leading-[1.08] mb-6 ${philosopher.className}`}
            >
              Everything your masjid needs, in one place
            </h1>

            <p className="text-lg md:text-xl text-[#5a4a4e] mb-10 max-w-2xl mx-auto leading-relaxed">
              Prayer times, donation kiosks, TV displays, events, and community
              websites — managed from a single dashboard built specifically for
              masjids.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#550C18] hover:bg-[#3d0912] text-white text-base px-8 h-12 rounded-lg shadow-lg shadow-[#550C18]/20"
                >
                  Start Free — No Credit Card
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#550C18]/25 text-[#550C18] hover:bg-[#550C18]/5 text-base px-8 h-12 rounded-lg"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-[#8a7074]">
              Free 30-day trial · Cancel anytime · Setup in under 10 minutes
            </p>
          </div>

          {/* Hero visual — dashboard mockup */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-[#550C18]/12 bg-white shadow-[0_32px_80px_-24px_rgba(85,12,24,0.18)] overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 bg-[#f7f3f0] border-b border-[#550C18]/10 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md border border-[#550C18]/10 px-3 py-1 text-xs text-[#8a7074] text-center max-w-xs mx-auto">
                    app.mizanmanagement.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard mockup content */}
              <div className="flex h-[420px]">
                {/* Sidebar */}
                <div className="w-52 border-r border-[#550C18]/8 bg-white flex-shrink-0 p-4 hidden md:block">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#550C18]/8">
                    <Image src="/mizan.svg" width={22} height={22} alt="Mizan" />
                    <span className={`font-bold text-[#550C18] text-xl ${philosopher.className}`}>Mizan</span>
                  </div>
                  {["Dashboard", "Prayer Times", "Events", "Donations", "TV Displays", "Analytics", "Settings"].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-1 ${
                        i === 0
                          ? "bg-[#550C18]/10 text-[#550C18] font-semibold"
                          : "text-[#6b5c60] hover:bg-[#550C18]/5"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#550C18]" : "bg-[#c9b5bb]"}`} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main area */}
                <div className="flex-1 bg-[#fdfaf7] p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-[#8a7074] uppercase tracking-widest font-medium">Al-Noor Islamic Center</p>
                      <h2 className="text-lg font-semibold text-[#2e0c12]">Dashboard Overview</h2>
                    </div>
                    <div className="text-xs text-[#8a7074] bg-white border border-[#550C18]/10 rounded-lg px-3 py-1.5">
                      Sunday, July 20
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Weekly Donations", value: "$4,280", change: "+12%" },
                      { label: "Active Displays", value: "4 Online", change: "100%" },
                      { label: "Event RSVPs", value: "138", change: "+28%" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-3 border border-[#550C18]/8">
                        <p className="text-xs text-[#8a7074]">{stat.label}</p>
                        <p className="text-xl font-bold text-[#2e0c12] mt-0.5">{stat.value}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{stat.change} this week</p>
                      </div>
                    ))}
                  </div>

                  {/* Prayer times preview */}
                  <div className="bg-white rounded-xl border border-[#550C18]/8 p-3">
                    <p className="text-xs font-semibold text-[#550C18] uppercase tracking-widest mb-2">Today's Prayer Times</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {PRAYER_TIMES.map((p) => (
                        <div
                          key={p.name}
                          className={`rounded-lg p-2 text-center ${
                            p.active
                              ? "bg-[#550C18] text-white"
                              : "bg-[#fdf7f8] text-[#5a4a4e]"
                          }`}
                        >
                          <p className={`text-[10px] font-semibold ${p.active ? "text-white/80" : "text-[#8a7074]"}`}>{p.name}</p>
                          <p className="text-xs font-bold mt-0.5">{p.adhan}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="border-y border-[#550C18]/8 bg-white py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-[#8a7074]">
            <span className="font-medium text-[#5a4a4e]">Trusted by masjids in:</span>
            {["Atlanta", "Chicago", "Dallas", "Houston", "New York", "Toronto"].map((city) => (
              <span key={city} className="font-semibold text-[#550C18]">{city}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#550C18] mb-3">What's Included</p>
            <h2 className={`text-4xl md:text-5xl font-bold text-[#2e0c12] mb-4 ${philosopher.className}`}>
              Four products. One platform.
            </h2>
            <p className="text-lg text-[#5a4a4e] max-w-2xl mx-auto">
              Stop juggling disconnected tools. Mizan brings prayer times, donations,
              digital displays, and your masjid website under one roof.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <ProductFeature
              icon={<Tv className="h-6 w-6" />}
              title="MizanTV — Smart TV Displays"
              description="Plug in a Fire Stick or Android device and your prayer times, announcements, and custom slides appear instantly. Change content from your phone in seconds — no IT needed."
              bullets={[
                "Automatic prayer time updates",
                "Custom slides & announcements",
                "Multiple screen layouts",
                "Remote management from anywhere",
              ]}
              badge="Most Popular"
            />
            <ProductFeature
              icon={<CreditCard className="h-6 w-6" />}
              title="MizanDonations — Kiosk & Online"
              description="Accept donations at the masjid or online. Built for Islamic giving — Zakat, Sadaqah, building fund, and custom categories. Donors get instant receipts."
              bullets={[
                "Tap-to-give kiosk for the lobby",
                "Online donation portal",
                "Automatic Zakat calculation",
                "Detailed giving reports",
              ]}
            />
            <ProductFeature
              icon={<Globe className="h-6 w-6" />}
              title="MizanWeb — Masjid Website"
              description="A professional website for your masjid that stays current automatically. Prayer times, events, and announcements sync from your dashboard without any extra work."
              bullets={[
                "Prayer times auto-sync",
                "Events & announcements",
                "Mobile-first design",
                "Custom domain included",
              ]}
            />
            <ProductFeature
              icon={<LayoutDashboard className="h-6 w-6" />}
              title="Admin Dashboard"
              description="One dashboard to manage your entire masjid's digital presence. Role-based access so imams, admins, and volunteers each see exactly what they need."
              bullets={[
                "Role-based staff access",
                "Analytics & donation reports",
                "Event & calendar management",
                "Multi-masjid support",
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-[#550C18]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#f5c5c5] mb-3">Getting Started</p>
            <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 ${philosopher.className}`}>
              Up and running in one afternoon
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto">
              No technical expertise required. If you can send an email, you can run Mizan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Create your account",
                desc: "Sign up and set your masjid's name, location, and prayer calculation method. Takes 3 minutes.",
              },
              {
                step: "02",
                title: "Connect your displays",
                desc: "Plug a Fire Stick into your TV, open MizanTV, and enter the pairing code shown on screen.",
              },
              {
                step: "03",
                title: "Invite your team",
                desc: "Add your imam, admin, and volunteers with the right permissions. Everyone works from the same dashboard.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white font-bold text-lg mb-5">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-white/65 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Mizan */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#550C18] mb-3">Built for Masjids</p>
              <h2 className={`text-4xl font-bold text-[#2e0c12] mb-6 ${philosopher.className}`}>
                Not another generic SaaS tool
              </h2>
              <p className="text-[#5a4a4e] leading-relaxed mb-8">
                Most masjids are stuck using a mix of WhatsApp groups, outdated websites,
                paper sign-up sheets, and manual donation tracking. Mizan was built
                from the ground up for the specific needs of Muslim communities — from
                Hijri dates to Zakat calculations to Jummuah reminders.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Clock className="h-5 w-5" />, title: "Prayer times that update themselves", desc: "Calculation methods from ISNA, ICNA, MWL, and more. No manual entry required." },
                  { icon: <Shield className="h-5 w-5" />, title: "Secure & compliant", desc: "PCI-compliant donation processing. Your community's data stays protected." },
                  { icon: <Zap className="h-5 w-5" />, title: "Instant everywhere", desc: "Change the iqamah time and every TV in your masjid updates within seconds." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#550C18]/8 text-[#550C18] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2e0c12]">{item.title}</p>
                      <p className="text-sm text-[#8a7074] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "50+", label: "Masjids served" },
                { value: "< 10min", label: "Setup time" },
                { value: "$2M+", label: "Donations processed" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#550C18]/10 bg-white p-6 text-center"
                >
                  <p className={`text-4xl font-bold text-[#550C18] ${philosopher.className}`}>{stat.value}</p>
                  <p className="text-sm text-[#8a7074] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#fdf5f6]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#550C18] mb-3">From the Community</p>
            <h2 className={`text-4xl font-bold text-[#2e0c12] ${philosopher.className}`}>
              Masjid leaders love Mizan
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "Before Mizan, we had three different systems and nothing talked to each other. Now everything is in one place and our Friday donations are up 30%.",
                name: "Br. Abdullah Hassan",
                role: "General Secretary",
                masjid: "Al-Noor Islamic Center, Atlanta",
              },
              {
                quote: "Setting up the TV displays took 10 minutes. Our community notices immediately when the prayer times are accurate and updated — it builds trust.",
                name: "Sr. Fatima Al-Rashid",
                role: "Operations Director",
                masjid: "Islamic Society of Greater Chicago",
              },
              {
                quote: "The kiosk has been a game changer. People who never had cash are now donating regularly. The reports make it easy to give accountability to our board.",
                name: "Imam Yusuf Ibrahim",
                role: "Imam & Executive Director",
                masjid: "Masjid Al-Rahman, Dallas",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-[#550C18]/8 p-6 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#5a4a4e] leading-relaxed flex-1">"{t.quote}"</p>
                <div className="mt-5 pt-5 border-t border-[#550C18]/8">
                  <p className="font-semibold text-[#2e0c12] text-sm">{t.name}</p>
                  <p className="text-xs text-[#8a7074] mt-0.5">{t.role}</p>
                  <p className="text-xs text-[#550C18] mt-0.5">{t.masjid}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#550C18] mb-3">Pricing</p>
            <h2 className={`text-4xl md:text-5xl font-bold text-[#2e0c12] mb-4 ${philosopher.className}`}>
              Simple, honest pricing
            </h2>
            <p className="text-lg text-[#5a4a4e] mb-8">
              No hidden fees. No long-term contracts. Cancel anytime.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center rounded-xl border border-[#550C18]/15 bg-[#fdf5f6] p-1 gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white shadow-sm text-[#550C18]"
                    : "text-[#8a7074]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === "annual"
                    ? "bg-white shadow-sm text-[#550C18]"
                    : "text-[#8a7074]"
                }`}
              >
                Annual
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-1.5 py-0.5 rounded-md">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price={billingCycle === "monthly" ? 49 : 39}
              cycle={billingCycle}
              description="Perfect for a single masjid location getting started."
              features={[
                "Up to 2 TV displays",
                "Prayer times management",
                "Donation kiosk (basic)",
                "Events calendar",
                "Email support",
              ]}
            />
            <PricingCard
              name="Growth"
              price={billingCycle === "monthly" ? 99 : 79}
              cycle={billingCycle}
              description="For active masjids that need more screens and features."
              features={[
                "Up to 8 TV displays",
                "Everything in Starter",
                "Online donations portal",
                "Custom masjid website",
                "Priority support",
                "Analytics dashboard",
              ]}
              featured
            />
            <PricingCard
              name="Enterprise"
              price={null}
              cycle={billingCycle}
              description="Multiple locations, custom integrations, white-glove setup."
              features={[
                "Unlimited displays",
                "Everything in Growth",
                "Multi-location management",
                "Custom integrations",
                "Dedicated account manager",
                "On-site training",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#2e0c12]">
        <div className="container mx-auto px-6 text-center">
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 ${philosopher.className}`}>
            Ready to modernize your masjid?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Join dozens of masjids already running on Mizan. Start free —
            no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-[#550C18] hover:bg-[#fdf5f6] text-base px-8 h-12 rounded-lg font-semibold"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-base px-8 h-12 rounded-lg"
              >
                Talk to Us First
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductFeature({
  icon,
  title,
  description,
  bullets,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#550C18]/10 bg-white p-7 relative">
      {badge && (
        <div className="absolute top-5 right-5 bg-[#550C18] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {badge}
        </div>
      )}
      <div className="w-11 h-11 rounded-xl bg-[#550C18]/8 text-[#550C18] flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#2e0c12] mb-2">{title}</h3>
      <p className="text-[#5a4a4e] text-sm leading-relaxed mb-5">{description}</p>
      <ul className="space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-sm text-[#5a4a4e]">
            <CheckCircle2 className="h-4 w-4 text-[#550C18] shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingCard({
  name,
  price,
  cycle,
  description,
  features,
  featured = false,
}: {
  name: string;
  price: number | null;
  cycle: "monthly" | "annual";
  description: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-7 flex flex-col ${
        featured
          ? "bg-[#550C18] text-white ring-4 ring-[#550C18]/30"
          : "bg-white border border-[#550C18]/10"
      }`}
    >
      {featured && (
        <div className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-4">
          Most Popular
        </div>
      )}
      <h3 className={`text-xl font-semibold mb-1 ${featured ? "text-white" : "text-[#2e0c12]"}`}>
        {name}
      </h3>
      <p className={`text-sm mb-5 ${featured ? "text-white/70" : "text-[#8a7074]"}`}>
        {description}
      </p>
      <div className="mb-6">
        {price !== null ? (
          <>
            <span className={`text-5xl font-bold ${featured ? "text-white" : "text-[#2e0c12]"}`}>
              ${price}
            </span>
            <span className={`text-sm ml-1 ${featured ? "text-white/60" : "text-[#8a7074]"}`}>
              /mo{cycle === "annual" ? ", billed annually" : ""}
            </span>
          </>
        ) : (
          <span className={`text-3xl font-bold ${featured ? "text-white" : "text-[#2e0c12]"}`}>
            Custom
          </span>
        )}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className={`flex items-start gap-2.5 text-sm ${featured ? "text-white/85" : "text-[#5a4a4e]"}`}>
            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${featured ? "text-white" : "text-[#550C18]"}`} />
            {f}
          </li>
        ))}
      </ul>
      <Link href={price !== null ? "/signup" : "#contact"}>
        <Button
          className={`w-full h-11 rounded-lg font-semibold ${
            featured
              ? "bg-white text-[#550C18] hover:bg-[#fdf5f6]"
              : "bg-[#550C18] text-white hover:bg-[#3d0912]"
          }`}
        >
          {price !== null ? "Get Started" : "Contact Us"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
