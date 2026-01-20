import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeAudit - Security Scanning for Indie Builders",
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
  ],
  openGraph: {
    title: "VibeAudit - Security Scanning for Indie Builders",
    description:
      "Scan your code and live apps for security vulnerabilities. Get plain-English explanations in under 3 minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeAudit - Security Scanning for Indie Builders",
    description:
      "Scan your code and live apps for security vulnerabilities. Get plain-English explanations in under 3 minutes.",
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
      </body>
    </html>
  );
}
