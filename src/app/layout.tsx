import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
  title: "Number Learn Studio | Master Mathematical Constants",
  description: "Learn and memorize Pi, Euler's number, the Golden Ratio, and other famous mathematical constants with proven mnemonic techniques. Developed by Henry Tolenaar.",
  keywords: ["pi memorization", "euler number", "golden ratio", "math constants", "memory training", "mnemonic techniques"],
  authors: [{ name: "Henry Tolenaar" }],
  creator: "Henry Tolenaar",
  openGraph: {
    title: "Number Learn Studio",
    description: "Master mathematical constants with proven mnemonic techniques",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Number Learn Studio",
    description: "Master mathematical constants with proven mnemonic techniques",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Force dynamic rendering to support Clerk keyless mode during development
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[var(--surface)] border-b border-[var(--border)]">
            <a href="/" className="text-lg font-semibold tracking-tight">
              Number<span className="text-[var(--primary)]">Learn</span>
            </a>
            <nav className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn-ghost">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary">Get Started</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/studio" className="btn btn-primary">
                  Studio
                </Link>
                <Link href="/contact" className="btn btn-ghost">
                  Contact
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9"
                    }
                  }}
                />
              </SignedIn>
            </nav>
          </header>
          <main className="pt-[72px]">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
