import type { Scalars } from "../graphql-types";

/**
 * Formats a price value in kopecks to a display string
 */
export function formatPrice(
  priceInKopecks: Scalars["Int53"]["output"],
  currency = "₽"
): string {
  const rubles = Math.floor(priceInKopecks / 100);
  const kopecks = priceInKopecks % 100;

  if (kopecks === 0) {
    return `${rubles} ${currency}`;
  }

  return `${rubles},${kopecks.toString().padStart(2, "0")} ${currency}`;
}

/**
 * Formats a phone number for display
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // If it's already in E.164 format, format it for display
  if (cleaned.startsWith("+7")) {
    const number = cleaned.slice(2);
    if (number.length === 10) {
      return `+7 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6, 8)}-${number.slice(8)}`;
    }
  }

  return cleaned;
}

/**
 * Formats a number with thousands separators
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("ru-RU");
}

/**
 * Formats a percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string, locale = "ru-RU"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Formats a date and time to a readable string
 */
export function formatDateTime(date: Date | string, locale = "ru-RU"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

/**
 * Formats a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "только что";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин. назад`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ч. назад`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} дн. назад`;
  }

  return formatDate(dateObj);
}

/**
 * Formats a slug to a readable title
 */
export function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Formats a nutrition value with unit
 */
export function formatNutrition(value: number, unit: string): string {
  return `${value} ${unit}`;
}

/**
 * Formats a quantity with unit
 */
export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`;
}

/**
 * Truncates text to a specified length
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix = "..."
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formats a name (first letter uppercase, rest lowercase)
 */
export function formatName(name: string): string {
  return name
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Formats a product name (title case)
 */
export function formatProductName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Formats time from date to HH:mm format
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Formats currency amount with symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = "RUB"
): string {
  const value = amount / 100; // Convert kopecks to rubles
  const symbols: Record<string, string> = {
    RUB: "₽",
    USD: "$",
    EUR: "€",
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${value.toFixed(2)}`;
}

/**
 * Formats phone number to readable format
 */
export function formatPhoneNumber(phone: string): string {
  // Simple phone formatting - can be enhanced based on requirements
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("7") && cleaned.length === 11) {
    // Russian format: +7 (XXX) XXX-XX-XX
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }

  return phone; // Return original if format not recognized
}
