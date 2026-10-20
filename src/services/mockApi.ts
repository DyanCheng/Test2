import { Dish, DishCategory } from "../types/models";

const baseUrl = process.env.EXPO_PUBLIC_MOCKAPI_BASE_URL?.replace(/\/$/, "");
type Entity = "dish" | "category";
const cleanPath = (value: string) => value.replace(/^\/+|\/+$/g, "");
const path: Record<Entity, string> = {
  dish: cleanPath(
    process.env.EXPO_PUBLIC_MOCKAPI_DISH_PATH || "BIT240020_Dish",
  ),
  category: cleanPath(
    process.env.EXPO_PUBLIC_MOCKAPI_CATEGORY_PATH || "BIT240020_DishCategory",
  ),
};

async function request(
  entity: Entity,
  method: string,
  id?: string,
  body?: unknown,
) {
  if (!baseUrl) throw new Error("MockAPI base URL is not configured");
  const response = await fetch(
    `${baseUrl}/${path[entity]}${id ? `/${encodeURIComponent(id)}` : ""}`,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  if (!response.ok)
    throw new Error(`MockAPI request failed (${response.status})`);
  return response.status === 204 ? undefined : response.json();
}
// The MockAPI-generated `id` is tracked only on the device; it is not part of
// the assignment's persisted model and must not be sent back as a domain field.
const apiPayload = (body: Dish | DishCategory) => {
  const { BIT240020_RemoteId: _remoteId, ...payload } = body;
  return payload;
};
export const remoteCreate = (entity: Entity, body: Dish | DishCategory) =>
  request(entity, "POST", undefined, apiPayload(body));
export const remoteUpdate = (
  entity: Entity,
  id: string,
  body: Dish | DishCategory,
) => request(entity, "PUT", id, apiPayload(body));
export const remoteDelete = (entity: Entity, id: string) =>
  request(entity, "DELETE", id);
export const remoteList = <T extends Dish | DishCategory>(
  entity: Entity,
): Promise<T[]> => request(entity, "GET");
