"use client";

import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

export default function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center">
        <CircularProgress />
      </div>
    }>
      {children}
    </Suspense>
  );
}
