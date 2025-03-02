"use server";

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
    
  // Cek apakah loan valid dan belum dikembalikan
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .select('bookid, loan_return')
    .eq('loanid', params.id)
    .single();

  if (loanError || !loan) {
    return NextResponse.json({ error: "Data peminjaman tidak ditemukan." }, { status: 404 });
  }

  if (loan.loan_return) {
    return NextResponse.json({ error: "Buku sudah dikembalikan sebelumnya." }, { status: 400 });
  }

  // Update loan_return sebagai waktu pengembalian
  const { error: updateLoanError } = await supabase
    .from('loans')
    .update({ loan_return: new Date().toISOString() })
    .eq('loanid', params.id);

  if (updateLoanError) {
    return NextResponse.json({ error: updateLoanError.message }, { status: 400 });
  }

  // Update status buku menjadi tersedia kembali
  const { error: updateBookError } = await supabase
    .from('books')
    .update({ available: true })
    .eq('bookid', loan.bookid);

  if (updateBookError) {
    return NextResponse.json({ error: "Gagal memperbarui status buku." }, { status: 500 });
  }

  return NextResponse.json({ message: "Buku berhasil dikembalikan!" });
}
