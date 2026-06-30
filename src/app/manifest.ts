import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinCalcPro – Free Financial Calculators",
    short_name: "FinCalcPro",
    description: "100+ free financial calculators for FIRE, retirement, mortgages, investing, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      { src: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    shortcuts: [
      { name: "FIRE Calculator", url: "/calculator/fire-calculator", description: "Calculate your FI number" },
      { name: "Mortgage Calculator", url: "/calculator/mortgage-calculator", description: "Calculate monthly payments" },
      { name: "SIP Calculator", url: "/calculator/sip-calculator", description: "Plan your SIP investments" },
      { name: "All Calculators", url: "/calculators", description: "Browse 100+ calculators" },
    ],
  };
}
