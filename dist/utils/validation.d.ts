import type { Phone, Uuid } from '../types/common';
/**
 * Validates if a string is a valid UUID
 */
export declare function isValidUuid(value: string): value is Uuid;
/**
 * Validates if a string is a valid phone number in E.164 format
 */
export declare function isValidPhone(value: string): value is Phone;
/**
 * Validates if a string is a valid email address
 */
export declare function isValidEmail(value: string): boolean;
/**
 * Validates if a string is a valid slug (alphanumeric, hyphens, underscores)
 */
export declare function isValidSlug(value: string): boolean;
/**
 * Validates if a number is a valid price (positive integer)
 */
export declare function isValidPrice(value: number): boolean;
/**
 * Validates if a string is not empty and has minimum length
 */
export declare function isValidString(value: string, minLength?: number): boolean;
/**
 * Validates if a value is a valid priority number
 */
export declare function isValidPriority(value: number): boolean;
/**
 * Validates if a value is a valid quantity
 */
export declare function isValidQuantity(value: number): boolean;
/**
 * Validates if a value is a valid percentage (0-100)
 */
export declare function isValidPercentage(value: number): boolean;
/**
 * Validates if a value is a valid nutrition value (calories, proteins, etc.)
 */
export declare function isValidNutritionValue(value: number): boolean;
/**
 * Validates if a string is a valid URL
 */
export declare function isValidUrl(value: string): boolean;
/**
 * Validates if a value is a valid file size (in bytes)
 */
export declare function isValidFileSize(value: number, maxSizeInBytes: number): boolean;
/**
 * Validates if a string is a valid file extension
 */
export declare function isValidFileExtension(filename: string, allowedExtensions: string[]): boolean;
//# sourceMappingURL=validation.d.ts.map