// books/[id]/page.tsx
import BookDetail from "./bookDetail";
import { Button, CircularProgress } from "@mui/material";
import { Suspense } from "react";

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const id = params.id; // Ini cukup, karena page udah async

  return (
    <div>
      {/* Sidebar Navbar */}
      <div className="w-1/6 bg-amber-900 h-[92.5vh] text-black p-6 fixed left-0 top-18 opacity-90 flex flex-col justify-between">
        <nav className="space-y-6">
          <Button
            variant="contained"
            fullWidth
            href="/"
            sx={{
              bgcolor: "rgb(146 64 14)",
              color: "white",
              "&:hover": { bgcolor: "rgb(120 53 15)" },
            }}
          >
            📚 Back to Books
          </Button>
        </nav>
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
        <div className="bg-white/30 backdrop-blur-md p-6 z-10 w-[50vw] rounded shadow-lg">
          <Suspense fallback={<CircularProgress />}>
            <BookDetail id={id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
