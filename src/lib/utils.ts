import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency helpers
export const USD_TO_INR_RATE = 83; // Approx market rate; consider fetching dynamically
export function usdToInr(amountUsd: number, rate: number = USD_TO_INR_RATE) {
  return Math.round(amountUsd * rate);
}
export function formatINR(amountInr: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amountInr);
}
export function applyDiscount(amount: number, discountPercent: number) {
  return Math.round(amount * (1 - discountPercent / 100));
}
