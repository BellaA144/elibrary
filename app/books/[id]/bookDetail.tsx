import { fetchBookDetail } from "@/app/books/actions";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";

export default async function BookDetail({ id }: { id: string }) {
  const book = await fetchBookDetail(id);

  if (!book) {
    return (
      <Typography variant="h5" color="error">
        Book not found.
      </Typography>
    );
  }

  return (
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
  );
}
