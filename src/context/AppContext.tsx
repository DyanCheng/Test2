import NetInfo from "@react-native-community/netinfo";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { translate, TranslationKey } from "../i18n";
import {
  remoteCreate,
  remoteDelete,
  remoteList,
  remoteUpdate,
} from "../services/mockApi";
import { defaultFilters, loadData, saveData } from "../services/storage";
import {
  AppData,
  Dish,
  DishCategory,
  FilterState,
  Language,
  PendingChange,
} from "../types/models";

type ContextValue = AppData & {
  ready: boolean;
  online: boolean;
  syncError: string | null;
  t: (key: TranslationKey) => string;
  setLanguage: (value: Language) => void;
  setFilters: (value: FilterState) => void;
  addDish: (dish: Dish) => void;
  updateDish: (dish: Dish) => void;
  deleteDish: (id: string) => void;
  addCategory: (category: DishCategory) => void;
  updateCategory: (category: DishCategory) => void;
  deleteCategory: (id: string) => boolean;
};
const AppContext = createContext<ContextValue | undefined>(undefined);
const newChange = (
  entity: PendingChange["entity"],
  action: PendingChange["action"],
  localId: string,
  payload?: Dish | DishCategory,
): PendingChange => ({
  id: `${Date.now()}-${Math.random()}`,
  entity,
  action,
  localId,
  payload,
  createdAt: new Date().toISOString(),
});

function mergeRemote<T extends Dish | DishCategory>(
  local: T[],
  remote: T[],
): T[] {
  const keys = (item: T) => {
    const record = item as T & { id?: string };
    return [record.BIT240020_RemoteId, record.id, record.BIT240020_Id]
      .filter(Boolean)
      .map(String);
  };
  const byAnyId = new Map<string, T>();
  remote.forEach((item) => keys(item).forEach((key) => byAnyId.set(key, item)));
  const merged = local.map((item) => {
    const remoteItem = keys(item)
      .map((key) => byAnyId.get(key))
      .find(Boolean);
    if (!remoteItem) return item;
    const remoteIsNewer =
      new Date(remoteItem.BIT240020_UpdatedAt || 0) >
      new Date(item.BIT240020_UpdatedAt || 0);
    return {
      ...(remoteIsNewer ? remoteItem : item),
      BIT240020_Id: item.BIT240020_Id,
      BIT240020_RemoteId: String(
        (remoteItem as T & { id?: string }).id ?? remoteItem.BIT240020_Id,
      ),
    } as T;
  });
  const localRemoteIds = new Set(merged.flatMap(keys));
  return [
    ...merged,
    ...remote
      .filter((item) => !keys(item).some((key) => localRemoteIds.has(key)))
      .map(
        (item) =>
          ({
            ...item,
            BIT240020_RemoteId: String(
              (item as T & { id?: string }).id ?? item.BIT240020_Id,
            ),
          }) as T,
      ),
  ];
}
function sync(
  data: AppData,
  setData: React.Dispatch<React.SetStateAction<AppData>>,
  setSyncError: React.Dispatch<React.SetStateAction<string | null>>,
) {
  return async () => {
    let next = data;
    let errorMessage: string | null = null;
    for (const change of data.pendingChanges) {
      try {
        const collection =
          change.entity === "dish" ? next.dishes : next.categories;
        const local = collection.find(
          (item) => item.BIT240020_Id === change.localId,
        );
        if (change.action === "create") {
          // A locally-created item deleted before syncing must never be posted.
          if (local) {
            const remote = await remoteCreate(change.entity, local);
            if (change.entity === "dish")
              next = {
                ...next,
                dishes: next.dishes.map((d) =>
                  d.BIT240020_Id === change.localId
                    ? {
                        ...d,
                        BIT240020_RemoteId: remote.id ?? remote.BIT240020_Id,
                      }
                    : d,
                ),
              };
            else
              next = {
                ...next,
                categories: next.categories.map((c) =>
                  c.BIT240020_Id === change.localId
                    ? {
                        ...c,
                        BIT240020_RemoteId: remote.id ?? remote.BIT240020_Id,
                      }
                    : c,
                ),
              };
          }
        } else if (change.action === "update" && local) {
          const remoteId = (local as Dish | DishCategory).BIT240020_RemoteId;
          await remoteUpdate(change.entity, remoteId || change.localId, local);
        } else if (change.action === "delete") {
          const deletedItem = change.payload as Dish | DishCategory | undefined;
          let remoteId = deletedItem?.BIT240020_RemoteId;
          // Older local data and hand-created MockAPI records may not have a
          // saved remote id. Resolve it by the required prefixed local id.
          if (!remoteId && deletedItem) {
            const records = await remoteList<Dish | DishCategory>(change.entity);
            const matchingRecord = records.find(
              (record) =>
                record.BIT240020_Id === deletedItem.BIT240020_Id,
            ) as (Dish | DishCategory) & { id?: string };
            remoteId = matchingRecord?.BIT240020_RemoteId ?? matchingRecord?.id;
          }
          if (remoteId) await remoteDelete(change.entity, remoteId);
        }
        next = {
          ...next,
          pendingChanges: next.pendingChanges.filter((x) => x.id !== change.id),
        };
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : "MockAPI sync failed";
        break;
      } // Change remains queued and retries automatically after connectivity changes.
    }
    if (!errorMessage && !next.pendingChanges.length) {
      try {
        const [remoteCategories, remoteDishes] = await Promise.all([
          remoteList<DishCategory>("category"),
          remoteList<Dish>("dish"),
        ]);
        next = {
          ...next,
          categories: mergeRemote(next.categories, remoteCategories),
          dishes: mergeRemote(next.dishes, remoteDishes),
        };
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : "MockAPI sync failed";
      }
    }
    if (next !== data) setData(next);
    setSyncError(errorMessage);
  };
}

export function AppProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<AppData>({
    categories: [],
    dishes: [],
    pendingChanges: [],
    language: "en",
    filters: defaultFilters,
  });
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  useEffect(() => {
    loadData().then((x) => {
      setData(x);
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready) void saveData(data);
  }, [data, ready]);
  useEffect(
    () =>
      NetInfo.addEventListener((state) =>
        setOnline(
          Boolean(state.isConnected && state.isInternetReachable !== false),
        ),
      ),
    [],
  );
  useEffect(() => {
    if (ready && online) void sync(data, setData, setSyncError)();
  }, [online, ready, data.pendingChanges.length]);
  const queue = (
    entity: PendingChange["entity"],
    action: PendingChange["action"],
    localId: string,
    payload?: Dish | DishCategory,
  ) =>
    setData((d) => {
      const existing = d.pendingChanges.find(
        (change) => change.entity === entity && change.localId === localId,
      );
      // Keep one current create/update payload per record. A create then delete
      // while offline cancels both operations instead of creating a remote orphan.
      if (action !== "delete" && existing) {
        return {
          ...d,
          pendingChanges: d.pendingChanges.map((change) =>
            change.id === existing.id
              ? { ...change, action: existing.action, payload }
              : change,
          ),
        };
      }
      if (action === "delete" && existing?.action === "create") {
        return {
          ...d,
          pendingChanges: d.pendingChanges.filter(
            (change) => change.id !== existing.id,
          ),
        };
      }
      if (action === "delete" && !payload) return d;
      return {
        ...d,
        pendingChanges: [
          ...d.pendingChanges.filter(
            (change) => !(change.entity === entity && change.localId === localId),
          ),
          newChange(entity, action, localId, payload),
        ],
      };
    });
  const value = useMemo<ContextValue>(
    () => ({
      ...data,
      ready,
      online,
      syncError,
      t: (key) => translate(data.language, key),
      setLanguage: (language) => setData((d) => ({ ...d, language })),
      setFilters: (filters) => setData((d) => ({ ...d, filters })),
      addDish: (dish) => {
        setData((d) => ({ ...d, dishes: [...d.dishes, dish] }));
        queue("dish", "create", dish.BIT240020_Id, dish);
      },
      updateDish: (dish) => {
        setData((d) => ({
          ...d,
          dishes: d.dishes.map((x) =>
            x.BIT240020_Id === dish.BIT240020_Id ? dish : x,
          ),
        }));
        queue(
          "dish",
          dish.BIT240020_RemoteId ? "update" : "create",
          dish.BIT240020_Id,
          dish,
        );
      },
      deleteDish: (id) => {
        const original = data.dishes.find((x) => x.BIT240020_Id === id);
        setData((d) => ({
          ...d,
          dishes: d.dishes.filter((x) => x.BIT240020_Id !== id),
        }));
        queue("dish", "delete", id, original);
      },
      addCategory: (category) => {
        setData((d) => ({ ...d, categories: [...d.categories, category] }));
        queue("category", "create", category.BIT240020_Id, category);
      },
      updateCategory: (category) => {
        setData((d) => ({
          ...d,
          categories: d.categories.map((x) =>
            x.BIT240020_Id === category.BIT240020_Id ? category : x,
          ),
        }));
        queue(
          "category",
          category.BIT240020_RemoteId ? "update" : "create",
          category.BIT240020_Id,
          category,
        );
      },
      deleteCategory: (id) => {
        if (data.dishes.some((d) => d.BIT240020_DishCategoryId === id))
          return false;
        const original = data.categories.find((x) => x.BIT240020_Id === id);
        setData((d) => ({
          ...d,
          categories: d.categories.filter((x) => x.BIT240020_Id !== id),
        }));
        queue("category", "delete", id, original);
        return true;
      },
    }),
    [data, ready, online, syncError],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppProvider is required");
  return value;
};
