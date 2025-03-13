import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mizan - All in One Masjid Management',
  description: 'Mizan brings together essential tools to streamline masjid operations and enhance community engagement.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
