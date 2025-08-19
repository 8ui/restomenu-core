/**
 * Formats a price value in kopecks to a display string
 */
export function formatPrice(priceInKopecks, currency = "₽") {
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
export function formatPhone(phone) {
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
export function formatNumber(value) {
    return value.toLocaleString("ru-RU");
}
/**
 * Formats a percentage value
 */
export function formatPercentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`;
}
/**
 * Formats a date to a readable string
 */
export function formatDate(date, locale = "ru-RU") {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
}
/**
 * Formats a date and time to a readable string
 */
export function formatDateTime(date, locale = "ru-RU") {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString(locale);
}
/**
 * Formats a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
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
export function formatSlug(slug) {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
/**
 * Formats a nutrition value with unit
 */
export function formatNutrition(value, unit) {
    return `${value} ${unit}`;
}
/**
 * Formats a quantity with unit
 */
export function formatQuantity(quantity, unit) {
    return `${quantity} ${unit}`;
}
/**
 * Truncates text to a specified length
 */
export function truncateText(text, maxLength, suffix = "...") {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength - suffix.length) + suffix;
}
/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
/**
 * Formats a name (first letter uppercase, rest lowercase)
 */
export function formatName(name) {
    return name
        .split(" ")
        .map((word) => capitalize(word))
        .join(" ");
}
//# sourceMappingURL=formatting.js.map