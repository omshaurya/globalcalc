import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import CustomCursor from "@/components/ui/CustomCursor";
import PageTransition from "@/components/animations/PageTransition";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://finstyra.com"),
  title: {
    default: "Finstyra – Free Financial Calculators for Smarter Money Decisions",
    template: "%s | Finstyra",
  },
  description: "100+ free, accurate financial calculators for FIRE, retirement, investing, mortgages, loans, taxes, and more. Trusted by users across the US and Europe to make smarter money decisions.",
  keywords: ["financial calculator", "retirement calculator", "mortgage calculator", "investment calculator", "FIRE calculator", "loan calculator", "EMI calculator", "currency converter"],
  applicationName: "Finstyra",
  authors: [{ name: "Finstyra" }],
  creator: "Finstyra",
  publisher: "Finstyra",
  category: "finance",
  formatDetection: { telephone: false },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "en-GB": "/",
      en: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "en_US",
    alternateLocale: ["en_GB"],
    siteName: "Finstyra",
    title: "Finstyra – Free Financial Calculators",
    description: "100+ free, accurate financial calculators for every money decision — trusted across the US and Europe.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finstyra – Free Financial Calculators",
    description: "100+ free, accurate financial calculators for every money decision.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Finstyra",
  "url": "https://finstyra.com",
  "logo": "https://finstyra.com/icon-512.png",
  "description": "Finstyra provides 100+ free financial calculators for FIRE, retirement, investing, mortgages, loans, and taxes.",
  "areaServed": ["US", "GB", "EU"],
  "sameAs": [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Finstyra",
  "url": "https://finstyra.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://finstyra.com/calculators?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Consent Manager — must load first to gate all other scripts */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script suppressHydrationWarning type="text/javascript" data-cmp-ab="1" src="https://cdn.consentmanager.net/delivery/autoblocking/087c94bc02eba.js" data-cmp-host="d.delivery.consentmanager.net" data-cmp-cdn="cdn.consentmanager.net" data-cmp-codesrc="16" />
        {/* Google Analytics */}
        <script suppressHydrationWarning async src="https://www.googletagmanager.com/gtag/js?id=G-BEPJNBT2LC" />
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-BEPJNBT2LC');` }} />
        {/* Structured data */}
        <script suppressHydrationWarning type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script suppressHydrationWarning type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        {/* Theme init */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`
        }} />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <CustomCursor />
        <ToastProvider>
          <Navbar />
          <PageTransition>
            <main id="main-content">{children}</main>
          </PageTransition>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
