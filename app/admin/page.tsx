"use client";

import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import AddBookForm from "./addBookForm";
import { Button, CircularProgress } from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import ListBooks from "./listBooks";

type BookData = {
  bookid: string;
  title: string;
  author: string;
  category: string;
  year: number;
  description: string;
  cover_url: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'add' | 'list'>('list');
  const [user, setUser] = useState<any>(null);

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase.from("books").select("*");

    if (error) {
      console.error("Error fetching books:", error.message);
      setBooks([]);
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        if (user.user_metadata.role !== "admin") {
          router.replace("/");
        } else {
          setUser(user);
        }
      }
      if (error) {
        console.log("Error fetching user:", error.message);
        router.replace("/login");
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleSignOut() {
    console.log("Signing out...");
    await router.replace('/api/logout'); 

    
    setTimeout(() => {
        router.push('/login'); 
    }, 500);
  }

  return (
    <div>
      {/* Sidebar Navbar */}
      <div className="w-1/6 bg-amber-900 h-[92.5vh] text-black p-6 fixed left-0 top-18 opacity-90 flex flex-col justify-between">
        <nav className="space-y-6">
          <Button
            variant="contained"
            fullWidth
            onClick={() => setView('add')}
            sx={{
              bgcolor: view === 'add' ? 'white' : 'rgb(146 64 14)',
              color: view === 'add' ? 'black' : 'white',
              '&:hover': {
                bgcolor: view === 'add' ? 'white' : 'rgb(120 53 15)'
              }
            }}
          >
            🛠 ADMIN BOARD
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setView('list')}
            sx={{
              bgcolor: view === 'list' ? 'white' : 'rgb(146 64 14)',
              color: view === 'list' ? 'black' : 'white',
              '&:hover': {
                bgcolor: view === 'list' ? 'white' : 'rgb(120 53 15)'
              }
            }}
          >
            📚 BOOK LIST
          </Button>
        </nav>

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
        className="ml-[16.66%] flex items-center justify-center h-screen text-black bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('https://static1.srcdn.com/wordpress/wp-content/uploads/2022/01/Genshin-Impact-Mondstadt-Library.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div> 
        <div className="bg-white/30 backdrop-blur-md p-6 z-10 w-[80vw] h-[95vh] rounded">
          <h1 className="text-3xl text-slate-950 font-bold text-center mb-6 border-b-2 border-gray-300 pb-2">
            Admin Dashboard
          </h1>
          {view === 'add' ? (
            <AddBookForm 
              onBookAdded={() => fetchBooks()} 
              onCancel={() => setView("list")}
            />
          ) : (
            <Suspense fallback={<p className="text-center">Loading books...</p>}>
              <ListBooks />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}