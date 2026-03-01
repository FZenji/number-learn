import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataBase = new URL('https://number-learn.xyz');

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Number Learn Studio | Master Pi & Math Constants",
    template: "%s | Number Learn Studio"
  },
  description: "The ultimate tool for learning and memorizing mathematical constants like Pi, Euler's number, and the Golden Ratio. Featuring the Major System, recall tests, and interactive practice tools.",
  keywords: [
    "pi memorization", "memorize pi digits", "euler number", "golden ratio", 
    "math constants", "memory training", "mnemonic techniques", "major system",
    "number learn studio", "memory champions", "pi digits trainer", "recall test"
  ],
  authors: [{ name: "Henry Tolenaar" }],
  creator: "Henry Tolenaar",
  category: "Education",
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Number Learn Studio | Master Mathematical Constants",
    description: "Learn Pi, Euler's number, and more with proven mnemonic techniques. Try our interactive studio today!",
    url: 'https://number-learn.xyz',
    siteName: 'Number Learn Studio',
    locale: 'en_US',
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Number Learn Studio | Master Mathematical Constants",
    description: "Master Pi, Euler's number, and the Golden Ratio with interactive memory tools.",
    creator: "@henry_tolenaar",
    site: "@henry_tolenaar",
  },
  alternates: {
    canonical: 'https://number-learn.xyz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Number Learn Studio",
  "operatingSystem": "Web",
  "applicationCategory": "EducationalApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Interactive web application for memorizing mathematical constants using mnemonics.",
  "author": {
    "@type": "Person",
    "name": "Henry Tolenaar"
  }
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Number Learn Studio",
  "url": "https://number-learn.xyz",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://number-learn.xyz/studio?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Number Learn Studio",
  "url": "https://number-learn.xyz",
  "logo": "https://number-learn.xyz/favicon-96x96.png",
  "sameAs": [
    "https://github.com/henrytolenaar", // Placeholder
  ]
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How to memorize Pi digits efficiently?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Using mnemonic systems like the Major System or Method of Loci is the most effective way to memorize digits. Number Learn Studio provides tools to practice these techniques."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Major System?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Major System is a phonetic memory technique used to aid in memorizing numbers by converting digits into consonant sounds, then into words."
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </head>
        <body
          className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SiteHeader />
          <main className="pt-[72px]">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
