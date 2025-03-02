"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Snackbar, Alert } from "@mui/material";
import { supabase } from "@/utils/supabase/client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { OAuthButtons } from "./oauth-signin";
import { signup } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      console.log('🔄 Trying Login...');
  
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      console.log(`✅ Status: ${res.status}`);
      console.log(`✅ OK: ${res.ok}`);
  
      const text = await res.text();
      console.log(`✅ Raw Response Body: ${text}`);
  
      const data = JSON.parse(text);
      console.log(`✅ Parsed Result:`, data);
  
      if (!res.ok) throw new Error(data.error || 'Login failed');
  
      // ✅ SET SESSION SUPABASE
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
  
      setSuccess("Login successful!");
  
      // ✅ REDIRECT BERDASARKAN ROLE
      router.replace(data.role === "admin" ? "/admin" : "/");
      router.refresh();
    } catch (err: any) {
      console.error(`❌ Login Error: ${err.message}`);
      setError(err.message || "Login failed");
    }
  
    setLoading(false);
  };
  
  const handleSignup = async () => {
    const formData = new FormData();
    formData.append(
      "email",
      (document.getElementById("email") as HTMLInputElement)?.value || ""
    );
    formData.append(
      "password",
      (document.getElementById("password") as HTMLInputElement)?.value || ""
    );

    const result = await signup(formData);

    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen text-black bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage:
          "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNZAJohUN4g-7jexCXwzNA42s0QmLUf2o8LA&s')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 container grid gap-4 w-[400px] p-4 bg-white bg-opacity-30 backdrop-blur-lg rounded shadow-lg">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <form onSubmit={handleLogin}
            className="flex flex-col gap-2"
            >
            <label>Email</label>
            <input
                className="bg-slate-200 border border-slate-600 rounded-md p-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="someone@gmail.com"
                required
            />

            <label>Password</label>
            <div className="relative">
                <input
                className="bg-slate-200 border border-slate-600 rounded-md p-1 w-full pr-10"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                autoComplete="current-password"
                placeholder="StrongPassword123!"
                required
                />
                <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                >
                {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
            </div>

            <button
                type="submit"
                className="bg-black hover:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Log in"}
            </button>
            </form>
        <OAuthButtons />
        <div className="flex justify-center gap-2">
          <p>Don't have an account?</p>
          <button
            className="underline text-slate-800"
            onClick={handleSignup}
          >
            Sign up
          </button>
        </div>
      </div>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={3000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </div>
  );
}
