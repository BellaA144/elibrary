"use server";

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); // Ambil user

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan!" }, { status: 401 });
  }

  const { bookId } = await req.json();
  const userId = user.id; // Gunakan ID user dari auth

  console.log("User ID:", userId);
  console.log("Book ID:", bookId);

  // Cek apakah buku sedang dipinjam
  const { data: loans, error: bookError } = await supabase
    .from("loans")
    .select("loanid, loan_date, loan_return")
    .eq("bookid", bookId)
    .is("loan_return", null);

  if (bookError) {
    return NextResponse.json({ error: `Gagal mengambil data buku! ${bookError.message}` }, { status: 500 });
  }

  if (loans.length > 0) {
    return NextResponse.json({ error: "Buku sedang dipinjam!" }, { status: 400 });
  }

  // Insert ke tabel loans
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert([{ userid: userId, bookid: bookId }])
    .select()
    .single();

  if (loanError) {
    return NextResponse.json({ error: `Gagal meminjam buku! ${loanError.message}` }, { status: 400 });
  }

  console.log("Loan Insert Response:", loan);

  // **Update status buku menjadi tidak tersedia**
  const { error: updateError } = await supabase
    .from("books")
    .update({ available: false })
    .eq("bookid", bookId);

  if (updateError) {
    console.error("Update Book Status Error:", updateError);
    return NextResponse.json({ error: "Gagal memperbarui status buku." }, { status: 500 });
  }

  return NextResponse.json({ message: "Buku berhasil dipinjam!", data: loan });
}
