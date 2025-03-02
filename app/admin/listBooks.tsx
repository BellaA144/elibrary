"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Button, Card, CardContent, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import EditBookForm from "./editBookForm";

type BookData = {
  bookid: string;
  title: string;
  author: string;
  category: string;
  published_year: number;
  description: string;
  cover_url: string;
};

export default function ListBooks() {
  const supabase = createClientComponentClient();
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [editBook, setEditBook] = useState<BookData | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  const limit = 4;

  async function fetchBooks() {
    setLoading(true);
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from("books")
      .select("bookid, title, author, category, published_year, description, cover_url", { count: "exact" })
      .order("published_year", { ascending: false })
      .range(start, end);

    if (error) {
      console.error("Error fetching books:", error.message);
      setBooks([]);
    } else {
      setBooks(data || []);
    }

    const { count, error: countError } = await supabase.from("books").select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching book count:", countError.message);
    } else {
      setTotalBooks(count || 0);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchBooks();
  }, [page]);

  async function handleDeleteBook(bookid: string) {
    if (!confirm("⚠️ Apakah kamu yakin ingin menghapus buku ini?")) return;

    const { error } = await supabase.from("books").delete().eq("bookid", bookid);

    if (error) {
      setSnackbarMessage(`Gagal menghapus buku: ${error.message}`);
      setSnackbarType("error");
    } else {
      setSnackbarMessage("Buku berhasil dihapus!");
      setSnackbarType("success");
      fetchBooks();
    }
  }

  return (
    <div className="p-4">
      {editBook ? (
        <EditBookForm book={editBook} onCancel={() => setEditBook(null)} onSave={fetchBooks} />
      ) : loading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <Card key={book.bookid} className="shadow-lg p-3 h-[65vh] flex flex-col">
              <div className="flex justify-center">
                <img src={book.cover_url} alt={book.title} className="h-48 w-[120px] rounded-md" />
              </div>
              <CardContent className="flex flex-col flex-grow">
                <Typography variant="h6" className="font-bold">{book.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ✍️ {book.author} - 📃 {book.published_year}
                </Typography>
                <Typography variant="body2" className="text-gray-700">
                  {book.category}
                </Typography>

                <div className="flex justify-between mt-auto">
                  <Button variant="outlined" color="primary" onClick={() => setEditBook(book)}>
                    ✏️ Edit
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteBook(book.bookid)}>
                    🗑 Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!editBook && (
        <div className="flex justify-center mt-14 space-x-4">
          <Button variant="contained" sx={{ backgroundColor: "rgb(146 64 14)" }} disabled={page === 1} onClick={() => setPage(page - 1)}>
            ⬅️ Previous
          </Button>
          <Typography variant="body1" className="font-semibold">
            Page {page}
          </Typography>
          <Button variant="contained" sx={{ backgroundColor: "rgb(146 64 14)" }} disabled={page * limit >= totalBooks} onClick={() => setPage(page + 1)}>
            Next ➡️
          </Button>
        </div>
      )}

      {/* Snackbar untuk Notifikasi */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
      >
        <Alert
          severity={snackbarType}
          onClose={() => setSnackbarMessage(null)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
