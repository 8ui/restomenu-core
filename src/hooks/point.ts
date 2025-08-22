import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  GET_POINT_BASE,
  GET_POINT_DETAIL,
  GET_POINTS_BY_BRAND,
  GET_POINTS_BY_CITY,
  GET_ACTIVE_POINTS,
} from "../graphql/queries/point";
import { CREATE_POINT, UPDATE_POINT } from "../graphql/mutations/point";
import type {
  PointInput,
  PointCreateInput,
  PointUpdateInput,
} from "../graphql-types";

// ====================================================================
// POINT HOOKS - React hooks for point operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting a single point
export const usePoint = ({
  input,
  level = "detail",
  skip = false,
}: {
  input: PointInput;
  level?: "base" | "detail";
  skip?: boolean;
}) => {
  const query = level === "base" ? GET_POINT_BASE : GET_POINT_DETAIL;

  return useQuery(query, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting points for a brand
export const usePointsForBrand = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_POINTS_BY_BRAND, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting points for a city
export const usePointsForCity = ({
  cityId,
  skip = false,
}: {
  cityId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_POINTS_BY_CITY, {
    variables: { cityId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting active points only
export const useActivePoints = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_ACTIVE_POINTS, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// ================== MUTATION HOOKS ==================

// Hook for creating a point
export const useCreatePoint = () => {
  const client = useApolloClient();

  return useMutation(CREATE_POINT, {
    update: () => {
      client.refetchQueries({
        include: ["GetPointsForBrand", "GetPointsForCity", "GetActivePoints"],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for updating a point
export const useUpdatePoint = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_POINT, {
    update: (cache, { data }) => {
      if (data?.pointUpdate) {
        // Update the cache with the new data
        cache.modify({
          fields: {
            points(existingPoints = [], { readField }) {
              return existingPoints.map((pointRef: any) => {
                if (readField("id", pointRef) === data.pointUpdate.id) {
                  return data.pointUpdate;
                }
                return pointRef;
              });
            },
          },
        });
      }
      client.refetchQueries({
        include: ["GetPointsForBrand", "GetPointsForCity", "GetActivePoints"],
      });
    },
    errorPolicy: "all",
  });
};

// ================== COMPOSITE HOOKS ==================

// Hook for point selection with brand/city context
export const usePointSelection = ({
  brandId,
  cityId,
  preselectedPointId,
}: {
  brandId?: string;
  cityId?: string;
  preselectedPointId?: string;
}) => {
  const {
    data: pointsData,
    loading,
    error,
  } = usePointsForBrand({
    input: {
      brandId: brandId || "",
      filter: cityId ? { cityId } : {},
    },
    skip: !brandId,
  });

  const { data: selectedPointData } = usePoint({
    input: { id: preselectedPointId || "" },
    skip: !preselectedPointId,
  });

  return {
    points: pointsData?.points || [],
    selectedPoint: selectedPointData?.point || null,
    loading,
    error,
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const POINT_HOOKS = {
  // Single point hooks
  usePoint,

  // Multiple points hooks
  usePointsForBrand,
  usePointsForCity,
  useActivePoints,

  // Mutation hooks
  useCreatePoint,
  useUpdatePoint,

  // Composite hooks
  usePointSelection,
} as const;
