"use server"

import { createClient } from "@/utils/supabase/server";

export async function fetchBooks(search: string, category: string, page: number, limit = 4) {
  const supabase = await createClient();

  let query = supabase
    .from("books")
    .select("*", { count: "exact" })
    .range((page - 1) * limit, page * limit - 1);

  if (search) query = query.ilike("title", `%${search}%`);
  if (category) query = query.eq("category", category);

  const { data, count, error } = await query;
  if (error) throw new Error("Error fetching books: " + error.message);

  return { books: data || [], totalBooks: count || 0 };
}

export async function fetchCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .select("category")
    .order("category", { ascending: true });

  if (error) throw new Error("Error fetching categories: " + error.message);

  return Array.from(new Set(data.map((item) => item.category)));
}

export async function fetchBookDetail(bookId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("bookid", bookId)
    .single();

  if (error) {
    console.error("Error fetching book:", error);
    return null;
  }

  return data;
}

export async function fetchLoans() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("loans")
    .select(`
      loanid,
      books (title),
      users (email),
      loan_date,
      loan_return
    `); 

  if (error) {
    console.error("Error fetching loans:", error);
    return [];
  }
  console.log("Fetched loans:", data);
  return data;
}
