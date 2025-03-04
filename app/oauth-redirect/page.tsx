"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OAuthRedirect() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/auth/token");
            const data = await res.json();

            console.log("🔑 Token from API:", data);

            if (!data.access_token) {
                router.replace("/login?message=Session expired");
            } else {
                router.replace("/");
            }

            setLoading(false);
        })();
    }, [router]);

    return <p>{loading ? "Logging in..." : "Redirecting..."}</p>;
}
