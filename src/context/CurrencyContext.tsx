"use client";
import { createContext, useContext, useState } from "react";

export const CURRENCIES = [
  { code: "USD", symbol: "$",    flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", symbol: "€",    flag: "🇪🇺", name: "Euro" },
  { code: "GBP", symbol: "£",    flag: "🇬🇧", name: "British Pound" },
  { code: "INR", symbol: "₹",    flag: "🇮🇳", name: "Indian Rupee" },
  { code: "CAD", symbol: "CA$",  flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$",   flag: "🇦🇺", name: "Australian Dollar" },
  { code: "AED", symbol: "AED",  flag: "🇦🇪", name: "UAE Dirham" },
  { code: "CHF", symbol: "Fr",   flag: "🇨🇭", name: "Swiss Franc" },
  { code: "JPY", symbol: "¥",    flag: "🇯🇵", name: "Japanese Yen" },
  { code: "SGD", symbol: "S$",   flag: "🇸🇬", name: "Singapore Dollar" },
  { code: "MXN", symbol: "MX$",  flag: "🇲🇽", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$",   flag: "🇧🇷", name: "Brazilian Real" },
];

interface CurrencyCtx {
  currency: string;
  symbol: string;
  setCurrency: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: "USD",
  symbol: "$",
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? "$";
  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
