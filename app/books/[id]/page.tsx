import { fetchBookDetail } from "@/app/books/actions";
import { Button, Card, CardContent, CardMedia, CircularProgress, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const book = await fetchBookDetail(params.id);

  if (!book) {
    return notFound();
  }

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
            <Card sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
              <CardMedia
                component="img"
                height="250"
                image={book.cover_url || "https://via.placeholder.com/250x350"}
                alt={book.title}
                sx={{ width: "200px", borderRadius: "8px", mb: 3 }}
              />
              <CardContent className="text-center">
                <Typography variant="h4" className="font-bold mb-2">{book.title}</Typography>
                <Typography variant="h6" color="text.secondary">Author: {book.author}</Typography>
                <Typography variant="body1" color="text.secondary">Category: {book.category}</Typography>
                <Typography variant="body2" className="mt-4">
                  {book.description || "No description available."}
                </Typography>
              </CardContent>
            </Card>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
