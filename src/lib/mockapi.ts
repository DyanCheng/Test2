import type {
  Category,
  CategoryInput,
  Course,
  CourseInput,
} from "@/types/course";

export const MOCK_API_BASE_URL = "https://6acde706f338359cf1c29350.mockapi.io";

type UnknownRecord = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function number(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCategory(value: UnknownRecord): Category {
  return {
    id: text(value.id),
    name: text(value.name),
    description: text(value.description),
  };
}

function toCourse(value: UnknownRecord): Course {
  return {
    id: text(value.id),
    title: text(value.title),
    description: text(value.description),
    categoryId: text(value.categoryId),
    instructor: text(value.instructor),
    price: number(value.price),
    duration: number(value.duration),
    thumbnail: text(value.thumbnail),
    trailerUrl: text(value.trailerUrl),
    createdAt: text(value.createdAt),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${MOCK_API_BASE_URL}/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok)
    throw new Error(`MockAPI request failed (${response.status}).`);
  return (await response.json()) as T;
}

export async function getCategories(): Promise<Category[]> {
  return (await request<UnknownRecord[]>("categories"))
    .map(toCategory)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}
export async function createCategory(input: CategoryInput): Promise<Category> {
  return toCategory(
    await request<UnknownRecord>("categories", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}
export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<Category> {
  return toCategory(
    await request<UnknownRecord>(`categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  );
}
export async function deleteCategory(id: string): Promise<void> {
  await request<UnknownRecord>(`categories/${id}`, { method: "DELETE" });
}
export async function getCourses(): Promise<Course[]> {
  return (await request<UnknownRecord[]>("courses"))
    .map(toCourse)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function getCourse(id: string): Promise<Course> {
  return toCourse(await request<UnknownRecord>(`courses/${id}`));
}

function cleanCourseInput(input: CourseInput) {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    categoryId: input.categoryId,
    instructor: input.instructor.trim(),
    price: input.price,
    duration: input.duration,
    thumbnail: input.thumbnail.trim(),
    trailerUrl: input.trailerUrl.trim(),
  };
}
export async function createCourse(input: CourseInput): Promise<Course> {
  return toCourse(
    await request<UnknownRecord>("courses", {
      method: "POST",
      body: JSON.stringify({
        ...cleanCourseInput(input),
        createdAt: new Date().toISOString(),
      }),
    }),
  );
}
export async function updateCourse(
  id: string,
  input: CourseInput,
): Promise<Course> {
  return toCourse(
    await request<UnknownRecord>(`courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(cleanCourseInput(input)),
    }),
  );
}
export async function deleteCourse(id: string): Promise<void> {
  await request<UnknownRecord>(`courses/${id}`, { method: "DELETE" });
}
