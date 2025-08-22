import { gql } from "@apollo/client";
import {
  PRODUCT_BASE_FRAGMENT,
  PRODUCT_DETAIL_FRAGMENT,
  PRODUCT_FOR_MENU_FRAGMENT,
  PRODUCT_FULL_FRAGMENT,
  PRODUCT_PRICE_SETTINGS_FRAGMENT,
  CATEGORY_BASE_FRAGMENT,
  CATEGORY_DETAIL_FRAGMENT,
  ORDER_WITH_ITEMS_FRAGMENT,
  FRAGMENTS,
} from "../../src/graphql/fragments";

// Helper function to validate GraphQL fragment structure
const validateFragment = (fragment: any) => {
  expect(fragment).toBeDefined();
  expect(fragment.kind).toBe("Document");
  expect(fragment.definitions).toHaveLength(1);
  expect(fragment.definitions[0].kind).toBe("FragmentDefinition");
};

// Helper function to get fragment fields
const getFragmentFields = (fragment: any): string[] => {
  const fragmentDef = fragment.definitions[0];
  return fragmentDef.selectionSet.selections.map((selection: any) => {
    if (selection.kind === "Field") {
      return selection.name.value;
    }
    if (selection.kind === "FragmentSpread") {
      return `...${selection.name.value}`;
    }
    return selection.kind;
  });
};

describe("GraphQL Fragments", () => {
  describe("Product Fragments", () => {
    describe("PRODUCT_BASE_FRAGMENT", () => {
      it("should be a valid GraphQL fragment", () => {
        validateFragment(PRODUCT_BASE_FRAGMENT);
      });

      it("should contain minimal product fields", () => {
        const fields = getFragmentFields(PRODUCT_BASE_FRAGMENT);

        expect(fields).toContain("id");
        expect(fields).toContain("name");
        expect(fields).toContain("slug");
        expect(fields).toContain("isActive");

        // Should not contain complex fields
        expect(fields).not.toContain("images");
        expect(fields).not.toContain("priceSettings");
      });

      it("should have correct fragment name", () => {
        const fragmentDef = PRODUCT_BASE_FRAGMENT.definitions[0];
        expect(fragmentDef.name.value).toBe("ProductBase");
        expect(fragmentDef.typeCondition.name.value).toBe("Product");
      });
    });

    describe("PRODUCT_DETAIL_FRAGMENT", () => {
      it("should be a valid GraphQL fragment", () => {
        validateFragment(PRODUCT_DETAIL_FRAGMENT);
      });

      it("should contain detailed product fields", () => {
        const fields = getFragmentFields(PRODUCT_DETAIL_FRAGMENT);

        expect(fields).toContain("id");
        expect(fields).toContain("name");
        expect(fields).toContain("slug");
        expect(fields).toContain("description");
        expect(fields).toContain("isActive");
        expect(fields).toContain("brandId");
        expect(fields).toContain("unit");
        expect(fields).toContain("unitValue");
        expect(fields).toContain("calories");
        expect(fields).toContain("carbohydrates");
        expect(fields).toContain("fats");
        expect(fields).toContain("protein");
      });
    });

    describe("PRODUCT_FOR_MENU_FRAGMENT", () => {
      it("should be a valid GraphQL fragment", () => {
        validateFragment(PRODUCT_FOR_MENU_FRAGMENT);
      });

      it("should contain menu-optimized fields", () => {
        const fields = getFragmentFields(PRODUCT_FOR_MENU_FRAGMENT);

        expect(fields).toContain("id");
        expect(fields).toContain("name");
        expect(fields).toContain("slug");
        expect(fields).toContain("description");
        expect(fields).toContain("isActive");
        expect(fields).toContain("images");
        expect(fields).toContain("pointBinds");
        expect(fields).toContain("categoryBinds");
        expect(fields).toContain("tags");
      });
    });

    describe("PRODUCT_FULL_FRAGMENT", () => {
      it("should be a valid GraphQL fragment", () => {
        validateFragment(PRODUCT_FULL_FRAGMENT);
      });

      it("should include other product fragments", () => {
        const fields = getFragmentFields(PRODUCT_FULL_FRAGMENT);

        expect(fields).toContain("...ProductDetail");
        expect(fields).toContain("...ProductImages");
        expect(fields).toContain("...ProductTags");
        expect(fields).toContain("...ProductBindings");
      });
    });

    describe("PRODUCT_PRICE_SETTINGS_FRAGMENT", () => {
      it("should be a valid GraphQL fragment", () => {
        validateFragment(PRODUCT_PRICE_SETTINGS_FRAGMENT);
      });

      it("should contain price settings fields", () => {
        const fields = getFragmentFields(PRODUCT_PRICE_SETTINGS_FRAGMENT);

        expect(fields).toContain("priceSettings");
      });

      it("should have correct fragment name", () => {
        const fragmentDef = PRODUCT_PRICE_SETTINGS_FRAGMENT.definitions[0];
        expect(fragmentDef.name.value).toBe("ProductPriceSettings");
        expect(fragmentDef.typeCondition.name.value).toBe("Product");
      });
    });
  });

  describe("Category Fragments", () => {
    describe("CATEGORY_BASE_FRAGMENT", () => {
      it("should be a valid GraphQL fragment", () => {
        validateFragment(CATEGORY_BASE_FRAGMENT);
      });

      it("should contain minimal category fields", () => {
        const fields = getFragmentFields(CATEGORY_BASE_FRAGMENT);

        expect(fields).toContain("id");
        expect(fields).toContain("name");
        expect(fields).toContain("slug");
      });
    });

    describe("CATEGORY_DETAIL_FRAGMENT", () => {
      it("should be a valid GraphQL fragment", () => {
        validateFragment(CATEGORY_DETAIL_FRAGMENT);
      });

      it("should contain detailed category fields", () => {
        const fields = getFragmentFields(CATEGORY_DETAIL_FRAGMENT);

        expect(fields).toContain("id");
        expect(fields).toContain("name");
        expect(fields).toContain("slug");
        expect(fields).toContain("imageUrl");
        expect(fields).toContain("priority");
        expect(fields).toContain("isActive");
        expect(fields).toContain("brandId");
        expect(fields).toContain("parentId");
      });
    });
  });

  describe("Order Fragments", () => {
    describe("ORDER_WITH_ITEMS_FRAGMENT", () => {
      it("should be a valid GraphQL fragment", () => {
        validateFragment(ORDER_WITH_ITEMS_FRAGMENT);
      });

      it("should include order details and items", () => {
        const fields = getFragmentFields(ORDER_WITH_ITEMS_FRAGMENT);

        expect(fields).toContain("...OrderDetail");
        expect(fields).toContain("items");
      });
    });
  });

  describe("Fragment Collections", () => {
    describe("FRAGMENTS object", () => {
      it("should contain all fragment collections", () => {
        expect(FRAGMENTS.BRAND_BASE).toBeDefined();
        expect(FRAGMENTS.BRAND_DETAIL).toBeDefined();
        expect(FRAGMENTS.CITY_BASE).toBeDefined();
        expect(FRAGMENTS.CITY_DETAIL).toBeDefined();
        expect(FRAGMENTS.POINT_BASE).toBeDefined();
        expect(FRAGMENTS.POINT_DETAIL).toBeDefined();
        expect(FRAGMENTS.CATEGORY_BASE).toBeDefined();
        expect(FRAGMENTS.CATEGORY_DETAIL).toBeDefined();
        expect(FRAGMENTS.PRODUCT_BASE).toBeDefined();
        expect(FRAGMENTS.PRODUCT_DETAIL).toBeDefined();
        expect(FRAGMENTS.PRODUCT_FULL).toBeDefined();
        expect(FRAGMENTS.PRODUCT_FOR_MENU).toBeDefined();
        expect(FRAGMENTS.PRODUCT_PRICE_SETTINGS).toBeDefined();
        expect(FRAGMENTS.USER_BASE).toBeDefined();
        expect(FRAGMENTS.USER_DETAIL).toBeDefined();
        expect(FRAGMENTS.ORDER_BASE).toBeDefined();
        expect(FRAGMENTS.ORDER_DETAIL).toBeDefined();
        expect(FRAGMENTS.ORDER_WITH_ITEMS).toBeDefined();
      });

      it("should have correct fragment types", () => {
        Object.values(FRAGMENTS).forEach((fragment) => {
          validateFragment(fragment);
        });
      });
    });
  });

  describe("Fragment Composition", () => {
    it("should allow fragments to be used in queries", () => {
      const testQuery = gql`
        query TestQuery($productId: Uuid!) {
          product(input: { productId: $productId }) {
            ...ProductBase
          }
        }
        ${PRODUCT_BASE_FRAGMENT}
      `;

      expect(testQuery).toBeDefined();
      expect(testQuery.definitions).toHaveLength(2); // Query + Fragment
    });

    it("should allow multiple fragments in one query", () => {
      const testQuery = gql`
        query TestMenuQuery(
          $brandId: Uuid!
          $pointId: Uuid!
          $orderType: OrderType!
        ) {
          categories(input: { brandId: $brandId }) {
            ...CategoryDetail
          }
          products(input: { brandId: $brandId }) {
            ...ProductForMenu
          }
        }
        ${CATEGORY_DETAIL_FRAGMENT}
        ${PRODUCT_FOR_MENU_FRAGMENT}
      `;

      expect(testQuery).toBeDefined();
      expect(testQuery.definitions).toHaveLength(3); // Query + 2 Fragments
    });

    it("should support nested fragment composition", () => {
      const testQuery = gql`
        query TestFullProductQuery($productId: Uuid!) {
          product(input: { productId: $productId }) {
            ...ProductFull
          }
        }
        ${PRODUCT_FULL_FRAGMENT}
      `;

      expect(testQuery).toBeDefined();
      // Should include the main fragment plus all nested fragments
      expect(testQuery.definitions.length).toBeGreaterThan(1);
    });
  });

  describe("Fragment Field Coverage", () => {
    it("should have progressive field coverage from base to full", () => {
      const baseFields = getFragmentFields(PRODUCT_BASE_FRAGMENT);
      const detailFields = getFragmentFields(PRODUCT_DETAIL_FRAGMENT);
      const fullFields = getFragmentFields(PRODUCT_FULL_FRAGMENT);

      // Base should be subset of detail
      baseFields.forEach((field) => {
        if (!field.startsWith("...")) {
          expect(detailFields).toContain(field);
        }
      });

      // Full should include detail through fragment composition
      expect(fullFields).toContain("...ProductDetail");
    });

    it("should avoid field duplication in composed fragments", () => {
      const fullFields = getFragmentFields(PRODUCT_FULL_FRAGMENT);

      // Should use fragment composition instead of repeating fields
      expect(
        fullFields.filter((f) => f.startsWith("...")).length
      ).toBeGreaterThan(0);

      // Should not duplicate basic fields like 'id', 'name'
      const basicFields = fullFields.filter((f) => !f.startsWith("..."));
      const uniqueBasicFields = [...new Set(basicFields)];
      expect(basicFields.length).toBe(uniqueBasicFields.length);
    });
  });

  describe("Fragment Naming Convention", () => {
    it("should follow consistent naming pattern", () => {
      const fragmentDef = PRODUCT_BASE_FRAGMENT.definitions[0];
      expect(fragmentDef.name.value).toMatch(/^[A-Z][a-zA-Z]+$/);

      const categoryDef = CATEGORY_BASE_FRAGMENT.definitions[0];
      expect(categoryDef.name.value).toMatch(/^[A-Z][a-zA-Z]+$/);
    });

    it("should have consistent type conditions", () => {
      const productFragmentDef = PRODUCT_BASE_FRAGMENT.definitions[0];
      expect(productFragmentDef.typeCondition.name.value).toBe("Product");

      const categoryFragmentDef = CATEGORY_BASE_FRAGMENT.definitions[0];
      expect(categoryFragmentDef.typeCondition.name.value).toBe("Category");
    });
  });
});
