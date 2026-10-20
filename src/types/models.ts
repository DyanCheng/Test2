export type Language = 'en' | 'vi';

export type DishImage = {
  BIT240020_ImageUrl: string;
  BIT240020_IsThumbnail: boolean;
};

export type DishCategory = {
  BIT240020_Id: string;
  BIT240020_RemoteId?: string;
  BIT240020_Name: string;
  BIT240020_Description: string;
  BIT240020_UpdatedAt: string;
};

export type Dish = {
  BIT240020_Id: string;
  /** Server id is separate so an offline id never produces a duplicate POST. */
  BIT240020_RemoteId?: string;
  BIT240020_Name: string;
  BIT240020_Price: number;
  BIT240020_PreparationTime: number;
  BIT240020_IsAvailable: boolean;
  BIT240020_Description: string;
  BIT240020_DishCategoryId: string;
  BIT240020_DishImage: DishImage[];
  BIT240020_UpdatedAt: string;
};

export type FilterState = {
  query: string;
  categoryId?: string;
  onlyAvailable: boolean;
  minPrice: string;
  maxPrice: string;
  sort: 'priceAsc' | 'priceDesc' | 'timeAsc';
};

export type PendingChange = {
  id: string;
  entity: 'dish' | 'category';
  action: 'create' | 'update' | 'delete';
  localId: string;
  payload?: Dish | DishCategory;
  createdAt: string;
};

export type AppData = {
  categories: DishCategory[];
  dishes: Dish[];
  pendingChanges: PendingChange[];
  language: Language;
  filters: FilterState;
};
