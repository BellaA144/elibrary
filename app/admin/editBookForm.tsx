"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button, TextField, Snackbar, Alert } from "@mui/material";

type BookData = {
  bookid: string;
  title: string;
  author: string;
  category: string;
  published_year: number;
  description: string;
  cover_url: string;
};

export default function EditBookForm({ book, onCancel, onSave }: { book: BookData; onCancel: () => void; onSave: () => void }) {
  const supabase = createClientComponentClient();
  const [form, setForm] = useState(book);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
  
    const updatedBook = {
      title: form.title,
      author: form.author,
      category: form.category,
      published_year: Number(form.published_year),
      description: form.description,
      cover_url: form.cover_url,
    };
  
    const { error } = await supabase
      .from("books")
      .update(updatedBook)
      .eq("bookid", form.bookid)
      .select();
  
    setLoading(false);
  
    if (error) {
      console.log("Update Error:", error.message);
      setErrorMessage(`Gagal mengupdate buku: ${error.message}`);
      setSuccessMessage(null);
    } else {
      console.log("Update Success");
      setSuccessMessage("Buku berhasil diperbarui!");
      setErrorMessage(null);
      
      // Biarkan Snackbar tampil selama beberapa detik sebelum menutup modal
      setOpenSnackbar(true);
  
      setTimeout(() => {
        onSave();
        onCancel();
      }, 2000); // Tambahkan delay sebelum form ditutup
    }
  }  

  useEffect(() => {
    console.log("Success:", successMessage);
    console.log("Error:", errorMessage);
  }, [successMessage, errorMessage]);

  return (
    <div className="bg-white p-4 rounded shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">✏️ Edit Buku</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <TextField label="Judul" name="title" fullWidth value={form.title} onChange={handleChange} required />
        <TextField label="Penulis" name="author" fullWidth value={form.author} onChange={handleChange} required />
        <TextField label="Kategori" name="category" fullWidth value={form.category} onChange={handleChange} required />
        <TextField label="Tahun" name="published_year" type="number" fullWidth value={form.published_year} onChange={handleChange} required />
        <TextField label="Deskripsi" name="description" multiline rows={3} fullWidth value={form.description} onChange={handleChange} />
        <TextField label="Cover URL" name="cover_url" fullWidth value={form.cover_url} onChange={handleChange} />

        <div className="flex justify-between">
          <Button variant="outlined" onClick={onCancel}>❌ Batal</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "💾 Save"}
          </Button>
        </div>
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
      >
        {successMessage || errorMessage ? (
          <Alert severity={successMessage ? "success" : "error"} onClose={() => setOpenSnackbar(false)}>
            {successMessage || errorMessage}
          </Alert>
        ) : undefined}
      </Snackbar>
    </div>
  );
}
