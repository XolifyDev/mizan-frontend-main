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
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#550C18] leading-tight my-6">
              Unified Masjid Management Solution
            </h2>
            <p className="text-xl text-[#3A3A3A] mb-8 max-w-lg">
              Mizan brings together prayer times, donations, digital displays,
              and websites in one powerful platform for modern masjids.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
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
                  className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 text-lg px-8"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#550C18] to-[#78001A] opacity-90 z-10"></div>
            <Image
              src="/placeholder.svg?height=1000&width=1000"
              alt="Masjid Management Dashboard"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg max-w-md">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Image
                    src="mizan.svg"
                    width={30}
                    height={30}
                    alt="Mizan Logo"
                  />
                  <h3 className="text-xl font-semibold text-[#550C18] my-0">
                    Mizan Dashboard
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-[#550C18]/10">
                    <p className="text-sm font-medium text-[#3A3A3A] m-0">
                      Prayer Times
                    </p>
                    <p className="text-2xl font-bold text-[#550C18] m-0">5</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#550C18]/10">
                    <p className="text-sm font-medium text-[#3A3A3A] m-0">
                      Donations
                    </p>
                    <p className="text-2xl font-bold text-[#550C18] m-0">
                      $12.5k
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#550C18]/10">
                    <p className="text-sm font-medium text-[#3A3A3A] m-0">
                      Events
                    </p>
                    <p className="text-2xl font-bold text-[#550C18] m-0">8</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#550C18]/10">
                    <p className="text-sm font-medium text-[#3A3A3A] m-0">
                      Users
                    </p>
                    <p className="text-2xl font-bold text-[#550C18] m-0">245</p>
                  </div>
                </div>
              </div>
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

      {/* Footer */}
      <footer className="bg-[#3A3A3A] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="mizan-white.svg"
                  width={33}
                  height={33}
                  alt="Mizan Logo"
                />
                <h3
                  className={`text-3xl font-bold my-0 ${philosopher.className}`}
                >
                  Mizan
                </h3>
              </div>
              <p className="text-sm opacity-80 mb-4">
                Unified Masjid Management Platform
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-white hover:text-[#FDF0D5]">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#FDF0D5]">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#FDF0D5]">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.772 1.153 4.902 4.902 0 01-1.153 1.772c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 my-0">Products</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    TV Display
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Payment Kiosk
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Cloud Website
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Admin Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 my-0">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 my-0">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-sm opacity-60">
              © 2025 Mizan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
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
