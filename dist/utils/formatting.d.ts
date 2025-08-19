import type { Scalars } from "../graphql-types";
/**
 * Formats a price value in kopecks to a display string
 */
export declare function formatPrice(priceInKopecks: Scalars["Int53"]["output"], currency?: string): string;
/**
 * Formats a phone number for display
 */
export declare function formatPhone(phone: string): string;
/**
 * Formats a number with thousands separators
 */
export declare function formatNumber(value: number): string;
/**
 * Formats a percentage value
 */
export declare function formatPercentage(value: number, decimals?: number): string;
/**
 * Formats a date to a readable string
 */
export declare function formatDate(date: Date | string, locale?: string): string;
/**
 * Formats a date and time to a readable string
 */
export declare function formatDateTime(date: Date | string, locale?: string): string;
/**
 * Formats a relative time (e.g., "2 hours ago")
 */
export declare function formatRelativeTime(date: Date | string): string;
/**
 * Formats a slug to a readable title
 */
export declare function formatSlug(slug: string): string;
/**
 * Formats a nutrition value with unit
 */
export declare function formatNutrition(value: number, unit: string): string;
/**
 * Formats a quantity with unit
 */
export declare function formatQuantity(quantity: number, unit: string): string;
/**
 * Truncates text to a specified length
 */
export declare function truncateText(text: string, maxLength: number, suffix?: string): string;
/**
 * Capitalizes the first letter of a string
 */
export declare function capitalize(text: string): string;
/**
 * Formats a name (first letter uppercase, rest lowercase)
 */
export declare function formatName(name: string): string;
//# sourceMappingURL=formatting.d.ts.map