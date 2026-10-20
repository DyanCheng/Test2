import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData, Dish, DishCategory, FilterState } from "../types/models";

const STORAGE_KEY = "BIT240020_FoodManager_Data";
export const defaultFilters: FilterState = {
  query: "",
  onlyAvailable: false,
  minPrice: "",
  maxPrice: "",
  sort: "priceAsc",
};
const now = () => new Date().toISOString();

const categories: DishCategory[] = [
  {
    BIT240020_Id: "cat-main",
    BIT240020_Name: "Main dish",
    BIT240020_Description: "Hearty everyday meals",
    BIT240020_UpdatedAt: now(),
  },
  {
    BIT240020_Id: "cat-dessert",
    BIT240020_Name: "Dessert",
    BIT240020_Description: "Sweet dishes",
    BIT240020_UpdatedAt: now(),
  },
  {
    BIT240020_Id: "cat-drink",
    BIT240020_Name: "Drink",
    BIT240020_Description: "Refreshing beverages",
    BIT240020_UpdatedAt: now(),
  },
];
const image = (url: string, thumb = true) => [
  { BIT240020_ImageUrl: url, BIT240020_IsThumbnail: thumb },
];
const dish = (
  id: string,
  name: string,
  price: number,
  time: number,
  categoryId: string,
  isAvailable = true,
): Dish => ({
  BIT240020_Id: id,
  BIT240020_Name: name,
  BIT240020_Price: price,
  BIT240020_PreparationTime: time,
  BIT240020_IsAvailable: isAvailable,
  BIT240020_Description: "",
  BIT240020_DishCategoryId: categoryId,
  BIT240020_DishImage: image(
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900",
  ),
  BIT240020_UpdatedAt: now(),
});
const initialDishes = [
  dish("dish-1", "Chicken rice", 55000, 20, "cat-main"),
  dish("dish-2", "Beef noodle soup", 60000, 35, "cat-main"),
  dish("dish-3", "Mango pudding", 30000, 15, "cat-dessert"),
  dish("dish-4", "Iced coffee", 25000, 5, "cat-drink"),
  dish("dish-5", "Lemon tea", 20000, 5, "cat-drink", false),
];
// Sample records are local defaults. They are uploaded only when the user changes
// or creates a record, preventing duplicate seed records on an existing MockAPI.
const seed: AppData = {
  categories,
  dishes: initialDishes,
  pendingChanges: [],
  language: "en",
  filters: defaultFilters,
};

export async function loadData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return {
    ...seed,
    ...JSON.parse(raw),
    filters: { ...defaultFilters, ...JSON.parse(raw).filters },
  };
}
export const saveData = (data: AppData) =>
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
