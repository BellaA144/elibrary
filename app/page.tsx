"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import { fetchBooks, fetchCategories, fetchLoans } from "@/app/books/actions";
import BookList from "@/app/components/BookList";
import SuspenseWrapper from "@/app/components/SuspenseWrapper";
import { supabase } from "@/utils/supabase/client";

export default function BooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [view, setView] = useState<"list" | "loans">("list");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<any[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [loading, setLoading] = useState(true);
  const limit = 4; // Buku per halaman
  const [loans, setLoans] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
      if (error) {
        console.log("Error fetching user:", error.message);
      }
    };
    fetchUser();
  }, []);

  console.log("user:", user);

  useEffect(() => { // buat ngeload buku
    async function loadBooks() {
      setLoading(true);
      const { books, totalBooks } = await fetchBooks(search, selectedCategory, page, limit);
      setBooks(books);
      setTotalBooks(totalBooks);
      setLoading(false);
    }
    loadBooks();
  }, [search, selectedCategory, page]);

  useEffect(() => { // buat ngeload kategori buku
    async function loadCategories() {
      const categories = await fetchCategories();
      setCategories(categories);
    }
    loadCategories();
  }, []);

  useEffect(() => { // buat ngeload pinjaman
    async function loadLoans() {
      const loans = await fetchLoans();
      setLoans(loans);
    }
    loadLoans();
  }, []);

  async function handleSignOut() {
    console.log("Signing out...");
    await router.replace('/api/logout'); // Ensure the sign-out process completes

    // Give time for cookies to be cleared properly before redirecting
    setTimeout(() => {
        router.push('/login'); // After a short delay, send the user to the login page
    }, 500); // 500ms delay to ensure cookies are cleared
  }

  
  return (
    <div>
      {/* Sidebar Navbar */}
      <div className="w-1/6 bg-amber-900 h-[92.5vh] text-black p-6 fixed left-0 top-18 opacity-90 flex flex-col justify-between">
        <nav className="space-y-6">
          <Button
            variant="contained"
            fullWidth
            onClick={() => setView("list")}
            sx={{
              bgcolor: view === "list" ? "white" : "rgb(146 64 14)",
              color: view === "list" ? "black" : "white",
              "&:hover": { bgcolor: view === "list" ? "white" : "rgb(120 53 15)" },
            }}
          >
            📚 Book Lists
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setView("loans")}
            sx={{
              bgcolor: view === "loans" ? "white" : "rgb(146 64 14)",
              color: view === "loans" ? "black" : "white",
              "&:hover": { bgcolor: view === "loans" ? "white" : "rgb(120 53 15)" },
            }}
          >
            📖 BOOKLOANS
          </Button>
        </nav>

        {/* Sign Out */}
        <div className="border-t border-black pt-4">
          <button
            onClick={handleSignOut}
            className="w-full text-left text-lg font-semibold hover:text-gray-600"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="ml-[16.66%] flex flex-col items-center justify-center min-h-screen text-black bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage:
            "url('https://static1.srcdn.com/wordpress/wp-content/uploads/2022/01/Genshin-Impact-Mondstadt-Library.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>
        <div className="bg-white/30 backdrop-blur-md p-6 z-10 w-[80vw] h-auto rounded">

          {view === "list" ? (
            <>
              <h1 className="text-3xl text-slate-950 font-bold text-center mb-6 border-b-2 border-gray-300 pb-2">
                E-Book Lists
              </h1>
              {/* Search & Filtering */}
              <div className="mb-4 flex gap-4">
                <TextField
                  label="Search books..."
                  variant="outlined"
                  fullWidth
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <TextField
                  select
                  label="Filter by Category"
                  variant="outlined"
                  fullWidth
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat, index) => (
                    <MenuItem key={index} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
          
              {/* Book List with Suspense */}
              <SuspenseWrapper>
                {books.length > 0 ? <BookList books={books} /> : <p className="text-center text-white">No books found.</p>}
              </SuspenseWrapper>
          
              {/* Pagination */}
              <div className="flex justify-center mt-6 space-x-4">
                <Button
                  variant="contained"
                  sx={{ bgcolor: "rgb(146 64 14)", color: "white", "&:hover": { bgcolor: "rgb(120 53 15)" } }}
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ⬅️ Previous
                </Button>
                <Typography variant="body1" className="font-semibold">Page {page}</Typography>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "rgb(146 64 14)", color: "white", "&:hover": { bgcolor: "rgb(120 53 15)" } }}
                  disabled={page * limit >= totalBooks}
                  onClick={() => setPage(page + 1)}
                >
                  Next ➡️
                </Button>
              </div>
            </>
          ) : (
            <>
             {/* Menampilkan buku yang sedang dipinjam oleh user  */}
             <h1 className="text-3xl text-slate-950 font-bold text-center mb-6 border-b-2 border-gray-300 pb-2">
                BookLoans
              </h1>
              {/* Check if loans data is empty */}
              {loans.length === 0 ? (
                <p className="text-center text-white">No books are currently loaned.</p>
              ) : (
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">User Email</th>
                      <th className="py-2 px-4 text-left">Book Title</th>
                      <th className="py-2 px-4 text-left">Loan Date</th>
                      <th className="py-2 px-4 text-left">Loan Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.loanid} className="border-b">
                        <td className="py-2 px-4">{loan.users?.email || "Other Users"}</td>
                        <td className="py-2 px-4">{loan.books?.title || "Unknown Title"}</td>
                        <td className="py-2 px-4">{new Date(loan.loan_date).toLocaleDateString()}</td>
                        <td className="py-2 px-4">{loan.loan_return ? new Date(loan.loan_return).toLocaleDateString() : "Not Returned"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}                      
        </div>
      </div>
    </div>
  );
}
