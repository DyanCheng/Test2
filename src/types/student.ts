export type Student = {
  id: number;
  fullName: string;
  studentCode: string;
  email: string;
  avatarUri: string | null;
};

export type StudentInput = Omit<Student, "id">;
