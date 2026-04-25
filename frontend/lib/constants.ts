import type { Category, PaymentMode } from "@/types/expense";

export const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: "food", label: "Food & Dining", emoji: "🍽️", color: "#FF6B6B" },
  { value: "transport", label: "Transport", emoji: "🚌", color: "#4ECDC4" },
  { value: "shopping", label: "Shopping", emoji: "🛍️", color: "#A78BFA" },
  { value: "entertainment", label: "Entertainment", emoji: "🎮", color: "#F59E0B" },
  { value: "bills", label: "Bills & Utilities", emoji: "💡", color: "#3B82F6" },
  { value: "education", label: "Education", emoji: "📚", color: "#10B981" },
  { value: "rent", label: "Rent", emoji: "🏠", color: "#6C63FF" },
  { value: "subscriptions", label: "Subscriptions", emoji: "📱", color: "#EC4899" },
  { value: "emergency", label: "Emergency", emoji: "🚨", color: "#EF4444" },
  { value: "miscellaneous", label: "Miscellaneous", emoji: "📦", color: "#6B7280" },
];

export const PAYMENT_MODES: { value: PaymentMode; label: string; icon: string }[] = [
  { value: "upi", label: "UPI", icon: "📲" },
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "card", label: "Card", icon: "💳" },
  { value: "netbanking", label: "Net Banking", icon: "🏦" },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
) as Record<Category, (typeof CATEGORIES)[number]>;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
