import type { Metadata } from "next";
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
  metadataBase: new URL("https://fincalcpro.com"),
  title: {
    default: "FinCalcPro – Free Financial Calculators for Smarter Money Decisions",
    template: "%s | FinCalcPro",
  },
  description: "100+ free, accurate financial calculators for FIRE, retirement, investing, mortgages, loans, taxes, and more. Make smarter money decisions with FinCalcPro.",
  keywords: ["financial calculator", "retirement calculator", "mortgage calculator", "investment calculator", "FIRE calculator"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FinCalcPro",
    title: "FinCalcPro – Free Financial Calculators",
    description: "100+ free, accurate financial calculators for every money decision.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
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
