import { getAuthenticatedSupabaseClient } from "@/lib/supabase";
import type { Student, StudentInput } from "@/types/student";

type StudentRow = {
  id: number;
  full_name: string;
  student_code: string;
  email: string;
  avatar_uri: string | null;
};

function toStudent(row: StudentRow): Student {
  return {
    id: row.id,
    fullName: row.full_name,
    studentCode: row.student_code,
    email: row.email,
    avatarUri: row.avatar_uri,
  };
}

function toRow(student: StudentInput) {
  return {
    full_name: student.fullName.trim(),
    student_code: student.studentCode.trim(),
    email: student.email.trim(),
    avatar_uri: student.avatarUri?.trim() || null,
  };
}

function throwIfError(error: { message: string; code?: string } | null) {
  if (!error) return;
  const databaseError = new Error(error.message);
  databaseError.name = error.code ?? "SupabaseError";
  throw databaseError;
}

function requireAffectedRow(row: unknown, operation: "create" | "update" | "delete") {
  if (row) return;
  throw new Error(`Unable to ${operation}: the student does not exist or is no longer accessible.`);
}

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await (await getAuthenticatedSupabaseClient())
    .from("students")
    .select("id, full_name, student_code, email, avatar_uri")
    .order("full_name", { ascending: true });
  throwIfError(error);
  return ((data ?? []) as StudentRow[]).map(toStudent);
}

export async function getStudent(id: number): Promise<Student | null> {
  const { data, error } = await (await getAuthenticatedSupabaseClient())
    .from("students")
    .select("id, full_name, student_code, email, avatar_uri")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data ? toStudent(data as StudentRow) : null;
}

export async function createStudent(student: StudentInput): Promise<void> {
  const { data, error } = await (await getAuthenticatedSupabaseClient())
    .from("students")
    .insert(toRow(student))
    .select("id")
    .single();
  throwIfError(error);
  requireAffectedRow(data, "create");
}

export async function updateStudent(id: number, student: StudentInput): Promise<void> {
  const { data, error } = await (await getAuthenticatedSupabaseClient())
    .from("students")
    .update(toRow(student))
    .eq("id", id)
    .select("id")
    .maybeSingle();
  throwIfError(error);
  requireAffectedRow(data, "update");
}

export async function deleteStudent(id: number): Promise<void> {
  const { data, error } = await (await getAuthenticatedSupabaseClient())
    .from("students")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  throwIfError(error);
  requireAffectedRow(data, "delete");
}
