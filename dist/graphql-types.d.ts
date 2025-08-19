export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<T extends {
    [key: string]: unknown;
}, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> = T | {
    [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: {
        input: string;
        output: string;
    };
    String: {
        input: string;
        output: string;
    };
    Boolean: {
        input: boolean;
        output: boolean;
    };
    Int: {
        input: number;
        output: number;
    };
    Float: {
        input: number;
        output: number;
    };
    /** unix timestamp */
    DateTime: {
        input: any;
        output: any;
    };
    Int53: {
        input: number;
        output: number;
    };
    /** Должен соответствовать формату E.164 (+71111111111) */
    Phone: {
        input: string;
        output: string;
    };
    Upload: {
        input: any;
        output: any;
    };
    Uuid: {
        input: string;
        output: string;
    };
};
export type AuthenticationInput = {
    login: Scalars['String']['input'];
    password: Scalars['String']['input'];
};
export type Brand = {
    __typename?: 'Brand';
    accountId: Scalars['Uuid']['output'];
    brandCities?: Maybe<Array<BrandCity>>;
    cities?: Maybe<Array<City>>;
    id: Scalars['Uuid']['output'];
    isActive: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    points?: Maybe<Array<Point>>;
    slug: Scalars['String']['output'];
};
export type BrandPointsArgs = {
    input?: InputMaybe<PointsForBrandInput>;
};
export type BrandBySlugInput = {
    slug: Scalars['String']['input'];
};
export type BrandCity = {
    __typename?: 'BrandCity';
    brand: Brand;
    brandId: Scalars['Uuid']['output'];
    city: City;
    cityId: Scalars['Uuid']['output'];
    priority: Scalars['Int']['output'];
};
export type BrandInput = {
    id: Scalars['Uuid']['input'];
};
export type BrandsFilterInput = {
    accountsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
};
export type BrandsInput = {
    filter: BrandsFilterInput;
};
export type CategoriesCountInput = {
    brandId: Scalars['Uuid']['input'];
    filter?: InputMaybe<CategoriesFilterInput>;
};
export type CategoriesFilterInput = {
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    isFirstLevel?: InputMaybe<Scalars['Boolean']['input']>;
    parentsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    pointBinds?: InputMaybe<Array<CategoryPointBindInput>>;
    productExists?: InputMaybe<CategoriesFilterProductExistsInput>;
};
export type CategoriesFilterProductExistsInput = {
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    pointBinds?: InputMaybe<Array<ProductPointBindInput>>;
    tagsIdAll?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    tagsIdAny?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    tagsIdNotAll?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    tagsIdNotAny?: InputMaybe<Array<Scalars['Uuid']['input']>>;
};
export type CategoriesForProductFilterInput = {
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    isFirstLevel?: InputMaybe<Scalars['Boolean']['input']>;
    parentsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    pointBinds?: InputMaybe<Array<CategoryPointBindInput>>;
};
export type CategoriesForProductInput = {
    filter?: InputMaybe<CategoriesForProductFilterInput>;
};
export type CategoriesInput = {
    brandId: Scalars['Uuid']['input'];
    filter?: InputMaybe<CategoriesFilterInput>;
};
export type Category = {
    __typename?: 'Category';
    brandId: Scalars['Uuid']['output'];
    children: Array<Category>;
    id: Scalars['Uuid']['output'];
    imageUrl?: Maybe<Scalars['String']['output']>;
    isActive: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    parent?: Maybe<Category>;
    parentId?: Maybe<Scalars['Uuid']['output']>;
    pointBinds: Array<CategoryPointBind>;
    priority: Scalars['Int']['output'];
    products: Array<Product>;
    productsCount: Scalars['Int']['output'];
    slug: Scalars['String']['output'];
};
export type CategoryProductsArgs = {
    input?: InputMaybe<ProductsForCategoryInput>;
};
export type CategoryProductsCountArgs = {
    input?: InputMaybe<ProductsCountForCategoryInput>;
};
export type CategoryCreateInput = {
    brandId: Scalars['Uuid']['input'];
    imageUpload?: InputMaybe<Scalars['Upload']['input']>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    name: Scalars['String']['input'];
    parentId?: InputMaybe<Scalars['Uuid']['input']>;
    pointBinds?: InputMaybe<Array<CategoryPointBindInput>>;
    positionAnchor?: InputMaybe<Scalars['Uuid']['input']>;
    positionAnchorNearType?: InputMaybe<NearType>;
    positionEndOfList?: InputMaybe<EndOfList>;
    slug?: InputMaybe<Scalars['String']['input']>;
};
export type CategoryDeleteInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
};
export type CategoryInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
};
export type CategoryPointBind = {
    __typename?: 'CategoryPointBind';
    categoryId: Scalars['Uuid']['output'];
    orderType: OrderType;
    pointId: Scalars['Uuid']['output'];
};
export type CategoryPointBindInput = {
    orderType: OrderType;
    pointId: Scalars['Uuid']['input'];
};
export type CategoryUpdateInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
    imageUpload?: InputMaybe<Scalars['Upload']['input']>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    isImageRemove?: InputMaybe<Scalars['Boolean']['input']>;
    isParentIdRemove?: InputMaybe<Scalars['Boolean']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    parentId?: InputMaybe<Scalars['Uuid']['input']>;
    pointBinds?: InputMaybe<Array<CategoryPointBindInput>>;
    positionAnchor?: InputMaybe<Scalars['Uuid']['input']>;
    positionAnchorNearType?: InputMaybe<NearType>;
    positionEndOfList?: InputMaybe<EndOfList>;
    slug?: InputMaybe<Scalars['String']['input']>;
};
export type CitiesFilterInput = {
    brandsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
};
export type CitiesInput = {
    filter: CitiesFilterInput;
};
export type City = {
    __typename?: 'City';
    brands?: Maybe<Array<Brand>>;
    id: Scalars['Uuid']['output'];
    name: Scalars['String']['output'];
    points?: Maybe<Array<Point>>;
};
export type CityPointsArgs = {
    input: PointsForCityInput;
};
export type CityInput = {
    id: Scalars['Uuid']['input'];
};
export type DateTimeRangeInput = {
    from?: InputMaybe<Scalars['DateTime']['input']>;
    to?: InputMaybe<Scalars['DateTime']['input']>;
};
export type ElectronicMenuCreateInput = {
    accountId?: InputMaybe<Scalars['Uuid']['input']>;
    brandName: Scalars['String']['input'];
    isPointAddressClean?: InputMaybe<Scalars['Boolean']['input']>;
    pointAddress: Scalars['String']['input'];
    pointName?: InputMaybe<Scalars['String']['input']>;
    pointPhone: Scalars['Phone']['input'];
};
export type Employee = {
    __typename?: 'Employee';
    accountId: Scalars['Uuid']['output'];
    brandsId?: Maybe<Array<Scalars['Uuid']['output']>>;
    id: Scalars['Uuid']['output'];
    isActive: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    pointsId?: Maybe<Array<Scalars['Uuid']['output']>>;
    role: EmployeeRole;
    user: User;
    userId: Scalars['ID']['output'];
};
export type EmployeeInput = {
    id: Scalars['Uuid']['input'];
};
export declare enum EmployeeRole {
    Manager = "MANAGER",
    Master = "MASTER"
}
export type EmployeesFilterInput = {
    accountsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    brandsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    pointsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    roles?: InputMaybe<Array<EmployeeRole>>;
    usersId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
};
export type EmployeesForUserFilterInput = {
    accountsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    brandsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    pointsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    roles?: InputMaybe<Array<EmployeeRole>>;
};
export type EmployeesForUserInput = {
    filter?: InputMaybe<EmployeesFilterInput>;
};
export type EmployeesInput = {
    filter: EmployeesForUserFilterInput;
};
export declare enum EndOfList {
    End = "END",
    Start = "START"
}
export declare enum MinMax {
    Max = "MAX",
    Min = "MIN"
}
export type Mutation = {
    __typename?: 'Mutation';
    authentication: User;
    authenticationAnonymous: UserAnonymous;
    categoryCreate: Category;
    categoryDelete: Scalars['Boolean']['output'];
    categoryUpdate: Category;
    electronicMenuCreate: Brand;
    logout: Scalars['Boolean']['output'];
    orderPreOrderByEmployeeCreate: OrderPreOrder;
    orderPreOrderByEmployeeUpdate: OrderPreOrder;
    pointCreate: Point;
    pointUpdate: Point;
    productCreate: Product;
    productDelete: Scalars['Boolean']['output'];
    productUpdate: Product;
    productVariantPropertyCreate: ProductVariantProperty;
    productVariantPropertyDelete: Scalars['Boolean']['output'];
    productVariantPropertyUpdate: ProductVariantProperty;
    restoplaceAddressIntegration: User;
    restoplaceAuthentication: User;
};
export type MutationAuthenticationArgs = {
    input: AuthenticationInput;
};
export type MutationCategoryCreateArgs = {
    input: CategoryCreateInput;
};
export type MutationCategoryDeleteArgs = {
    input: CategoryDeleteInput;
};
export type MutationCategoryUpdateArgs = {
    input: CategoryUpdateInput;
};
export type MutationElectronicMenuCreateArgs = {
    input: ElectronicMenuCreateInput;
};
export type MutationOrderPreOrderByEmployeeCreateArgs = {
    input: OrderPreOrderByEmployeeCreateInput;
};
export type MutationOrderPreOrderByEmployeeUpdateArgs = {
    input: OrderPreOrderByEmployeeUpdateInput;
};
export type MutationPointCreateArgs = {
    input: PointCreateInput;
};
export type MutationPointUpdateArgs = {
    input: PointUpdateInput;
};
export type MutationProductCreateArgs = {
    input: ProductCreateInput;
};
export type MutationProductDeleteArgs = {
    input: ProductDeleteInput;
};
export type MutationProductUpdateArgs = {
    input: ProductUpdateInput;
};
export type MutationProductVariantPropertyCreateArgs = {
    input: ProductVariantPropertyCreateInput;
};
export type MutationProductVariantPropertyDeleteArgs = {
    input: ProductVariantPropertyDeleteInput;
};
export type MutationProductVariantPropertyUpdateArgs = {
    input: ProductVariantPropertyUpdateInput;
};
export type MutationRestoplaceAddressIntegrationArgs = {
    input: RestoplaceAuthenticationInput;
};
export type MutationRestoplaceAuthenticationArgs = {
    input: RestoplaceAuthenticationInput;
};
export declare enum NearType {
    After = "AFTER",
    Before = "BEFORE"
}
export declare enum OrderCreatorType {
    Customer = "CUSTOMER",
    Employee = "EMPLOYEE"
}
export type OrderInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
};
export type OrderItem = {
    __typename?: 'OrderItem';
    categories: Array<OrderItemCategory>;
    id: Scalars['Uuid']['output'];
    imageUrl?: Maybe<Scalars['String']['output']>;
    name: Scalars['String']['output'];
    price: Scalars['Int53']['output'];
    product?: Maybe<Product>;
    productId: Scalars['Uuid']['output'];
    productVariantProperties: Array<OrderItemProductVariantProperty>;
    quantity: Scalars['Int']['output'];
};
export type OrderItemAddInput = {
    productId: Scalars['Uuid']['input'];
    quantity: Scalars['Int']['input'];
};
export type OrderItemCategory = {
    __typename?: 'OrderItemCategory';
    categoryId: Scalars['Uuid']['output'];
    categoryName: Scalars['String']['output'];
};
export type OrderItemProductVariantProperty = {
    __typename?: 'OrderItemProductVariantProperty';
    productVariantPropertyId: Scalars['Uuid']['output'];
    productVariantPropertyName: Scalars['String']['output'];
    productVariantPropertyValueId: Scalars['Uuid']['output'];
    productVariantPropertyValueName: Scalars['String']['output'];
};
export type OrderItemUpdateInput = {
    id: Scalars['Uuid']['input'];
    quantity?: InputMaybe<Scalars['Int']['input']>;
    quantityOffset?: InputMaybe<Scalars['Int']['input']>;
};
export type OrderPreOrder = {
    __typename?: 'OrderPreOrder';
    brandId: Scalars['Uuid']['output'];
    comment?: Maybe<Scalars['String']['output']>;
    createdTime: Scalars['DateTime']['output'];
    creatorId: Scalars['Uuid']['output'];
    creatorType: OrderCreatorType;
    customerId?: Maybe<Scalars['Uuid']['output']>;
    customerName?: Maybe<Scalars['String']['output']>;
    customerPhone?: Maybe<Scalars['Phone']['output']>;
    dueTime: Scalars['DateTime']['output'];
    id: Scalars['Uuid']['output'];
    items?: Maybe<Array<OrderItem>>;
    number: Scalars['Int53']['output'];
    personsNumber?: Maybe<Scalars['Int']['output']>;
    pointId: Scalars['Uuid']['output'];
    priceTotal: Scalars['Int53']['output'];
    restoplaceReserveId?: Maybe<Scalars['ID']['output']>;
    status: OrderStatus;
    type: OrderType;
};
export type OrderPreOrderByEmployeeCreateInput = {
    brandId: Scalars['Uuid']['input'];
    comment?: InputMaybe<Scalars['String']['input']>;
    itemsAdd?: InputMaybe<Array<OrderItemAddInput>>;
    personsNumber?: InputMaybe<Scalars['Int']['input']>;
    pointId: Scalars['Uuid']['input'];
    status?: InputMaybe<OrderStatus>;
};
export type OrderPreOrderByEmployeeUpdateInput = {
    brandId: Scalars['Uuid']['input'];
    comment?: InputMaybe<Scalars['String']['input']>;
    id: Scalars['Uuid']['input'];
    isCommentClear?: InputMaybe<Scalars['Boolean']['input']>;
    isPersonsNumberClear?: InputMaybe<Scalars['Boolean']['input']>;
    items?: InputMaybe<Array<OrderItemUpdateInput>>;
    itemsAdd?: InputMaybe<Array<OrderItemAddInput>>;
    itemsRemove?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    itemsUpdate?: InputMaybe<Array<OrderItemUpdateInput>>;
    personsNumber?: InputMaybe<Scalars['Int']['input']>;
    status?: InputMaybe<OrderStatus>;
};
export declare enum OrderSortStrategy {
    DueTime = "DUE_TIME",
    Number = "NUMBER"
}
export declare enum OrderStatus {
    Accepted = "ACCEPTED",
    Complete = "COMPLETE",
    New = "NEW",
    Prepared = "PREPARED",
    Ready = "READY",
    Submitted = "SUBMITTED"
}
export declare enum OrderType {
    Delivery = "DELIVERY",
    OnTable = "ON_TABLE",
    Pickup = "PICKUP",
    PreOrder = "PRE_ORDER"
}
export type OrdersFilterInput = {
    dueTime?: InputMaybe<DateTimeRangeInput>;
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    pointsId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    statuses?: InputMaybe<Array<OrderStatus>>;
    types?: InputMaybe<Array<OrderType>>;
};
export type OrdersInput = {
    brandId: Scalars['Uuid']['input'];
    filter?: InputMaybe<OrdersFilterInput>;
    sort?: InputMaybe<Sort>;
    sortStrategy?: InputMaybe<OrderSortStrategy>;
};
export type OrdersUnion = OrderPreOrder;
export type Point = {
    __typename?: 'Point';
    address: Scalars['String']['output'];
    brand: Brand;
    brandId: Scalars['Uuid']['output'];
    city: City;
    cityId: Scalars['Uuid']['output'];
    id: Scalars['Uuid']['output'];
    isActive: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    priority: Scalars['Int']['output'];
};
export type PointCreateInput = {
    address: Scalars['String']['input'];
    brandId: Scalars['Uuid']['input'];
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    phone: Scalars['Phone']['input'];
    positionAnchor?: InputMaybe<Scalars['Uuid']['input']>;
    positionAnchorNearType?: InputMaybe<NearType>;
    positionEndOfList?: InputMaybe<EndOfList>;
};
export type PointInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
};
export type PointUpdateInput = {
    address?: InputMaybe<Scalars['String']['input']>;
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    isNameRemove?: InputMaybe<Scalars['Boolean']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    phone?: InputMaybe<Scalars['Phone']['input']>;
    positionAnchor?: InputMaybe<Scalars['Uuid']['input']>;
    positionAnchorNearType?: InputMaybe<NearType>;
    positionEndOfList?: InputMaybe<EndOfList>;
};
export type PointsFilterInput = {
    citiesId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
};
export type PointsForBrandFilterInput = {
    citiesId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
};
export type PointsForBrandInput = {
    filter?: InputMaybe<PointsForBrandFilterInput>;
};
export type PointsForCityFilterInput = {
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
};
export type PointsForCityInput = {
    brandId: Scalars['Uuid']['input'];
    filter?: InputMaybe<PointsForCityFilterInput>;
};
export type PointsInput = {
    brandId: Scalars['Uuid']['input'];
    filter?: InputMaybe<PointsFilterInput>;
};
export type Product = {
    __typename?: 'Product';
    brandId: Scalars['Uuid']['output'];
    calories?: Maybe<Scalars['Int']['output']>;
    carbohydrates?: Maybe<Scalars['Int']['output']>;
    categories: Array<Category>;
    categoryBinds: Array<ProductCategoryBind>;
    description?: Maybe<Scalars['String']['output']>;
    fats?: Maybe<Scalars['Int']['output']>;
    id: Scalars['Uuid']['output'];
    images: Array<ProductImage>;
    isActive: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    pointBinds: Array<ProductPointBind>;
    pricePoint?: Maybe<Scalars['Int53']['output']>;
    priceSettings: ProductPriceSettings;
    protein?: Maybe<Scalars['Int']['output']>;
    slug: Scalars['String']['output'];
    tagBinds: Array<ProductTagBind>;
    tags: Array<ProductTag>;
    unit?: Maybe<ProductUnit>;
    unitValue?: Maybe<Scalars['String']['output']>;
    variantGroup?: Maybe<ProductVariantGroup>;
    variantSettings?: Maybe<ProductVariantSettings>;
    variants: Array<Product>;
};
export type ProductCategoriesArgs = {
    input?: InputMaybe<CategoriesForProductInput>;
};
export type ProductPricePointArgs = {
    input: ProductPricePointInput;
};
export type ProductCategoryBind = {
    __typename?: 'ProductCategoryBind';
    categoryId: Scalars['Uuid']['output'];
    priority: Scalars['Int']['output'];
};
export type ProductCategoryBindInput = {
    categoryId: Scalars['Uuid']['input'];
    positionAnchor?: InputMaybe<Scalars['Uuid']['input']>;
    positionAnchorNearType?: InputMaybe<NearType>;
    positionEndOfList?: InputMaybe<EndOfList>;
    priority?: InputMaybe<Scalars['Int']['input']>;
};
export type ProductCreateInput = {
    brandId: Scalars['Uuid']['input'];
    calories?: InputMaybe<Scalars['Int53']['input']>;
    carbohydrates?: InputMaybe<Scalars['Int53']['input']>;
    categoryBinds?: InputMaybe<Array<ProductCategoryBindInput>>;
    description?: InputMaybe<Scalars['String']['input']>;
    fats?: InputMaybe<Scalars['Int53']['input']>;
    imagesUpload?: InputMaybe<Array<ProductImageUploadInput>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    name: Scalars['String']['input'];
    pointBinds?: InputMaybe<Array<ProductPointBindInput>>;
    priceSettings: ProductPriceSettingsCreateInput;
    protein?: InputMaybe<Scalars['Int53']['input']>;
    slug?: InputMaybe<Scalars['String']['input']>;
    tagBinds?: InputMaybe<Array<ProductTagBindInput>>;
    tagBindsByName?: InputMaybe<Array<ProductTagBindByNameInput>>;
    unit?: InputMaybe<ProductUnit>;
    unitValue?: InputMaybe<Scalars['String']['input']>;
    variantGroup?: InputMaybe<ProductVariantGroupInput>;
    variantSettings?: InputMaybe<ProductVariantSettingsInput>;
    variantsCreate?: InputMaybe<Array<ProductVariantCreateInput>>;
};
export type ProductDeleteInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
    withVariants?: InputMaybe<Scalars['Boolean']['input']>;
};
export type ProductImage = {
    __typename?: 'ProductImage';
    fileId: Scalars['Uuid']['output'];
    priority: Scalars['Int']['output'];
    url: Scalars['String']['output'];
};
export type ProductImageInput = {
    fileId: Scalars['Uuid']['input'];
    priority: Scalars['Int']['input'];
};
export type ProductImageUploadInput = {
    file: Scalars['Upload']['input'];
    priority: Scalars['Int']['input'];
};
export type ProductInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
};
export type ProductPointBind = {
    __typename?: 'ProductPointBind';
    orderType: OrderType;
    pointId: Scalars['Uuid']['output'];
};
export type ProductPointBindInput = {
    orderType: OrderType;
    pointId: Scalars['Uuid']['input'];
};
export type ProductPricePointInput = {
    orderType: OrderType;
    pointId: Scalars['Uuid']['input'];
};
export type ProductPriceSettings = {
    __typename?: 'ProductPriceSettings';
    price: Scalars['Int53']['output'];
    priceOrderTypes: Array<ProductPriceSettingsOrderType>;
};
export type ProductPriceSettingsCity = {
    __typename?: 'ProductPriceSettingsCity';
    cityId: Scalars['Uuid']['output'];
    price: Scalars['Int53']['output'];
};
export type ProductPriceSettingsCityInput = {
    cityId: Scalars['Uuid']['input'];
    price: Scalars['Int53']['input'];
};
export type ProductPriceSettingsCreateInput = {
    price: Scalars['Int53']['input'];
    priceOrderTypes?: InputMaybe<Array<ProductPriceSettingsOrderTypeInput>>;
};
export type ProductPriceSettingsOrderType = {
    __typename?: 'ProductPriceSettingsOrderType';
    orderType: OrderType;
    priceCities: Array<ProductPriceSettingsCity>;
    priceCommon?: Maybe<Scalars['Int53']['output']>;
    pricePoints: Array<ProductPriceSettingsPoint>;
};
export type ProductPriceSettingsOrderTypeInput = {
    isPriceCommonRemove?: InputMaybe<Scalars['Boolean']['input']>;
    orderType: OrderType;
    priceCities?: InputMaybe<Array<ProductPriceSettingsCityInput>>;
    priceCommon?: InputMaybe<Scalars['Int53']['input']>;
    pricePoints?: InputMaybe<Array<ProductPriceSettingsPointInput>>;
};
export type ProductPriceSettingsPoint = {
    __typename?: 'ProductPriceSettingsPoint';
    pointId: Scalars['Uuid']['output'];
    price: Scalars['Int53']['output'];
};
export type ProductPriceSettingsPointInput = {
    pointId: Scalars['Uuid']['input'];
    price: Scalars['Int53']['input'];
};
export type ProductPriceSettingsUpdateInput = {
    price?: InputMaybe<Scalars['Int53']['input']>;
    priceOrderTypes?: InputMaybe<Array<ProductPriceSettingsOrderTypeInput>>;
};
export type ProductSortByCategoryPriorityInput = {
    categoryId: Scalars['Uuid']['input'];
    sort: Sort;
};
export type ProductSortByPriceInput = {
    pointBind: ProductPointBindInput;
    sort: Sort;
};
export type ProductTag = {
    __typename?: 'ProductTag';
    id: Scalars['Uuid']['output'];
    name: Scalars['String']['output'];
};
export type ProductTagBind = {
    __typename?: 'ProductTagBind';
    priority: Scalars['Int']['output'];
    tagId: Scalars['Uuid']['output'];
};
export type ProductTagBindByNameInput = {
    name: Scalars['String']['input'];
    priority: Scalars['Int']['input'];
};
export type ProductTagBindInput = {
    priority: Scalars['Int']['input'];
    tagId: Scalars['Uuid']['input'];
};
export type ProductTagsInput = {
    brandId: Scalars['Uuid']['input'];
};
export declare enum ProductUnit {
    Bottles = "BOTTLES",
    Gram = "GRAM",
    Kilogram = "KILOGRAM",
    Liters = "LITERS",
    Milliliters = "MILLILITERS",
    Pieces = "PIECES",
    Portion = "PORTION"
}
export type ProductUpdateInput = {
    brandId: Scalars['Uuid']['input'];
    calories?: InputMaybe<Scalars['Int53']['input']>;
    carbohydrates?: InputMaybe<Scalars['Int53']['input']>;
    categoryBinds?: InputMaybe<Array<ProductCategoryBindInput>>;
    categoryBindsSet?: InputMaybe<Array<ProductCategoryBindInput>>;
    description?: InputMaybe<Scalars['String']['input']>;
    fats?: InputMaybe<Scalars['Int53']['input']>;
    id: Scalars['Uuid']['input'];
    images?: InputMaybe<Array<ProductImageInput>>;
    imagesUpload?: InputMaybe<Array<ProductImageUploadInput>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    isCaloriesRemove?: InputMaybe<Scalars['Boolean']['input']>;
    isCarbohydratesRemove?: InputMaybe<Scalars['Boolean']['input']>;
    isFatsRemove?: InputMaybe<Scalars['Boolean']['input']>;
    isProteinRemove?: InputMaybe<Scalars['Boolean']['input']>;
    isUnitRemove?: InputMaybe<Scalars['Boolean']['input']>;
    isUnitValueRemove?: InputMaybe<Scalars['Boolean']['input']>;
    isVariantGroupRemove?: InputMaybe<Scalars['Boolean']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    pointBinds?: InputMaybe<Array<ProductPointBindInput>>;
    priceSettings?: InputMaybe<ProductPriceSettingsUpdateInput>;
    protein?: InputMaybe<Scalars['Int53']['input']>;
    slug?: InputMaybe<Scalars['String']['input']>;
    tagBinds?: InputMaybe<Array<ProductTagBindInput>>;
    tagBindsByName?: InputMaybe<Array<ProductTagBindByNameInput>>;
    unit?: InputMaybe<ProductUnit>;
    unitValue?: InputMaybe<Scalars['String']['input']>;
    variantGroup?: InputMaybe<ProductVariantGroupInput>;
    variantSettings?: InputMaybe<ProductVariantSettingsInput>;
    variants?: InputMaybe<Array<ProductVariantUpdateInput>>;
    variantsCreate?: InputMaybe<Array<ProductVariantCreateInput>>;
};
export type ProductVariantCreateInput = {
    priceSettings: ProductPriceSettingsCreateInput;
    slug?: InputMaybe<Scalars['String']['input']>;
    unitValue?: InputMaybe<Scalars['String']['input']>;
    variantSettings: ProductVariantSettingsInput;
};
export type ProductVariantGroup = {
    __typename?: 'ProductVariantGroup';
    variantPropertyBinds: Array<ProductVariantGroupVariantPropertyBind>;
};
export type ProductVariantGroupInput = {
    variantPropertyBinds?: InputMaybe<Array<ProductVariantGroupVariantPropertyBindInput>>;
};
export type ProductVariantGroupVariantPropertyBind = {
    __typename?: 'ProductVariantGroupVariantPropertyBind';
    priority: Scalars['Int']['output'];
    variantPropertyId: Scalars['Uuid']['output'];
};
export type ProductVariantGroupVariantPropertyBindInput = {
    priority: Scalars['Int']['input'];
    variantPropertyId: Scalars['Uuid']['input'];
};
export type ProductVariantPropertiesInput = {
    brandId: Scalars['Uuid']['input'];
};
export type ProductVariantProperty = {
    __typename?: 'ProductVariantProperty';
    brandId: Scalars['Uuid']['output'];
    displayType: ProductVariantPropertyDisplayType;
    id: Scalars['Uuid']['output'];
    innerName?: Maybe<Scalars['String']['output']>;
    isShowName: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    values: Array<ProductVariantPropertyValue>;
};
export type ProductVariantPropertyCreateInput = {
    brandId: Scalars['Uuid']['input'];
    displayType: ProductVariantPropertyDisplayType;
    innerName?: InputMaybe<Scalars['String']['input']>;
    isShowName: Scalars['Boolean']['input'];
    name: Scalars['String']['input'];
    valuesCreate: Array<ProductVariantPropertyValueCreateInput>;
};
export type ProductVariantPropertyDeleteInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
};
export declare enum ProductVariantPropertyDisplayType {
    Buttons = "BUTTONS",
    Select = "SELECT"
}
export type ProductVariantPropertyInput = {
    brandId: Scalars['Uuid']['input'];
    id: Scalars['Uuid']['input'];
};
export type ProductVariantPropertyUpdateInput = {
    brandId: Scalars['Uuid']['input'];
    displayType?: InputMaybe<ProductVariantPropertyDisplayType>;
    id: Scalars['Uuid']['input'];
    innerName?: InputMaybe<Scalars['String']['input']>;
    isInnerNameRemove?: InputMaybe<Scalars['Boolean']['input']>;
    isShowName?: InputMaybe<Scalars['Boolean']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    values?: InputMaybe<Array<ProductVariantPropertyValueUpdateInput>>;
    valuesCreate?: InputMaybe<Array<ProductVariantPropertyValueCreateInput>>;
};
export type ProductVariantPropertyValue = {
    __typename?: 'ProductVariantPropertyValue';
    id: Scalars['Uuid']['output'];
    name: Scalars['String']['output'];
    priority: Scalars['Int']['output'];
};
export type ProductVariantPropertyValueCreateInput = {
    name: Scalars['String']['input'];
    priority: Scalars['Int']['input'];
};
export type ProductVariantPropertyValueUpdateInput = {
    id: Scalars['Uuid']['input'];
    name?: InputMaybe<Scalars['String']['input']>;
    priority?: InputMaybe<Scalars['Int']['input']>;
};
export type ProductVariantSettings = {
    __typename?: 'ProductVariantSettings';
    isMain: Scalars['Boolean']['output'];
    priority: Scalars['Int']['output'];
    variantPropertyBinds: Array<ProductVariantSettingsVariantPropertyBind>;
};
export type ProductVariantSettingsInput = {
    isMain?: InputMaybe<Scalars['Boolean']['input']>;
    priority?: InputMaybe<Scalars['Int']['input']>;
    variantPropertyBinds?: InputMaybe<Array<ProductVariantSettingsVariantPropertyBindInput>>;
};
export type ProductVariantSettingsVariantPropertyBind = {
    __typename?: 'ProductVariantSettingsVariantPropertyBind';
    variantPropertyId: Scalars['Uuid']['output'];
    variantPropertyValueId: Scalars['Uuid']['output'];
};
export type ProductVariantSettingsVariantPropertyBindInput = {
    variantPropertyId: Scalars['Uuid']['input'];
    variantPropertyValueId: Scalars['Uuid']['input'];
};
export type ProductVariantUpdateInput = {
    id: Scalars['Uuid']['input'];
    isUnitValueRemove?: InputMaybe<Scalars['Boolean']['input']>;
    priceSettings?: InputMaybe<ProductPriceSettingsUpdateInput>;
    slug?: InputMaybe<Scalars['String']['input']>;
    unitValue?: InputMaybe<Scalars['String']['input']>;
    variantSettings?: InputMaybe<ProductVariantSettingsInput>;
};
export type ProductVariantsGroupByPriceInput = {
    pointBind: ProductPointBindInput;
    type: MinMax;
};
export declare enum ProductVariantsGroupSimpleStrategy {
    Main = "MAIN",
    PriorityMax = "PRIORITY_MAX",
    PriorityMin = "PRIORITY_MIN"
}
export type ProductsCountForCategoryInput = {
    filter?: InputMaybe<ProductsForCategoryFilterInput>;
    isVariantsGroup?: InputMaybe<Scalars['Boolean']['input']>;
};
export type ProductsFilterInput = {
    categoriesId?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    pointBinds?: InputMaybe<Array<ProductPointBindInput>>;
    /** Содержит все теги */
    tagsIdAll?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    /** Содержит хотя бы 1 тег */
    tagsIdAny?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    /** Не содержит все теги */
    tagsIdNotAll?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    /** Не содержит хотя бы 1 тег */
    tagsIdNotAny?: InputMaybe<Array<Scalars['Uuid']['input']>>;
};
export type ProductsForCategoryFilterInput = {
    ids?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    isActive?: InputMaybe<Scalars['Boolean']['input']>;
    pointBinds?: InputMaybe<Array<ProductPointBindInput>>;
    /** Содержит все теги */
    tagsIdAll?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    /** Содержит хотя бы 1 тег */
    tagsIdAny?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    /** Не содержит все теги */
    tagsIdNotAll?: InputMaybe<Array<Scalars['Uuid']['input']>>;
    /** Не содержит хотя бы 1 тег */
    tagsIdNotAny?: InputMaybe<Array<Scalars['Uuid']['input']>>;
};
export type ProductsForCategoryInput = {
    filter?: InputMaybe<ProductsForCategoryFilterInput>;
    isVariantsGroup?: InputMaybe<Scalars['Boolean']['input']>;
    sortByCategoryPriority?: InputMaybe<Sort>;
    sortByPrice?: InputMaybe<ProductSortByPriceInput>;
    variantsGroupByPrice?: InputMaybe<ProductVariantsGroupByPriceInput>;
    variantsGroupSimpleStrategy?: InputMaybe<ProductVariantsGroupSimpleStrategy>;
};
export type ProductsInput = {
    brandId: Scalars['Uuid']['input'];
    filter?: InputMaybe<ProductsFilterInput>;
    isVariantsGroup?: InputMaybe<Scalars['Boolean']['input']>;
    sortByCategoryId?: InputMaybe<Scalars['Uuid']['input']>;
    sortByCategoryPriority?: InputMaybe<ProductSortByCategoryPriorityInput>;
    sortByPrice?: InputMaybe<ProductSortByPriceInput>;
    variantsGroupByPrice?: InputMaybe<ProductVariantsGroupByPriceInput>;
    variantsGroupSimpleStrategy?: InputMaybe<ProductVariantsGroupSimpleStrategy>;
};
export type Query = {
    __typename?: 'Query';
    brand: Brand;
    brandBySlug: Brand;
    brands?: Maybe<Array<Brand>>;
    categories: Array<Category>;
    categoriesCount: Scalars['Int']['output'];
    category: Category;
    cities?: Maybe<Array<City>>;
    city: City;
    employee: Employee;
    employees?: Maybe<Array<Employee>>;
    me: UserTypesUnion;
    order: OrdersUnion;
    orders: Array<OrdersUnion>;
    point: Point;
    points?: Maybe<Array<Point>>;
    product: Product;
    productTags: Array<ProductTag>;
    productVariantProperties: Array<ProductVariantProperty>;
    productVariantProperty: ProductVariantProperty;
    products: Array<Product>;
};
export type QueryBrandArgs = {
    input: BrandInput;
};
export type QueryBrandBySlugArgs = {
    input: BrandBySlugInput;
};
export type QueryBrandsArgs = {
    input: BrandsInput;
};
export type QueryCategoriesArgs = {
    input: CategoriesInput;
};
export type QueryCategoriesCountArgs = {
    input: CategoriesCountInput;
};
export type QueryCategoryArgs = {
    input: CategoryInput;
};
export type QueryCitiesArgs = {
    input: CitiesInput;
};
export type QueryCityArgs = {
    input: CityInput;
};
export type QueryEmployeeArgs = {
    input: EmployeeInput;
};
export type QueryEmployeesArgs = {
    input: EmployeesInput;
};
export type QueryOrderArgs = {
    input: OrderInput;
};
export type QueryOrdersArgs = {
    input: OrdersInput;
};
export type QueryPointArgs = {
    input: PointInput;
};
export type QueryPointsArgs = {
    input: PointsInput;
};
export type QueryProductArgs = {
    input: ProductInput;
};
export type QueryProductTagsArgs = {
    input: ProductTagsInput;
};
export type QueryProductVariantPropertiesArgs = {
    input: ProductVariantPropertiesInput;
};
export type QueryProductVariantPropertyArgs = {
    input: ProductVariantPropertyInput;
};
export type QueryProductsArgs = {
    input: ProductsInput;
};
export type RestoplaceAuthenticationInput = {
    code: Scalars['String']['input'];
};
export declare enum Sort {
    Asc = "ASC",
    Desc = "DESC"
}
export type User = {
    __typename?: 'User';
    email?: Maybe<Scalars['String']['output']>;
    employees?: Maybe<Array<Employee>>;
    id: Scalars['Uuid']['output'];
    login: Scalars['String']['output'];
    name: Scalars['String']['output'];
    phone?: Maybe<Scalars['Phone']['output']>;
};
export type UserEmployeesArgs = {
    input?: InputMaybe<EmployeesForUserInput>;
};
export type UserAnonymous = {
    __typename?: 'UserAnonymous';
    id: Scalars['Uuid']['output'];
};
export type UserTypesUnion = User | UserAnonymous;
//# sourceMappingURL=graphql-types.d.ts.map