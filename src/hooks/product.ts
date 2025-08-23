import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useMemo, useCallback } from "react";
import {
  GET_PRODUCT_BASE,
  GET_PRODUCT_DETAIL,
  GET_PRODUCT_FOR_MENU,
  GET_PRODUCTS_BASE,
  GET_PRODUCTS_DETAIL,
  GET_PRODUCTS_FOR_MENU,
  GET_AVAILABLE_PRODUCTS,
  GET_FILTERED_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCT_TAGS,
  GET_PRODUCT_VARIANT_PROPERTIES,
  GET_PRODUCT_VARIANT_PROPERTY,
} from "../graphql/queries/product";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_ACTIVE,
  CREATE_PRODUCT_VARIANT_PROPERTY,
  UPDATE_PRODUCT_VARIANT_PROPERTY,
  DELETE_PRODUCT_VARIANT_PROPERTY,
} from "../graphql/mutations/product";
import { useBrandCategories } from "./category";
import type {
  ProductInput,
  ProductsInput,
  ProductCreateInput,
  ProductUpdateInput,
  ProductDeleteInput,
  ProductsFilterInput,
} from "../graphql-types";

// ====================================================================
// PRODUCT HOOKS - React hooks for product operations
// ====================================================================

// ================== WORKFLOW-CENTRIC HOOKS ==================
// These hooks are designed based on actual application usage patterns
// and provide complete workflows rather than individual operations

// ================== FORM MANAGEMENT HOOKS ==================

// Hook for comprehensive data loading required by product forms
export const useProductFormData = ({
  productId,
  brandId,
  includeVariants = true,
}: {
  productId?: string;
  brandId: string;
  includeVariants?: boolean;
}) => {
  // Load product data if editing
  const productQuery = useQuery(GET_PRODUCT_DETAIL, {
    variables: {
      input: {
        id: productId,
        brandId,
      },
    },
    skip: !productId,
    errorPolicy: "all",
  });

  // Load categories for form
  const categoriesQuery = useBrandCategories({
    brandId,
    skip: !brandId,
  });

  // Load product tags
  const tagsQuery = useProductTags({ brandId, skip: !brandId });

  // Load variant properties
  const variantPropertiesQuery = useProductVariantProperties({
    brandId,
    skip: !brandId || !includeVariants,
  });

  // Compute derived state
  const loading = useMemo(
    () =>
      productQuery.loading ||
      categoriesQuery.loading ||
      tagsQuery.loading ||
      variantPropertiesQuery.loading,
    [
      productQuery.loading,
      categoriesQuery.loading,
      tagsQuery.loading,
      variantPropertiesQuery.loading,
    ]
  );

  const error = useMemo(
    () =>
      productQuery.error ||
      categoriesQuery.error ||
      tagsQuery.error ||
      variantPropertiesQuery.error,
    [
      productQuery.error,
      categoriesQuery.error,
      tagsQuery.error,
      variantPropertiesQuery.error,
    ]
  );

  // Helper function to get Formik-compatible initial values
  const getInitialValues = useCallback(() => {
    const product = productQuery.data?.product;

    if (product) {
      // Return editing values
      return {
        brandId: product.brandId,
        id: product.id,
        name: product.name,
        slug: product.slug,
        isActive: product.isActive,
        description: product.description,
        carbohydrates: product.carbohydrates,
        calories: product.calories,
        fats: product.fats,
        protein: product.protein,
        unit: product.unit,
        unitValue: product.unitValue,
        isUnitRemove: product.isUnitRemove,
        isUnitValueRemove: product.isUnitValueRemove,
        categoryBinds:
          product.categoryBinds?.map((category: any) => ({
            categoryId: category.categoryId,
            priority: category.priority,
          })) || [],
        tagBindsByName:
          product.tags?.map((tag: any, index: number) => ({
            name: tag.name,
            priority: index,
          })) || [],
        pointBinds:
          product.pointBinds?.map((point: any) => ({
            pointId: point.pointId,
            orderType: point.orderType,
          })) || [],
        images:
          product.images?.map((image: any) => ({
            fileId: image.fileId,
            priority: image.priority,
          })) || [],
        priceSettings: {
          price: product.priceSettings?.price || 0,
          priceOrderTypes:
            product.priceSettings?.priceOrderTypes?.map((orderType: any) => ({
              orderType: orderType.orderType,
              priceCommon: orderType.priceCommon,
              priceCities:
                orderType.priceCities?.map((city: any) => ({
                  cityId: city.cityId,
                  price: city.price,
                })) || [],
              pricePoints:
                orderType.pricePoints?.map((point: any) => ({
                  pointId: point.pointId,
                  price: point.price,
                })) || [],
            })) || [],
        },
        variantGroup: product.variantGroup,
        variantSettings: product.variantSettings,
        variants: product.variants || [],
        variantsCreate: [],
      };
    } else {
      // Return creation values
      return {
        brandId,
        name: "",
        slug: "",
        isActive: true,
        description: "",
        carbohydrates: 0,
        calories: 0,
        fats: 0,
        protein: 0,
        unit: "GRAM" as const,
        unitValue: "0",
        tagBindsByName: [],
        categoryBinds: [],
        pointBinds: [],
        imagesUpload: [],
        priceSettings: {
          price: 0,
          priceOrderTypes: [
            {
              orderType: "PRE_ORDER" as const,
              priceCommon: 0,
              priceCities: [],
              pricePoints: [],
            },
            {
              orderType: "ON_TABLE" as const,
              priceCommon: 0,
              priceCities: [],
              pricePoints: [],
            },
            {
              orderType: "DELIVERY" as const,
              priceCommon: 0,
              priceCities: [],
              pricePoints: [],
            },
            {
              orderType: "PICKUP" as const,
              priceCommon: 0,
              priceCities: [],
              pricePoints: [],
            },
          ],
        },
        variantGroup: undefined,
        variantSettings: undefined,
        variantsCreate: [],
      };
    }
  }, [productQuery.data, brandId]);

  // Form validation helper
  const validateForm = useCallback((values: any) => {
    const errors: any = {};

    if (!values.name?.trim()) {
      errors.name = "Название обязательно";
    }

    if (!values.slug?.trim()) {
      errors.slug = "URL-код обязателен";
    } else if (!/^[a-z0-9\-]+$/.test(values.slug)) {
      errors.slug = "URL-код может содержать только буквы, цифры и дефисы";
    }

    if (values.priceSettings?.price && values.priceSettings.price < 0) {
      errors.price = "Цена не может быть отрицательной";
    }

    return errors;
  }, []);

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([
      productQuery.refetch(),
      categoriesQuery.refetch(),
      tagsQuery.refetch(),
      variantPropertiesQuery.refetch(),
    ]);
  }, [productQuery, categoriesQuery, tagsQuery, variantPropertiesQuery]);

  return {
    // Core data
    product: productQuery.data?.product || null,
    categories: categoriesQuery.data?.categories || [],
    tags: tagsQuery.data?.productTags || [],
    variantProperties:
      variantPropertiesQuery.data?.productVariantProperties || [],

    // State
    loading,
    error,

    // Actions
    refetch,

    // Form helpers
    getInitialValues,
    validateForm,
  };
};

// ================== VARIANT MANAGEMENT HOOKS ==================

// Hook for complete variant management system
export const useProductVariantWorkflow = ({
  brandId,
  baseProduct,
}: {
  brandId: string;
  baseProduct?: any;
}) => {
  // Load variant properties
  const variantPropertiesQuery = useProductVariantProperties({
    brandId,
    skip: !brandId,
  });

  const variantProperties = useMemo(
    () => variantPropertiesQuery.data?.productVariantProperties || [],
    [variantPropertiesQuery.data]
  );

  // Get selected properties from base product
  const selectedProperties = useMemo(() => {
    if (!baseProduct) return [];

    // From variantGroup
    if (baseProduct.variantGroup?.variantPropertyBinds) {
      return baseProduct.variantGroup.variantPropertyBinds
        .map((bind: any) =>
          variantProperties.find(
            (prop: any) => prop.id === bind.variantPropertyId
          )
        )
        .filter(Boolean);
    }

    // From existing variants analysis
    if (baseProduct.variants?.length > 0 || baseProduct.variantSettings) {
      const usedPropertyIds = new Set<string>();

      baseProduct.variantSettings?.variantPropertyBinds?.forEach(
        (bind: any) => {
          usedPropertyIds.add(bind.variantPropertyId);
        }
      );

      baseProduct.variants?.forEach((variant: any) => {
        variant.variantSettings?.variantPropertyBinds?.forEach((bind: any) => {
          usedPropertyIds.add(bind.variantPropertyId);
        });
      });

      return Array.from(usedPropertyIds)
        .map((propertyId) =>
          variantProperties.find((prop: any) => prop.id === propertyId)
        )
        .filter(Boolean);
    }

    return [];
  }, [baseProduct, variantProperties]);

  // Generate variant combinations from selected properties
  const generateVariants = useCallback(
    (propertyIds: string[]) => {
      if (propertyIds.length === 0) return [];

      const selectedProps = propertyIds
        .map((id) => variantProperties.find((prop: any) => prop.id === id))
        .filter(Boolean);

      if (selectedProps.length === 0) return [];

      // Generate all possible combinations
      const generateCombinations = (props: any[]): any[][] => {
        if (props.length === 0) return [[]];
        if (props.length === 1) {
          return props[0].values.map((value: any) => [
            { propertyId: props[0].id, valueId: value.id, value },
          ]);
        }

        const [first, ...rest] = props;
        const restCombinations = generateCombinations(rest);

        return first.values.flatMap((value: any) =>
          restCombinations.map((combination) => [
            { propertyId: first.id, valueId: value.id, value },
            ...combination,
          ])
        );
      };

      const combinations = generateCombinations(selectedProps);

      return combinations.map((combination, index) => {
        const variantName = `${baseProduct?.name || "Продукт"} - ${combination
          .map((c) => c.value.name)
          .join(", ")}`;

        return {
          id: `variant-${Date.now()}-${index}`,
          name: variantName,
          ...baseProduct,
          variantSettings: {
            variantPropertyBinds: combination.map((c) => ({
              variantPropertyId: c.propertyId,
              variantPropertyValueId: c.valueId,
            })),
            priority: index + 1,
            isMain: index === 0,
          },
          variantGroup: undefined,
          variants: [],
        };
      });
    },
    [variantProperties, baseProduct]
  );

  // Preview variants without full generation
  const previewVariants = useCallback(
    (propertyIds: string[]) => {
      const selectedProps = propertyIds
        .map((id) => variantProperties.find((prop: any) => prop.id === id))
        .filter(Boolean);

      if (selectedProps.length === 0) return [];

      const totalCombinations = selectedProps.reduce(
        (total, prop) => total * (prop.values?.length || 1),
        1
      );

      return {
        count: totalCombinations,
        properties: selectedProps.map((prop) => ({
          name: prop.name,
          valueCount: prop.values?.length || 0,
        })),
        sample:
          selectedProps.length > 0
            ? selectedProps
                .map((prop) => prop.values?.[0]?.name || "")
                .join(", ")
            : "",
      };
    },
    [variantProperties]
  );

  // Update variant field
  const updateVariant = useCallback((variantId: string, changes: any) => {
    // This would be implemented to update a specific variant
    // The actual implementation depends on how variants are stored in form state
    console.log("Обновление варианта:", variantId, changes);
  }, []);

  // Delete variant
  const deleteVariant = useCallback((variantId: string) => {
    console.log("Удаление варианта:", variantId);
  }, []);

  // Add variant
  const addVariant = useCallback((variant: any) => {
    console.log("Добавление варианта:", variant);
  }, []);

  // Validate variant combination
  const validateVariantCombination = useCallback((properties: any[]) => {
    // Check for duplicate combinations
    const combinations = properties.map(
      (prop) => `${prop.variantPropertyId}-${prop.variantPropertyValueId}`
    );
    const uniqueCombinations = new Set(combinations);
    return combinations.length === uniqueCombinations.size;
  }, []);

  // Get variant conflicts
  const getVariantConflicts = useCallback(() => {
    // This would analyze existing variants for conflicts
    // Return array of conflict descriptions
    return [];
  }, []);

  return {
    // Property management
    variantProperties,
    selectedProperties,

    // Variant generation
    generateVariants,
    previewVariants,

    // Variant CRUD
    updateVariant,
    deleteVariant,
    addVariant,

    // Validation
    validateVariantCombination,
    getVariantConflicts,

    // State
    hasVariants: baseProduct?.variants?.length > 0 || false,
    loading: variantPropertiesQuery.loading,
    error: variantPropertiesQuery.error,
  };
};

// Hook for managing variant properties and values
export const useVariantPropertyManagement = (brandId: string) => {
  const variantPropertiesQuery = useProductVariantProperties({
    brandId,
    skip: !brandId,
  });
  const [createProperty] = useCreateProductVariantProperty();
  const [updateProperty] = useUpdateProductVariantProperty();
  const [deleteProperty] = useDeleteProductVariantProperty();

  const properties = useMemo(
    () => variantPropertiesQuery.data?.productVariantProperties || [],
    [variantPropertiesQuery.data]
  );

  const createPropertyWithValue = useCallback(
    async (input: any) => {
      const result = await createProperty({
        variables: { input: { ...input, brandId } },
      });
      await variantPropertiesQuery.refetch();
      return result.data?.productVariantPropertyCreate;
    },
    [createProperty, brandId, variantPropertiesQuery]
  );

  const updatePropertyWithValue = useCallback(
    async (id: string, input: any) => {
      const result = await updateProperty({
        variables: { input: { id, ...input } },
      });
      await variantPropertiesQuery.refetch();
      return result.data?.productVariantPropertyUpdate;
    },
    [updateProperty, variantPropertiesQuery]
  );

  const deletePropertyWithCleanup = useCallback(
    async (id: string) => {
      const result = await deleteProperty({
        variables: { input: { id } },
      });
      await variantPropertiesQuery.refetch();
      return result.data?.productVariantPropertyDelete;
    },
    [deleteProperty, variantPropertiesQuery]
  );

  // Property validation
  const validatePropertyName = useCallback(
    (name: string) => {
      if (!name?.trim()) {
        return { isValid: false, message: "Название свойства обязательно" };
      }

      const existingProperty = properties.find(
        (prop: any) => prop.name.toLowerCase() === name.toLowerCase()
      );
      if (existingProperty) {
        return {
          isValid: false,
          message: "Свойство с таким названием уже существует",
        };
      }

      return { isValid: true, message: "" };
    },
    [properties]
  );

  const validateValueUniqueness = useCallback(
    (propertyId: string, value: string) => {
      const property = properties.find((prop: any) => prop.id === propertyId);
      if (!property) return true;

      return !property.values?.some(
        (val: any) => val.name.toLowerCase() === value.toLowerCase()
      );
    },
    [properties]
  );

  return {
    // Data
    properties,

    // CRUD operations
    createProperty: createPropertyWithValue,
    updateProperty: updatePropertyWithValue,
    deleteProperty: deletePropertyWithCleanup,

    // Validation
    validatePropertyName,
    validateValueUniqueness,

    // State
    loading: variantPropertiesQuery.loading,
    error: variantPropertiesQuery.error,
  };
};

// ================== PRICING MANAGEMENT HOOKS ==================

// Hook for managing complex pricing structure
export const useProductPricing = () => {
  // Base price setting
  const setBasePrice = useCallback((price: number) => {
    return { price: Math.max(0, price) };
  }, []);

  // Order type price setting
  const setPriceByOrderType = useCallback(
    (orderType: string, price: number) => {
      return {
        orderType,
        priceCommon: Math.max(0, price),
        priceCities: [],
        pricePoints: [],
      };
    },
    []
  );

  // City-specific price setting
  const setCityPrice = useCallback(
    (cityId: string, orderType: string, price: number) => {
      return {
        cityId,
        price: Math.max(0, price),
      };
    },
    []
  );

  // Point-specific price setting
  const setPointPrice = useCallback(
    (pointId: string, orderType: string, price: number) => {
      return {
        pointId,
        price: Math.max(0, price),
      };
    },
    []
  );

  // Calculate effective price based on context
  const calculateEffectivePrice = useCallback(
    (context: {
      basePrice: number;
      orderType: string;
      cityId?: string;
      pointId?: string;
      priceSettings?: any;
    }) => {
      const { basePrice, orderType, cityId, pointId, priceSettings } = context;

      if (!priceSettings?.priceOrderTypes) {
        return basePrice;
      }

      const orderTypeSettings = priceSettings.priceOrderTypes.find(
        (setting: any) => setting.orderType === orderType
      );

      if (!orderTypeSettings) {
        return basePrice;
      }

      // Check point-specific price first
      if (pointId) {
        const pointPrice = orderTypeSettings.pricePoints?.find(
          (pp: any) => pp.pointId === pointId
        );
        if (pointPrice) {
          return pointPrice.price;
        }
      }

      // Check city-specific price
      if (cityId) {
        const cityPrice = orderTypeSettings.priceCities?.find(
          (cp: any) => cp.cityId === cityId
        );
        if (cityPrice) {
          return cityPrice.price;
        }
      }

      // Use order type common price
      return orderTypeSettings.priceCommon || basePrice;
    },
    []
  );

  // Get all order type prices
  const getOrderTypePrices = useCallback((priceSettings?: any) => {
    if (!priceSettings?.priceOrderTypes) {
      return [
        {
          orderType: "PRE_ORDER",
          priceCommon: 0,
          priceCities: [],
          pricePoints: [],
        },
        {
          orderType: "ON_TABLE",
          priceCommon: 0,
          priceCities: [],
          pricePoints: [],
        },
        {
          orderType: "DELIVERY",
          priceCommon: 0,
          priceCities: [],
          pricePoints: [],
        },
        {
          orderType: "PICKUP",
          priceCommon: 0,
          priceCities: [],
          pricePoints: [],
        },
      ];
    }
    return priceSettings.priceOrderTypes;
  }, []);

  // Validate pricing structure
  const validatePricing = useCallback((pricing: any) => {
    const errors: string[] = [];

    if (pricing.price < 0) {
      errors.push("Базовая цена не может быть отрицательной");
    }

    pricing.priceOrderTypes?.forEach((orderType: any, index: number) => {
      if (orderType.priceCommon < 0) {
        errors.push(
          `Цена для ${orderType.orderType} не может быть отрицательной`
        );
      }

      orderType.priceCities?.forEach((city: any) => {
        if (city.price < 0) {
          errors.push(
            `Цена для города ${city.cityId} не может быть отрицательной`
          );
        }
      });

      orderType.pricePoints?.forEach((point: any) => {
        if (point.price < 0) {
          errors.push(
            `Цена для точки ${point.pointId} не может быть отрицательной`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // Get pricing conflicts
  const getPricingConflicts = useCallback((pricing: any) => {
    const conflicts: string[] = [];

    // Check for duplicate city/point configurations
    pricing.priceOrderTypes?.forEach((orderType: any) => {
      const cityIds = new Set();
      const pointIds = new Set();

      orderType.priceCities?.forEach((city: any) => {
        if (cityIds.has(city.cityId)) {
          conflicts.push(`Дубликат цены для города ${city.cityId}`);
        }
        cityIds.add(city.cityId);
      });

      orderType.pricePoints?.forEach((point: any) => {
        if (pointIds.has(point.pointId)) {
          conflicts.push(`Дубликат цены для точки ${point.pointId}`);
        }
        pointIds.add(point.pointId);
      });
    });

    return conflicts;
  }, []);

  return {
    // Price setting
    setBasePrice,
    setPriceByOrderType,
    setCityPrice,
    setPointPrice,

    // Price calculation
    calculateEffectivePrice,
    getOrderTypePrices,

    // Validation
    validatePricing,
    getPricingConflicts,
  };
};

// ================== CATEGORY & TAG INTEGRATION HOOKS ==================

// Hook for handling product-category relationships
export const useProductCategories = (brandId: string) => {
  const categoriesQuery = useBrandCategories({
    brandId,
    skip: !brandId,
  });

  const availableCategories = useMemo(
    () => categoriesQuery.data?.categories || [],
    [categoriesQuery.data]
  );

  // Bind categories to product
  const bindCategories = useCallback((categoryIds: string[]) => {
    return categoryIds.map((categoryId, index) => ({
      categoryId,
      priority: index + 1,
    }));
  }, []);

  // Unbind specific category
  const unbindCategory = useCallback(
    (categoryId: string, currentBinds: any[]) => {
      return currentBinds.filter((bind) => bind.categoryId !== categoryId);
    },
    []
  );

  // Validate category selection
  const validateCategorySelection = useCallback(
    (categoryIds: string[]) => {
      const errors: string[] = [];

      if (categoryIds.length === 0) {
        errors.push("Необходимо выбрать хотя бы одну категорию");
      }

      const invalidIds = categoryIds.filter(
        (id) => !availableCategories.find((cat: any) => cat.id === id)
      );
      if (invalidIds.length > 0) {
        errors.push(`Недействительные категории: ${invalidIds.join(", ")}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [availableCategories]
  );

  // Get required categories (if any business rules exist)
  const getRequiredCategories = useCallback(() => {
    // This could be enhanced with business logic for required categories
    return availableCategories.filter((cat: any) => cat.isRequired || false);
  }, [availableCategories]);

  return {
    // Data
    availableCategories,

    // Category management
    bindCategories,
    unbindCategory,

    // Validation
    validateCategorySelection,
    getRequiredCategories,

    // State
    loading: categoriesQuery.loading,
    error: categoriesQuery.error,
  };
};

// Hook for enhanced tag management with binding by name
export const useProductTagsWorkflow = (brandId: string) => {
  const tagsQuery = useProductTags({ brandId, skip: !brandId });

  const availableTags = useMemo(
    () => tagsQuery.data?.productTags || [],
    [tagsQuery.data]
  );

  // Bind tags by name (creating if necessary)
  const bindTagsByName = useCallback(async (tagNames: string[]) => {
    const bindings = tagNames.map((name, index) => ({
      name: name.trim(),
      priority: index + 1,
    }));

    // Filter out empty names
    return bindings.filter((binding) => binding.name.length > 0);
  }, []);

  // Create tag if it doesn't exist
  const createTagIfNotExists = useCallback(
    async (tagName: string) => {
      const existingTag = availableTags.find(
        (tag: any) => tag.name.toLowerCase() === tagName.toLowerCase()
      );

      if (existingTag) {
        return existingTag;
      }

      // In a real implementation, this would create the tag via mutation
      console.log("Создание нового тега:", tagName);
      return {
        id: `new-tag-${Date.now()}`,
        name: tagName,
        brandId,
      };
    },
    [availableTags, brandId]
  );

  // Search tags for autocomplete
  const searchTags = useCallback(
    (query: string) => {
      if (!query.trim()) return availableTags;

      const searchTerm = query.toLowerCase();
      return availableTags.filter((tag: any) =>
        tag.name.toLowerCase().includes(searchTerm)
      );
    },
    [availableTags]
  );

  // Get tag suggestions for partial input
  const getTagSuggestions = useCallback(
    (partial: string) => {
      if (!partial.trim()) return [];

      const searchTerm = partial.toLowerCase();
      return availableTags
        .filter((tag: any) => tag.name.toLowerCase().startsWith(searchTerm))
        .map((tag: any) => tag.name)
        .slice(0, 10); // Limit suggestions
    },
    [availableTags]
  );

  return {
    // Data
    availableTags,

    // Tag operations
    bindTagsByName,
    createTagIfNotExists,

    // Autocomplete support
    searchTags,
    getTagSuggestions,

    // State
    loading: tagsQuery.loading,
    error: tagsQuery.error,
  };
};

// ================== FORM SUBMISSION HOOKS ==================

// Hook for handling complex form submission workflow
export const useProductFormSubmit = () => {
  const [createProduct] = useCreateProduct();
  const [updateProduct] = useUpdateProduct();
  const client = useApolloClient();

  const submit = useCallback(
    async (values: any, options: { productId?: string } = {}) => {
      const { productId } = options;
      // Clean values for GraphQL submission
      const cleanedValues = { ...values };

      // Remove UI-only fields
      if ("variants" in cleanedValues) {
        delete cleanedValues.variants;
      }

      // Handle variant management
      if (values.variantGroup) {
        cleanedValues.variantGroup = values.variantGroup;
      }

      if (values.variantSettings) {
        cleanedValues.variantSettings = values.variantSettings;
      }

      // For creation, handle image uploads
      if (!productId) {
        if (cleanedValues.imagesUpload?.length) {
          cleanedValues.imagesUpload = cleanedValues.imagesUpload.map(
            (image: any) => ({
              file: image.file,
              priority: image.priority,
            })
          );
        }
      }

      // Handle variants creation
      if (values.variantsCreate && values.variantsCreate.length > 0) {
        cleanedValues.variantsCreate = values.variantsCreate;
      }

      // Execute mutation
      const mutation = productId ? updateProduct : createProduct;
      const result = await mutation({
        variables: { input: cleanedValues },
      });

      // Refresh related caches
      await client.refetchQueries({
        include: [
          "GetProductsForBrand",
          "GetAvailableProducts",
          "GetProductsByCategory",
        ],
      });

      return result.data?.productCreate || result.data?.productUpdate;
    },
    [createProduct, updateProduct, client]
  );

  const submitWithVariants = useCallback(
    async (values: any, options: { productId?: string } = {}) => {
      // Ensure variant data is properly structured
      if (values.variantsCreate?.length > 0) {
        // Process variant creation with automatic parent-child relationships
        const processedVariants = values.variantsCreate.map(
          (variant: any, index: number) => ({
            ...variant,
            variantSettings: {
              ...variant.variantSettings,
              priority: index + 1,
            },
          })
        );
        values.variantsCreate = processedVariants;
      }

      return submit(values, options);
    },
    [submit]
  );

  const saveAsDraft = useCallback(
    async (values: any, options: { productId?: string } = {}) => {
      // Save as inactive draft
      const draftValues = {
        ...values,
        isActive: false,
      };
      return submit(draftValues, options);
    },
    [submit]
  );

  const validateBeforeSubmit = useCallback((values: any) => {
    const validationErrors: string[] = [];

    if (!values.name?.trim()) {
      validationErrors.push("Название продукта обязательно");
    }

    if (!values.slug?.trim()) {
      validationErrors.push("URL-код обязателен");
    }

    if (values.priceSettings?.price < 0) {
      validationErrors.push("Цена не может быть отрицательной");
    }

    // Validate variants if present
    if (values.variantsCreate?.length > 0) {
      values.variantsCreate.forEach((variant: any, index: number) => {
        if (!variant.name?.trim()) {
          validationErrors.push(`Название варианта ${index + 1} обязательно`);
        }
      });
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    };
  }, []);

  return {
    submit,
    submitWithVariants,
    saveAsDraft,
    validateBeforeSubmit,
  };
};

// ================== COMPOSITE WORKFLOW HOOK ==================

// Main composite hook combining all product form workflows
export const useProductForm = ({
  productId,
  brandId,
  includeVariants = true,
}: {
  productId?: string;
  brandId: string;
  includeVariants?: boolean;
}) => {
  // Load all form data
  const formData = useProductFormData({
    ...(productId && { productId }),
    brandId,
    includeVariants,
  });

  // Submission workflow
  const submission = useProductFormSubmit();

  // Variant management
  const variants = useProductVariantWorkflow({
    brandId,
    baseProduct: formData.product,
  });

  // Variant property management
  const variantProperties = useVariantPropertyManagement(brandId);

  // Pricing management
  const pricing = useProductPricing();

  // Category management
  const categories = useProductCategories(brandId);

  // Tag management
  const tags = useProductTagsWorkflow(brandId);

  // Enhanced submission with all workflows
  const submitProduct = useCallback(
    async (values: any) => {
      // Validate all aspects
      const formValidation = formData.validateForm(values);
      const pricingValidation = pricing.validatePricing(values.priceSettings);
      const categoryValidation = categories.validateCategorySelection(
        values.categoryBinds?.map((bind: any) => bind.categoryId) || []
      );
      const submissionValidation = submission.validateBeforeSubmit(values);

      // Collect all validation errors
      const allErrors = [
        ...Object.values(formValidation),
        ...pricingValidation.errors,
        ...categoryValidation.errors,
        ...submissionValidation.errors,
      ].filter(Boolean);

      if (allErrors.length > 0) {
        throw new Error(`Ошибки валидации: ${allErrors.join(", ")}`);
      }

      // Submit with variants if present
      if (values.variantsCreate?.length > 0) {
        return submission.submitWithVariants(
          values,
          productId ? { productId } : {}
        );
      } else {
        return submission.submit(values, productId ? { productId } : {});
      }
    },
    [formData, pricing, categories, submission, productId]
  );

  // Save as draft
  const saveDraft = useCallback(
    async (values: any) => {
      return submission.saveAsDraft(values, productId ? { productId } : {});
    },
    [submission, productId]
  );

  // Enhanced validation combining all workflows
  const validateProduct = useCallback(
    (values: any) => {
      return {
        form: formData.validateForm(values),
        pricing: pricing.validatePricing(values.priceSettings),
        categories: categories.validateCategorySelection(
          values.categoryBinds?.map((bind: any) => bind.categoryId) || []
        ),
        submission: submission.validateBeforeSubmit(values),
        variants: variants.getVariantConflicts(),
      };
    },
    [formData, pricing, categories, submission, variants]
  );

  // Check if product is ready for publication
  const isReadyForPublication = useCallback(
    (values: any) => {
      const validation = validateProduct(values);
      return (
        validation.form === true &&
        validation.pricing.isValid &&
        validation.categories.isValid &&
        validation.submission.isValid &&
        validation.variants.length === 0
      );
    },
    [validateProduct]
  );

  // Get completion status for form sections
  const getCompletionStatus = useCallback(
    (values: any) => {
      return {
        basicInfo: !!values.name && !!values.slug,
        categories: values.categoryBinds?.length > 0,
        pricing: values.priceSettings?.price > 0,
        variants:
          !includeVariants ||
          values.variantsCreate?.length > 0 ||
          !variants.hasVariants,
        availability: true, // Basic assumption, could be enhanced
      };
    },
    [includeVariants, variants.hasVariants]
  );

  return {
    // Data from all workflows
    ...formData,
    variants,
    variantProperties,
    pricing,
    categories,
    tags,

    // Enhanced actions
    submitProduct,
    saveDraft,
    validateProduct,
    isReadyForPublication,
    getCompletionStatus,

    // State aggregation
    loading:
      formData.loading ||
      variants.loading ||
      categories.loading ||
      tags.loading,
    error: formData.error || variants.error || categories.error || tags.error,
  };
};

// ================== QUERY HOOKS ==================

// Hook for getting a single product with flexible detail levels and caching
export const useProduct = ({
  input,
  level = "detail",
  pointId,
  orderType,
  skip = false,
  pollInterval,
}: {
  input: ProductInput;
  level?: "base" | "detail" | "menu";
  pointId?: string;
  orderType?: string;
  skip?: boolean;
  pollInterval?: number;
}) => {
  const getQuery = () => {
    switch (level) {
      case "base":
        return GET_PRODUCT_BASE;
      case "menu":
        return GET_PRODUCT_FOR_MENU;
      default:
        return GET_PRODUCT_DETAIL;
    }
  };

  const variables =
    level === "menu" ? { input, pointId, orderType } : { input };

  const queryOptions: any = {
    variables,
    skip,
    errorPolicy: "all",
  };

  return useQuery(getQuery(), queryOptions);
};

// Hook for getting multiple products with enhanced filtering and optimization
export const useProducts = ({
  input,
  level = "detail",
  pointId,
  orderType,
  includeInactive = false,
  skip = false,
}: {
  input: ProductsInput;
  level?: "base" | "detail" | "menu";
  pointId?: string;
  orderType?: string;
  includeInactive?: boolean;
  skip?: boolean;
}) => {
  const enhancedInput = useMemo(() => {
    if (!includeInactive && input.filter) {
      return {
        ...input,
        filter: {
          ...input.filter,
          isActive:
            input.filter.isActive !== false ? true : input.filter.isActive,
        },
      };
    }
    return input;
  }, [input, includeInactive]);

  const getQuery = () => {
    switch (level) {
      case "base":
        return GET_PRODUCTS_BASE;
      case "menu":
        return GET_PRODUCTS_FOR_MENU;
      default:
        return GET_PRODUCTS_DETAIL;
    }
  };

  const variables =
    level === "menu"
      ? { input: enhancedInput, pointId, orderType }
      : { input: enhancedInput };

  return useQuery(getQuery(), {
    variables,
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting available products with performance optimization
export const useAvailableProducts = ({
  brandId,
  pointId,
  orderType,
  includeVariants = true,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  includeVariants?: boolean;
  skip?: boolean;
}) => {
  return useQuery(GET_AVAILABLE_PRODUCTS, {
    variables: { brandId, pointId, orderType, includeVariants },
    skip,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
};

// Hook for advanced product filtering and search
export const useProductSearch = ({
  brandId,
  pointId,
  orderType,
  searchTerm,
  categoryIds,
  tagIds,
  priceRange,
  skip = false,
}: {
  brandId: string;
  pointId?: string;
  orderType?: string;
  searchTerm?: string;
  categoryIds?: string[];
  tagIds?: string[];
  priceRange?: { min?: number; max?: number };
  skip?: boolean;
}) => {
  const filterInput = useMemo(() => {
    const filter: ProductsFilterInput = {
      isActive: true,
    };

    // Note: These properties may need to be added to ProductsFilterInput type
    // For now, using type assertion to avoid compilation errors
    const extendedFilter = filter as any;

    if (searchTerm) {
      extendedFilter.searchTerm = searchTerm;
    }

    if (categoryIds && categoryIds.length > 0) {
      extendedFilter.categoryIds = categoryIds;
    }

    if (tagIds && tagIds.length > 0) {
      extendedFilter.tagIds = tagIds;
    }

    if (priceRange) {
      if (priceRange.min !== undefined)
        extendedFilter.minPrice = priceRange.min;
      if (priceRange.max !== undefined)
        extendedFilter.maxPrice = priceRange.max;
    }

    return extendedFilter;
  }, [searchTerm, categoryIds, tagIds, priceRange]);

  return useQuery(GET_FILTERED_PRODUCTS, {
    variables: {
      input: {
        brandId,
        filter: filterInput,
      },
      ...(pointId && { pointId }),
      ...(orderType && { orderType }),
    },
    skip: skip || !brandId,
    errorPolicy: "all",
  });
};

// Hook for getting products by category
export const useProductsByCategory = ({
  brandId,
  categoryId,
  pointId,
  orderType,
  skip = false,
}: {
  brandId: string;
  categoryId: string;
  pointId: string;
  orderType: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { brandId, categoryId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting product tags
export const useProductTags = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PRODUCT_TAGS, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting product variant properties
export const useProductVariantProperties = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PRODUCT_VARIANT_PROPERTIES, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting a single product variant property
export const useProductVariantProperty = ({
  brandId,
  id,
  skip = false,
}: {
  brandId: string;
  id: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PRODUCT_VARIANT_PROPERTY, {
    variables: { brandId, id },
    skip,
    errorPolicy: "all",
  });
};

// ================== MUTATION HOOKS ==================

// Hook for creating a product with cache updates
export const useCreateProduct = () => {
  const client = useApolloClient();

  return useMutation(CREATE_PRODUCT, {
    update: (cache, { data }) => {
      if (data?.productCreate) {
        client.refetchQueries({
          include: [
            "GetProductsForBrand",
            "GetAvailableProducts",
            "GetProductsByCategory",
          ],
        });
      }
    },
    errorPolicy: "all",
  });
};

// Hook for updating a product with optimistic updates
export const useUpdateProduct = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_PRODUCT, {
    update: (cache, { data }) => {
      if (data?.productUpdate) {
        const updatedProduct = data.productUpdate;
        cache.modify({
          fields: {
            products(existingProducts = [], { readField }) {
              return existingProducts.map((productRef: any) => {
                if (readField("id", productRef) === updatedProduct.id) {
                  return updatedProduct;
                }
                return productRef;
              });
            },
          },
        });
      }
    },
    errorPolicy: "all",
  });
};

// Hook for deleting a product with cache cleanup
export const useDeleteProduct = () => {
  const client = useApolloClient();

  return useMutation(DELETE_PRODUCT, {
    update: (cache, { data }) => {
      if (data?.productDelete) {
        const deletedId = data.productDelete.id;
        cache.modify({
          fields: {
            products(existingProducts = [], { readField }) {
              return existingProducts.filter(
                (productRef: any) => readField("id", productRef) !== deletedId
              );
            },
          },
        });

        // Remove from cache
        const cacheId = cache.identify(data.productDelete);
        if (cacheId) {
          cache.evict({ id: cacheId });
        }
        cache.gc();
      }
    },
    errorPolicy: "all",
  });
};

// Hook for toggling product active status with optimistic updates
export const useToggleProductActive = () => {
  return useMutation(TOGGLE_PRODUCT_ACTIVE, {
    optimisticResponse: (variables: any) => ({
      productToggleActive: {
        __typename: "Product",
        id: variables.productId,
        isActive: !variables.currentStatus,
      },
    }),
    update: (cache, { data }) => {
      if (data?.productToggleActive) {
        const productRef = cache.identify(data.productToggleActive);
        if (productRef) {
          cache.modify({
            id: productRef,
            fields: {
              isActive: () => data.productToggleActive.isActive,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });
};

// Hook for creating a product variant property
export const useCreateProductVariantProperty = () => {
  return useMutation(CREATE_PRODUCT_VARIANT_PROPERTY, {
    errorPolicy: "all",
  });
};

// Hook for updating a product variant property
export const useUpdateProductVariantProperty = () => {
  return useMutation(UPDATE_PRODUCT_VARIANT_PROPERTY, {
    errorPolicy: "all",
  });
};

// Hook for deleting a product variant property
export const useDeleteProductVariantProperty = () => {
  return useMutation(DELETE_PRODUCT_VARIANT_PROPERTY, {
    errorPolicy: "all",
  });
};

// ================== PRODUCT MANAGEMENT HOOKS ==================

// Hook for managing product variants
export const useProductVariantManagement = () => {
  const client = useApolloClient();

  const createVariant = useMutation(CREATE_PRODUCT_VARIANT_PROPERTY, {
    update: (cache, { data }) => {
      if (data?.productVariantPropertyCreate) {
        client.refetchQueries({
          include: ["GetProductVariantProperties"],
        });
      }
    },
    errorPolicy: "all",
  });

  const updateVariant = useMutation(UPDATE_PRODUCT_VARIANT_PROPERTY, {
    errorPolicy: "all",
  });

  const deleteVariant = useMutation(DELETE_PRODUCT_VARIANT_PROPERTY, {
    update: (cache, { data }) => {
      if (data?.productVariantPropertyDelete) {
        const deletedId = data.productVariantPropertyDelete.id;
        const cacheId = cache.identify(data.productVariantPropertyDelete);
        if (cacheId) {
          cache.evict({ id: cacheId });
        }
        cache.gc();
      }
    },
    errorPolicy: "all",
  });

  return {
    createVariant,
    updateVariant,
    deleteVariant,
  };
};

// ================== COMPOSITE HOOKS ==================

// Enhanced hook for comprehensive product workflow management
export const useProductWorkflow = ({
  productId,
  brandId,
  pointId,
  orderType,
}: {
  productId: string;
  brandId: string;
  pointId?: string;
  orderType?: string;
}) => {
  const productQuery = useProduct({
    input: { id: productId, brandId },
    level: "detail",
    skip: !productId || !brandId,
  });

  const { createVariant, updateVariant, deleteVariant } =
    useProductVariantManagement();
  const [updateProduct] = useUpdateProduct();
  const [toggleActive] = useToggleProductActive();

  // Product state analysis
  const productState = useMemo(() => {
    const product = productQuery.data?.product;
    if (!product) return null;

    const canEdit = product.isActive;
    const canDelete = !product.isActive;
    const hasVariants = product.variants && product.variants.length > 0;
    const isAvailable =
      product.isActive &&
      (!pointId || product.availableAtPoints?.includes(pointId));

    return {
      canEdit,
      canDelete,
      hasVariants,
      isAvailable,
      isActive: product.isActive,
      variantCount: product.variants?.length || 0,
      price: product.price || 0,
      categoryCount: product.categories?.length || 0,
    };
  }, [productQuery.data, pointId]);

  // Workflow actions
  const workflowActions = useMemo(
    () => ({
      updateProduct: (input: ProductUpdateInput) =>
        updateProduct({
          variables: {
            brandId,
            id: productId,
            input,
          },
        }),
      toggleActive: () =>
        toggleActive({
          variables: {
            brandId,
            productId,
            currentStatus: productQuery.data?.product?.isActive,
          },
        }),
      addVariant: (input: any) =>
        createVariant[0]({
          variables: {
            brandId,
            productId,
            input,
          },
        }),
    }),
    [
      updateProduct,
      toggleActive,
      createVariant,
      productId,
      brandId,
      productQuery.data,
    ]
  );

  return {
    product: productQuery.data?.product || null,
    productState,
    workflowActions,
    loading: productQuery.loading,
    error: productQuery.error,
    refetch: productQuery.refetch,
  };
};

// Hook for menu display with enhanced product filtering
export const useMenuProducts = ({
  brandId,
  pointId,
  orderType,
  categoryId,
  searchTerm,
  sortBy = "name",
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  categoryId?: string;
  searchTerm?: string;
  sortBy?: "name" | "price" | "popularity";
  skip?: boolean;
}) => {
  const query = categoryId
    ? useProductsByCategory({ brandId, categoryId, pointId, orderType, skip })
    : useAvailableProducts({ brandId, pointId, orderType, skip });

  // Enhanced products with search and sorting
  const processedProducts = useMemo(() => {
    let products = query.data?.products || [];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter(
        (product: any) =>
          product.name?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    products.sort((a: any, b: any) => {
      switch (sortBy) {
        case "price":
          return (a.price || 0) - (b.price || 0);
        case "popularity":
          return (b.orderCount || 0) - (a.orderCount || 0);
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    return products;
  }, [query.data, searchTerm, sortBy]);

  return {
    products: processedProducts,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    totalCount: processedProducts.length,
  };
};

// Hook for product analytics and insights
export const useProductAnalytics = ({
  brandId,
  pointId,
  dateRange,
  skip = false,
}: {
  brandId: string;
  pointId?: string;
  dateRange?: { start: Date; end: Date };
  skip?: boolean;
}) => {
  const productsQuery = useProducts({
    input: { brandId },
    skip,
  });

  const analytics = useMemo(() => {
    const products = productsQuery.data?.products || [];

    const totalProducts = products.length;
    const activeProducts = products.filter((p: any) => p.isActive).length;
    const inactiveProducts = totalProducts - activeProducts;

    const averagePrice =
      products.length > 0
        ? products.reduce((sum: number, p: any) => sum + (p.price || 0), 0) /
          products.length
        : 0;

    const categoryDistribution = products.reduce((acc: any, p: any) => {
      if (p.categories) {
        p.categories.forEach((cat: any) => {
          acc[cat.name] = (acc[cat.name] || 0) + 1;
        });
      }
      return acc;
    }, {});

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      averagePrice,
      categoryDistribution,
      activationRate:
        totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0,
    };
  }, [productsQuery.data]);

  return {
    analytics,
    loading: productsQuery.loading,
    error: productsQuery.error,
    refetch: productsQuery.refetch,
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const PRODUCT_HOOKS = {
  // Basic query hooks
  useProduct,
  useProducts,
  useAvailableProducts,
  useProductsByCategory,
  useProductTags,
  useProductVariantProperties,
  useProductVariantProperty,

  // Advanced query hooks
  useProductSearch,

  // Basic mutation hooks
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductActive,
  useCreateProductVariantProperty,
  useUpdateProductVariantProperty,
  useDeleteProductVariantProperty,

  // Product management hooks
  useProductVariantManagement,

  // Advanced composite hooks
  useProductWorkflow,
  useMenuProducts,
  useProductFormData,
  useProductAnalytics,
} as const;

// ================== DOMAIN-SPECIFIC UTILITIES ==================

// Product availability validation utility
export const isProductAvailable = (
  product: any,
  pointId?: string,
  orderType?: string
): boolean => {
  if (!product || !product.isActive) return false;

  // Check point availability
  if (pointId && product.availableAtPoints) {
    if (!product.availableAtPoints.includes(pointId)) return false;
  }

  // Check order type availability
  if (orderType && product.availableForOrderTypes) {
    if (!product.availableForOrderTypes.includes(orderType)) return false;
  }

  return true;
};

// Product pricing calculation utility
export const calculateProductPrice = (
  product: any,
  selectedVariants?: any[],
  quantity: number = 1
): number => {
  if (!product) return 0;

  let basePrice = product.price || 0;

  // Add variant prices
  if (selectedVariants && selectedVariants.length > 0) {
    const variantPrice = selectedVariants.reduce(
      (sum, variant) => sum + (variant.additionalPrice || 0),
      0
    );
    basePrice += variantPrice;
  }

  return basePrice * quantity;
};

// Product search relevance scoring utility
export const calculateSearchRelevance = (
  product: any,
  searchTerm: string
): number => {
  if (!product || !searchTerm) return 0;

  const term = searchTerm.toLowerCase();
  let score = 0;

  // Name match (highest priority)
  if (product.name?.toLowerCase().includes(term)) {
    score += product.name.toLowerCase() === term ? 100 : 50;
  }

  // Description match
  if (product.description?.toLowerCase().includes(term)) {
    score += 25;
  }

  // Tag matches
  if (product.tags) {
    product.tags.forEach((tag: any) => {
      if (tag.name?.toLowerCase().includes(term)) {
        score += 15;
      }
    });
  }

  // Category matches
  if (product.categories) {
    product.categories.forEach((category: any) => {
      if (category.name?.toLowerCase().includes(term)) {
        score += 10;
      }
    });
  }

  return score;
};

// Product sorting utility
export const sortProducts = (
  products: any[],
  sortBy: "name" | "price" | "popularity" | "relevance",
  searchTerm?: string
): any[] => {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return (a.price || 0) - (b.price || 0);
      case "popularity":
        return (b.orderCount || 0) - (a.orderCount || 0);
      case "relevance":
        if (searchTerm) {
          const scoreA = calculateSearchRelevance(a, searchTerm);
          const scoreB = calculateSearchRelevance(b, searchTerm);
          return scoreB - scoreA;
        }
        return (a.name || "").localeCompare(b.name || "");
      default:
        return (a.name || "").localeCompare(b.name || "");
    }
  });
};

// Product summary utility
export const getProductSummary = (product: any) => {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    price: product.price || 0,
    isActive: product.isActive,
    categoryCount: product.categories?.length || 0,
    variantCount: product.variants?.length || 0,
    tagCount: product.tags?.length || 0,
    hasImage: !!product.imageUrl,
    lastModified: product.updatedAt || product.createdAt,
    availability: {
      totalPoints: product.availableAtPoints?.length || 0,
      orderTypes: product.availableForOrderTypes?.length || 0,
    },
  };
};

// Product validation utility
export const validateProduct = (
  product: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!product.name || product.name.trim() === "") {
    errors.push("Product name is required");
  }

  if (product.price !== undefined && product.price < 0) {
    errors.push("Product price cannot be negative");
  }

  if (!product.categories || product.categories.length === 0) {
    errors.push("Product must belong to at least one category");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
