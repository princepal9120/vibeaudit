import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vibeaudit.site"),
  title: {
    default: "VibeAudit - Security Scanning for Indie Builders",
    template: "%s | VibeAudit",
  },
  description:
    "Scan your code and live apps for security vulnerabilities. Get plain-English explanations and fix suggestions in under 3 minutes. No security expertise required.",
  keywords: [
    "security scanning",
    "code security",
    "vulnerability scanner",
    "indie hackers",
    "AI code security",
    "SAST",
    "DAST",
    "secrets detection",
    "automated security audit",
  ],
  authors: [{ name: "VibeAudit Team" }],
  creator: "VibeAudit",
  publisher: "VibeAudit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vibeaudit.site",
    title: "VibeAudit - Security Scanning for Indie Builders",
    description:
      "Scan your code and live apps for security vulnerabilities. Get plain-English explanations in under 3 minutes.",
    siteName: "VibeAudit",
    images: [
      {
        url: "/og-image.png", // Assuming we might want a static file fallback or dynamic gen later, but logo serves as icon
        width: 1200,
        height: 630,
        alt: "VibeAudit - Security for Indie Builders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeAudit - Security Scanning for Indie Builders",
    description:
      "Scan your code and live apps for security vulnerabilities. Get plain-English explanations in under 3 minutes.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
