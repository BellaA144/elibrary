"use client"

import { GitHub } from "@mui/icons-material"
import { Button } from "@mui/material"
import { Provider } from "@supabase/supabase-js"
import { JSX, useState, useEffect } from "react" 
import { oAuthSignIn } from "./actions"

type OAuthProvider = {
    name: Provider;
    displayName: string;
    icon?: JSX.Element;
  };
  
  export function OAuthButtons() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const oAuthProviders: OAuthProvider[] = [
      {
        name: "github" as Provider,
        displayName: "GitHub",
        icon: <GitHub className="size-5" />,
      },
    ];
  
    return (
    <>
      <Button
        key="github"
        className="w-full flex items-center justify-center gap-2"
        variant="contained"
        sx={{
          backgroundColor: mounted ? "black" : "gray",
          color: "white",
          "&:hover": { backgroundColor: "gray" },
        }}
        onClick={async () => {
          await oAuthSignIn("github");
        }}
      >
        <GitHub className="size-5" />
        Login with Github
      </Button>
    </>
  );
  }