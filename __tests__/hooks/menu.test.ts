import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import {
  useMenuData,
  useOrganizedMenuData,
  useMenuFilter,
} from '../../src/hooks/menu';
import { GET_MENU_DATA } from '../../src/graphql/utils';
import { createMockProduct, createMockCategory } from '../test-utils';

// Mock data
const mockProducts = [
  createMockProduct({ id: 'product-1', categoryIds: ['category-1'] }),
  createMockProduct({ id: 'product-2', categoryIds: ['category-1'] }),
  createMockProduct({ id: 'product-3', categoryIds: ['category-2'] }),
  createMockProduct({ id: 'product-4', categoryIds: [] }), // uncategorized
];

const mockCategories = [
  createMockCategory({ id: 'category-1', name: 'Main Dishes' }),
  createMockCategory({ id: 'category-2', name: 'Desserts' }),
];

// Test wrapper component
const createWrapper = (mocks: any[]) => {
  return ({ children }: { children: React.ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

describe('Menu Hooks', () => {
  describe('useMenuData', () => {
    it('should fetch complete menu data successfully', async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: 'brand-1',
              pointId: 'point-1',
              orderType: 'DELIVERY',
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useMenuData({
          brandId: 'brand-1',
          pointId: 'point-1',
          orderType: 'DELIVERY',
        }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.categories).toEqual([]);
      expect(result.current.products).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should handle errors gracefully', async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: 'brand-1',
              pointId: 'point-1',
              orderType: 'DELIVERY',
            },
          },
          error: new Error('Failed to fetch menu data'),
        },
      ];

      const { result } = renderHook(
        () => useMenuData({
          brandId: 'brand-1',
          pointId: 'point-1',
          orderType: 'DELIVERY',
        }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Failed to fetch menu data');
      expect(result.current.categories).toEqual([]);
      expect(result.current.products).toEqual([]);
    });

    it('should skip query when skip is true', () => {
      const mocks: any[] = [];

      const { result } = renderHook(
        () => useMenuData({
          brandId: 'brand-1',
          pointId: 'point-1',
          orderType: 'DELIVERY',
          skip: true,
        }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.categories).toEqual([]);
      expect(result.current.products).toEqual([]);
    });
  });

  describe('useOrganizedMenuData', () => {
    it('should organize products by categories', async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: 'brand-1',
              pointId: 'point-1',
              orderType: 'DELIVERY',
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useOrganizedMenuData({
          brandId: 'brand-1',
          pointId: 'point-1',
          orderType: 'DELIVERY',
        }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.organizedCategories).toHaveLength(2);
      
      // Check Main Dishes category
      const mainDishesCategory = result.current.organizedCategories.find(
        (cat: any) => cat.category.id === 'category-1'
      );
      expect(mainDishesCategory).toBeDefined();
      expect(mainDishesCategory.products).toHaveLength(2);
      
      // Check Desserts category
      const dessertsCategory = result.current.organizedCategories.find(
        (cat: any) => cat.category.id === 'category-2'
      );
      expect(dessertsCategory).toBeDefined();
      expect(dessertsCategory.products).toHaveLength(1);

      // Check uncategorized products
      expect(result.current.uncategorizedProducts).toHaveLength(1);
      expect(result.current.uncategorizedProducts[0].id).toBe('product-4');

      expect(result.current.totalProducts).toBe(4);
      expect(result.current.totalCategories).toBe(2);
    });

    it('should handle empty data gracefully', async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: 'brand-1',
              pointId: 'point-1',
              orderType: 'DELIVERY',
            },
          },
          result: {
            data: {
              categories: [],
              products: [],
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useOrganizedMenuData({
          brandId: 'brand-1',
          pointId: 'point-1',
          orderType: 'DELIVERY',
        }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.organizedCategories).toEqual([]);
      expect(result.current.uncategorizedProducts).toEqual([]);
      expect(result.current.totalProducts).toBe(0);
      expect(result.current.totalCategories).toBe(0);
    });
  });

  describe('useMenuFilter', () => {
    it('should filter menu data by search term', () => {
      const { result } = renderHook(() =>
        useMenuFilter({
          products: mockProducts,
          categories: mockCategories,
          filters: {
            searchTerm: 'product-1',
          },
        })
      );

      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].id).toBe('product-1');
      expect(result.current.filteredCategories).toEqual(mockCategories);
    });

    it('should filter by category', () => {
      const { result } = renderHook(() =>
        useMenuFilter({
          products: mockProducts,
          categories: mockCategories,
          filters: {
            categoryId: 'category-1',
          },
        })
      );

      expect(result.current.filteredProducts).toHaveLength(2);
      expect(result.current.filteredProducts.every(p => 
        p.categoryIds?.includes('category-1')
      )).toBe(true);
    });

    it('should filter by price range', () => {
      const { result } = renderHook(() =>
        useMenuFilter({
          products: mockProducts,
          categories: mockCategories,
          filters: {
            priceRange: {
              min: 400,
              max: 600,
            },
          },
        })
      );

      expect(result.current.filteredProducts.every(p => 
        p.pricePoint >= 400 && p.pricePoint <= 600
      )).toBe(true);
    });

    it('should filter by tags', () => {
      const { result } = renderHook(() =>
        useMenuFilter({
          products: mockProducts,
          categories: mockCategories,
          filters: {
            tagIds: ['tag-1'],
          },
        })
      );

      expect(result.current.filteredProducts.every(p => 
        p.tags?.some((tag: any) => tag.id === 'tag-1')
      )).toBe(true);
    });

    it('should apply multiple filters simultaneously', () => {
      const { result } = renderHook(() =>
        useMenuFilter({
          products: mockProducts,
          categories: mockCategories,
          filters: {
            searchTerm: 'Test',
            categoryId: 'category-1',
            priceRange: {
              min: 400,
              max: 600,
            },
          },
        })
      );

      // Products should match all criteria
      expect(result.current.filteredProducts.every(p => 
        p.name.includes('Test') &&
        p.categoryIds?.includes('category-1') &&
        p.pricePoint >= 400 && p.pricePoint <= 600
      )).toBe(true);
    });

    it('should return all data when no filters applied', () => {
      const { result } = renderHook(() =>
        useMenuFilter({
          products: mockProducts,
          categories: mockCategories,
          filters: {},
        })
      );

      expect(result.current.filteredProducts).toEqual(mockProducts);
      expect(result.current.filteredCategories).toEqual(mockCategories);
    });

    it('should sort products correctly', () => {
      const { result } = renderHook(() =>
        useMenuFilter({
          products: mockProducts,
          categories: mockCategories,
          filters: {
            sortBy: 'name',
            sortOrder: 'asc',
          },
        })
      );

      const sortedNames = result.current.filteredProducts.map(p => p.name);
      const expectedSortedNames = [...sortedNames].sort();
      expect(sortedNames).toEqual(expectedSortedNames);
    });
  });
});

// Test utilities
export const createMenuMockData = () => ({
  products: mockProducts,
  categories: mockCategories,
});

export { mockProducts as mockMenuProducts, mockCategories as mockMenuCategories };