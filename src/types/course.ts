export type Category = {
  id: string;
  name: string;
  description: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  instructor: string;
  price: number;
  duration: number;
  thumbnail: string;
  trailerUrl: string;
  createdAt: string;
};

export type CourseInput = Omit<Course, "id" | "createdAt">;
export type CategoryInput = Omit<Category, "id">;
