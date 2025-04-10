import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Philosopher } from "next/font/google";

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] });

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 container mx-auto px-8">
        <div className="text-center gap-12 items-center">
          <div className="w-full">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#550C18] leading-tight my-6">
              Unified Masjid Management Solution
            </h2>
            <p className="text-xl text-[#3A3A3A] mb-8 max-w-xl mx-auto">
              Mizan brings together prayer times, donations, digital displays,
              and websites in one powerful platform for modern masjids.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mx-auto justify-center">
              <Link href="/dashboard">
                <Button
                  className="bg-[#550C18] hover:bg-[#78001A] text-white text-lg px-8"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  variant="outline"
                  className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 text-lg px-8"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-[#550C18]/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#550C18] mb-4 my-6">
              All-in-One Masjid Management
            </h2>
            <p className="text-xl text-[#3A3A3A] max-w-2xl mx-auto">
              Mizan brings together essential tools to streamline masjid
              operations and enhance community engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              title="Masjid TV Display"
              description="Beautiful prayer time displays and announcement screens with customizable themes."
              icon="/placeholder.svg?height=80&width=80"
            />
            <FeatureCard
              title="Payment Kiosk"
              description="Secure donation collection with support for multiple funds and instant receipts."
              icon="/placeholder.svg?height=80&width=80"
            />
            <FeatureCard
              title="Cloud Websites"
              description="Professional masjid websites with prayer times, events calendar, and more."
              icon="/placeholder.svg?height=80&width=80"
            />
            <FeatureCard
              title="Admin Dashboard"
              description="Centralized control panel to manage all services from one place."
              icon="/placeholder.svg?height=80&width=80"
            />
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section id="products" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#550C18] mb-4 my-6">
              Our Products
            </h2>
            <p className="text-xl text-[#3A3A3A] max-w-2xl mx-auto text-pretty">
              Choose individual products or get the complete Mizan platform for
              your masjid.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <ProductCard
              title="Masjid TV Display"
              price="$49"
              period="monthly"
              features={[
                "Prayer time displays",
                "Announcement slides",
                "Multiple themes",
                "Remote management",
                "Automatic updates",
              ]}
            />
            <ProductCard
              title="Payment Kiosk"
              price="$79"
              period="monthly"
              features={[
                "Secure payment processing",
                "Multiple donation categories",
                "Email receipts",
                "Reporting dashboard",
                "User management",
              ]}
              featured={true}
            />
            <ProductCard
              title="Cloud Website"
              price="$39"
              period="monthly"
              features={[
                "Professional design",
                "Prayer times integration",
                "Events calendar",
                "Mobile responsive",
                "SEO optimization",
              ]}
            />
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-[#550C18] mb-6 my-4">
              Need the complete solution?
            </h3>
            <Link href="#contact">
              <Button
                size="lg"
                className="bg-[#550C18] hover:bg-[#78001A] text-white text-lg px-8"
              >
                Contact for Enterprise Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#550C18] to-[#78001A] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 my-6">
              Trusted by Masjids Worldwide
            </h2>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              See what masjid administrators are saying about Mizan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Mizan has transformed how we manage our masjid. The TV displays look professional and the donation system has increased our collections by 30%."
              name="Imam Abdullah"
              role="Al-Noor Masjid"
            />
            <TestimonialCard
              quote="The all-in-one platform saves us so much time. We used to use 3 different systems, now everything is in one place and much easier to manage."
              name="Sarah Ahmed"
              role="Islamic Center Administrator"
            />
            <TestimonialCard
              quote="Our community loves the new website and the ability to track donations online. The customer support team has been exceptional."
              name="Mohammed Khan"
              role="Masjid Al-Rahma"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 md:py-24 bg-[#550C18]/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#550C18] mb-6 my-6">
              Ready to transform your masjid management?
            </h2>
            <p className="text-xl text-[#3A3A3A] mb-8">
              Join hundreds of masjids already using Mizan to streamline
              operations and engage their communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-[#550C18] hover:bg-[#78001A] text-white text-lg px-8"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#550C18] text-[#550C18] hover:bg-[#550C18]/10 text-lg px-8"
                >
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="h-16 w-16 rounded-full bg-[#550C18]/10 flex items-center justify-center mb-4">
        <Image
          src={icon || "/placeholder.svg"}
          alt={title}
          width={40}
          height={40}
          className="text-[#550C18]"
        />
      </div>
      <h3 className="text-xl font-semibold text-[#550C18] mb-2 my-2">
        {title}
      </h3>
      <p className="text-[#3A3A3A]">{description}</p>
    </div>
  );
}

function ProductCard({
  title,
  price,
  period,
  features,
  featured = false,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${
        featured
          ? "ring-4 ring-[#550C18] shadow-xl"
          : "border border-[#550C18]/10 shadow-lg scale-95"
      }`}
    >
      {featured && (
        <div className="bg-[#550C18] text-white py-2 px-4 text-center font-medium">
          Most Popular
        </div>
      )}
      <div className="bg-white p-6">
        <h3 className="text-xl font-semibold text-[#550C18] mb-2 my-2">
          {title}
        </h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-[#3A3A3A]">{price}</span>
          <span className="text-[#3A3A3A]/70">/{period}</span>
        </div>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#550C18] shrink-0 mt-0.5" />
              <span className="text-[#3A3A3A]">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full ${
            featured
              ? "bg-[#550C18] hover:bg-[#78001A] text-white"
              : "bg-[#550C18]/10 hover:bg-[#550C18]/20 text-[#550C18]"
          }`}
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-300">
            ★
          </span>
        ))}
      </div>
      <p className="italic mb-6">{quote}</p>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm opacity-80">{role}</p>
      </div>
    </div>
  );
}
