"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button, TextField, CircularProgress, Autocomplete, Snackbar, Alert } from "@mui/material";

const defaultCategories = ["Fiction", "Non-Fiction", "Fantasy", "Science", "History"];

type AddBookFormProps = {
  onBookAdded: () => void;
  onCancel: () => void;
};

export default function AddBookForm({ onBookAdded, onCancel }: AddBookFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    published_year: "",
    description: "",
    cover_url: "",
  });

  // State untuk menampilkan Snackbar (MUI Alert)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("books").insert([{ ...form, published_year: Number(form.published_year) }]);

    if (error) {
      setErrorMessage(`Gagal menambahkan buku: ${error.message}`);
    } else {
      setSuccessMessage("Buku berhasil ditambahkan!");
      onBookAdded();
    }
    setLoading(false);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">Add New Book</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <TextField label="Judul" name="title" fullWidth required value={form.title} onChange={handleChange} />
        <TextField label="Penulis" name="author" fullWidth required value={form.author} onChange={handleChange} />
        
        {/* Input Kategori dengan Autocomplete */}
        <Autocomplete
          freeSolo
          options={defaultCategories}
          value={form.category}
          onInputChange={(_, newValue) => setForm((prev) => ({ ...prev, category: newValue }))}
          renderInput={(params) => <TextField {...params} label="Kategori" name="category" fullWidth required />}
        />

        <TextField
          label="Tahun Terbit"
          name="published_year"
          type="number"
          fullWidth
          required
          value={form.published_year}
          onChange={handleChange}
        />
        <TextField
          label="Deskripsi"
          name="description"
          multiline
          rows={3}
          fullWidth
          required
          value={form.description}
          onChange={handleChange}
        />
        <TextField
          label="URL Cover Buku"
          name="cover_url"
          fullWidth
          required
          value={form.cover_url}
          onChange={handleChange}
        />
        <div className="flex justify-between mt-4">
          <Button variant="outlined" color="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Add Book"}
          </Button>
        </div>
      </form>

      {/* Snackbar untuk Alert */}
      {(successMessage || errorMessage) && (
      <Snackbar
        open
        autoHideDuration={4000}
        onClose={() => {
          setSuccessMessage(null);
          setErrorMessage(null);
        }}
      >
        <Alert
          severity={successMessage ? "success" : "error"}
          onClose={() => {
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
        >
          {successMessage || errorMessage}
        </Alert>
      </Snackbar>
    )}
    </div>
  );
}
