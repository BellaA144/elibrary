"use server"

import { createClient } from "@/utils/supabase/server"; 

export async function POST(req: Request) {
  const supabase = await createClient();
  const { loanId } = await req.json();

  if (!loanId) {
    return new Response(JSON.stringify({ error: "Missing loanId" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("loans")
    .update({ loan_return: new Date().toISOString() })
    .eq("id", loanId)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Book returned successfully", data }), { status: 200 });
}
