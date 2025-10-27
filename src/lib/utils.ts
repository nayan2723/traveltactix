import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency helpers - Shopify prices are already in INR
export function formatINR(amountInr: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amountInr);
}
export function applyDiscount(amount: number, discountPercent: number) {
  return Math.round(amount * (1 - discountPercent / 100));
}
