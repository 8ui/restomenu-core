import {
  isValidEmail,
  isValidPhone,
  isValidSlug,
  isValidPrice,
  isValidString,
} from "../../src/utils/validation";

describe("Validation Utils", () => {
  describe("isValidEmail", () => {
    it("should validate correct email addresses", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
      expect(isValidEmail("test+tag@example.org")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test.example.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("should validate correct phone numbers", () => {
      expect(isValidPhone("+1234567890")).toBe(true);
      expect(isValidPhone("+79001234567")).toBe(true);
      expect(isValidPhone("+442079460958")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(isValidPhone("1234567890")).toBe(false); // Missing +
      expect(isValidPhone("+123")).toBe(false); // Too short
      expect(isValidPhone("+123456789012345678901")).toBe(false); // Too long
      expect(isValidPhone("")).toBe(false);
      expect(isValidPhone("abc")).toBe(false);
    });
  });

  describe("isValidSlug", () => {
    it("should validate correct slugs", () => {
      expect(isValidSlug("valid-slug")).toBe(true);
      expect(isValidSlug("product-123")).toBe(true);
      expect(isValidSlug("a")).toBe(true); // Single character
    });

    it("should reject invalid slugs", () => {
      expect(isValidSlug("Invalid Slug")).toBe(false); // Spaces
      expect(isValidSlug("slug!")).toBe(false); // Special characters
      expect(isValidSlug("UPPERCASE")).toBe(false); // Uppercase
      expect(isValidSlug("")).toBe(false); // Empty
      expect(isValidSlug("-start")).toBe(false); // Starts with dash
      expect(isValidSlug("end-")).toBe(false); // Ends with dash
      expect(isValidSlug("test_slug")).toBe(false); // Underscores not allowed
    });
  });

  describe("isValidPrice", () => {
    it("should validate correct prices", () => {
      expect(isValidPrice(100)).toBe(true);
      expect(isValidPrice(0)).toBe(true);
      expect(isValidPrice(1000000)).toBe(true);
    });

    it("should reject invalid prices", () => {
      expect(isValidPrice(-1)).toBe(false); // Negative
      expect(isValidPrice(99.99)).toBe(false); // Non-integer
      expect(isValidPrice(NaN)).toBe(false); // NaN
      expect(isValidPrice(Infinity)).toBe(false); // Infinity
      expect(isValidPrice(-Infinity)).toBe(false); // -Infinity
    });
  });

  describe("isValidString", () => {
    it("should validate required fields", () => {
      expect(isValidString("value")).toBe(true);
      expect(isValidString("0")).toBe(true);
      expect(isValidString("   valid   ")).toBe(true);
    });

    it("should reject empty or missing values", () => {
      expect(isValidString("")).toBe(false);
      expect(isValidString("   ")).toBe(false); // Whitespace only
    });
  });

  describe("validation with custom options", () => {
    it("should validate email with custom domain restrictions", () => {
      const validateCustomEmail = (email: string, allowedDomains: string[]) => {
        if (!isValidEmail(email)) return false;
        const domain = email.split("@")[1];
        return allowedDomains.includes(domain);
      };

      expect(validateCustomEmail("test@example.com", ["example.com"])).toBe(
        true
      );
      expect(validateCustomEmail("test@other.com", ["example.com"])).toBe(
        false
      );
    });

    it("should validate phone with country code restrictions", () => {
      const validatePhoneCountry = (
        phone: string,
        allowedCountries: string[]
      ) => {
        if (!isValidPhone(phone)) return false;
        return allowedCountries.some((country) => phone.startsWith(country));
      };

      expect(validatePhoneCountry("+1234567890", ["+1", "+7"])).toBe(true);
      expect(validatePhoneCountry("+44234567890", ["+1", "+7"])).toBe(false);
    });

    it("should validate price ranges", () => {
      const validatePriceRange = (price: number, min: number, max: number) => {
        if (!isValidPrice(price)) return false;
        return price >= min && price <= max;
      };

      expect(validatePriceRange(50, 0, 100)).toBe(true);
      expect(validatePriceRange(150, 0, 100)).toBe(false);
      expect(validatePriceRange(-10, 0, 100)).toBe(false);
    });
  });
});
