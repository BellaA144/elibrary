"use client";

import { useRouter } from "next/navigation";
import { 
  Button, Card, CardContent, CardMedia, CircularProgress, Typography, 
  Snackbar, Alert 
} from "@mui/material";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";

type Book = {
  bookid: number;
  title: string;
  author: string;
  category: string;
  cover_url?: string;
  available: boolean;
};

export default function BookList({ books }: { books: Book[] }) {
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);

  async function handleLoan(bookid: number) {
    setLoading(bookid);
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session?.user.id, bookId: bookid }),
    });
    setLoading(null);
    
    if (!res.ok) {
      setErrorOpen(true); 
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.length > 0 ? (
          books.map((book) => (
            <Card key={book.bookid} sx={{ maxWidth: 250 }}>
              <CardMedia
                component="img"
                height="140"
                image={book.cover_url || "https://via.placeholder.com/140x200"}
                alt={book.title}
              />
              <CardContent className="flex flex-col h-30">
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  className="cursor-pointer text-black hover:underline"
                  onClick={() => router.push(`/books/${book.bookid}`)}
                >
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">Author: {book.author}</Typography>
                <Typography variant="body2" color="text.secondary">Category: {book.category}</Typography>
              </CardContent>
              {book.available ? (
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => handleLoan(book.bookid)}
                  disabled={loading === book.bookid}
                  className="left-4 bottom-2"
                  sx={{ 
                    bgcolor: "rgb(146, 64, 14)", 
                    "&:hover": { bgcolor: "rgb(120, 50, 10)" }, 
                    "&.Mui-disabled": { bgcolor: "gray", color: "white" } 
                  }}
                >
                  {loading === book.bookid ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Borrow"
                  )}
                </Button>
              ) : (
                <Typography variant="body2" color="error" className="mt-2 ml-4">
                  Not Available
                </Typography>
              )}
            </Card>
          ))
        ) : (
          <p className="text-center text-white">No books found.</p>
        )}
      </div>

      {/* Snackbar Error */}
      <Snackbar 
        open={errorOpen} 
        autoHideDuration={4000} 
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorOpen(false)} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Failed to borrow books!
        </Alert>
      </Snackbar>
    </>
  );
}
