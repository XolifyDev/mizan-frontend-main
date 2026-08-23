import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const mizanTV = await prisma.product.upsert({
    where: { id: "prod_mizan_tv" },
    update: {},
    create: {
      id: "prod_mizan_tv",
      name: "MizanTV",
      description: `**The all-in-one Islamic signage solution built for your masjid.**

MizanTV turns any TV into a fully managed display — showing prayer times, iqamah countdowns, daily verses, hadiths, announcements, and more. Cloud-managed from your Mizan dashboard, so you can update content across every screen in real time without touching the hardware.

**What's included:**
- Pre-loaded MizanTV device — plug into your TV via HDMI and you're live in minutes
- Dual-band WiFi + Ethernet support
- Auto-start on power — stays running 24/7
- Synced directly to your masjid's prayer and iqamah schedule
- No inappropriate content, ads, or thumbnails — designed exclusively for Islamic centers

**Content your congregation will love:**
- Live prayer & iqamah time displays
- Iqamah countdown timers
- Daily Quran verses & hadiths
- Announcements & event slides
- Custom media (images, slides)
- Eid & Ramadan countdowns

Managed entirely from your Mizan dashboard — schedule content, push updates, and manage multiple screens across your facility from one place.`,
      features: [
        "Plug-and-play HDMI device — live in minutes",
        "Cloud-managed from your Mizan dashboard",
        "Prayer & iqamah times auto-synced",
        "Iqamah countdown & change notifications",
        "Daily Quran verse & hadith slides",
        "Custom announcements & event slides",
        "Eid & Ramadan countdown screens",
        "Dual-band WiFi + Ethernet",
        "24/7 auto-start — no manual restart needed",
        "No ads, no inappropriate content",
        "Multi-screen support from one dashboard",
      ],
      price: 10000, // cents
      category: "hardware",
      type: "kiosk",
      popular: true,
      image: "/placeholder.svg?height=400&width=600",
    },
  });

  console.log("Seeded:", mizanTV.name, `($${mizanTV.price / 100})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
