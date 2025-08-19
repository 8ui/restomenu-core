import type { Phone, Uuid } from '../types/common';

/**
 * Validates if a string is a valid UUID
 */
export function isValidUuid(value: string): value is Uuid {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validates if a string is a valid phone number in E.164 format
 */
export function isValidPhone(value: string): value is Phone {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(value);
}

/**
 * Validates if a string is a valid email address
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validates if a string is a valid slug (alphanumeric, hyphens, underscores)
 */
export function isValidSlug(value: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(value);
}

/**
 * Validates if a number is a valid price (positive integer)
 */
export function isValidPrice(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Validates if a string is not empty and has minimum length
 */
export function isValidString(value: string, minLength = 1): boolean {
  return typeof value === 'string' && value.trim().length >= minLength;
}

/**
 * Validates if a value is a valid priority number
 */
export function isValidPriority(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Validates if a value is a valid quantity
 */
export function isValidQuantity(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validates if a value is a valid percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

/**
 * Validates if a value is a valid nutrition value (calories, proteins, etc.)
 */
export function isValidNutritionValue(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a value is a valid file size (in bytes)
 */
export function isValidFileSize(value: number, maxSizeInBytes: number): boolean {
  return typeof value === 'number' && value > 0 && value <= maxSizeInBytes;
}

/**
 * Validates if a string is a valid file extension
 */
export function isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}
