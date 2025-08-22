import {
  formatPrice,
  formatPhone,
  formatDate,
  formatDateTime,
  formatSlug,
  formatName,
  capitalize,
  truncateText,
  formatNumber,
  formatPercentage,
  formatProductName,
  formatTime,
  formatCurrency,
  formatPhoneNumber,
} from "../../src/utils/formatting";

describe("Formatting Utils", () => {
  describe("formatPrice", () => {
    it("should format prices correctly", () => {
      expect(formatPrice(1000)).toBe("10 ₽");
      expect(formatPrice(500)).toBe("5 ₽");
      expect(formatPrice(0)).toBe("0 ₽");
      expect(formatPrice(99)).toBe("0,99 ₽");
    });

    it("should handle different currencies", () => {
      expect(formatPrice(1000, "$")).toBe("10 $");
      expect(formatPrice(1000, "€")).toBe("10 €");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with thousands separators", () => {
      expect(formatNumber(1000)).toBe("1 000");
      expect(formatNumber(1000000)).toBe("1 000 000");
      expect(formatNumber(500)).toBe("500");
    });
  });

  describe("formatPhone", () => {
    it("should format phone numbers correctly", () => {
      expect(formatPhone("+79001234567")).toBe("+7 (900) 123-45-67");
    });

    it("should handle different phone formats", () => {
      expect(formatPhone("+1234567890")).toBe("+1234567890");
    });

    it("should handle invalid phone numbers", () => {
      expect(formatPhone("")).toBe("");
      expect(formatPhone("abc")).toBe("abc");
    });
  });

  describe("formatDate", () => {
    it("should format dates correctly", () => {
      const date = new Date("2023-12-25");
      expect(formatDate(date)).toMatch(/25\.12\.2023|2023-12-25/);
      expect(formatDate("2023-12-25")).toMatch(/25\.12\.2023|2023-12-25/);
    });

    it("should handle invalid dates", () => {
      expect(formatDate("")).toBe("");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time together", () => {
      const date = new Date("2023-12-25T14:30:00");
      expect(formatDateTime(date)).toMatch(/2023|25/);
    });
  });

  describe("formatSlug", () => {
    it("should create valid slugs from text", () => {
      expect(formatSlug("product-name")).toBe("Product Name");
      expect(formatSlug("special-characters")).toBe("Special Characters");
      expect(formatSlug("multiple-spaces")).toBe("Multiple Spaces");
      expect(formatSlug("numbers-123")).toBe("Numbers 123");
    });

    it("should handle edge cases", () => {
      expect(formatSlug("")).toBe("");
      expect(formatSlug("a")).toBe("A");
    });
  });

  describe("formatName", () => {
    it("should format names correctly", () => {
      expect(formatName("product name")).toBe("Product Name");
      expect(formatName("PRODUCT NAME")).toBe("Product Name");
      expect(formatName("pRoDuCt nAmE")).toBe("Product Name");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter only", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("Hello");
      expect(capitalize("hELLO")).toBe("Hello");
    });

    it("should handle edge cases", () => {
      expect(capitalize("")).toBe("");
      expect(capitalize("a")).toBe("A");
    });
  });

  describe("truncateText", () => {
    it("should truncate text correctly", () => {
      const longText = "This is a very long text that should be truncated";
      expect(truncateText(longText, 20)).toBe("This is a very lo...");
      expect(truncateText(longText, 50)).toBe(longText); // No truncation needed
    });

    it("should handle custom ellipsis", () => {
      const longText = "This is a long text";
      expect(truncateText(longText, 10, "***")).toBe("This is a***");
    });

    it("should handle edge cases", () => {
      expect(truncateText("", 10)).toBe("");
      expect(truncateText("Short", 10)).toBe("Short");
      expect(truncateText("Text", 4)).toBe("Text");
      expect(truncateText("Text", 3)).toBe("...");
    });
  });

  describe("complex formatting scenarios", () => {
    it("should format product display data", () => {
      const product = {
        name: "delicious pizza",
        price: 1500,
        description:
          "This is a very long description that should be truncated for display purposes",
      };

      const formatted = {
        name: formatProductName(product.name),
        price: formatPrice(product.price),
        shortDescription: truncateText(product.description, 50),
      };

      expect(formatted.name).toBe("Delicious Pizza");
      expect(formatted.price).toBe("15 ₽");
      expect(formatted.shortDescription).toBe(
        "This is a very long description that should be..."
      );
    });

    it("should format menu category data", () => {
      const category = {
        name: "main dishes",
        slug: "main-dishes", // This would be the actual slug
      };

      expect(formatSlug(category.slug)).toBe("Main Dishes");
    });

    it("should format order data", () => {
      const order = {
        createdAt: new Date("2023-12-25T14:30:00"),
        total: 2500,
        phone: "71234567890",
      };

      const formatted = {
        date: formatDate(order.createdAt),
        time: formatTime(order.createdAt),
        total: formatCurrency(order.total, "USD"),
        phone: formatPhoneNumber(order.phone),
      };

      expect(formatted.date).toBe("25.12.2023");
      expect(formatted.time).toBe("14:30");
      expect(formatted.total).toBe("$25.00");
      expect(formatted.phone).toBe("+7 (123) 456-78-90");
    });
  });
});
