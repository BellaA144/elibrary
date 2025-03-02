'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Snackbar, Alert } from '@mui/material'
import { login, signup } from './actions'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { OAuthButtons } from './oauth-signin'

export default function LoginPage() {
    const [message, setMessage] = useState<string | null>(null)
    const [severity, setSeverity] = useState<'success' | 'error' | null>(null)
    const router = useRouter()
    
    // State untuk kontrol visibilitas password
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (event: any) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const result = await login(formData)
    
        if (result.success) {
            setSeverity('success')
            setMessage(result.message)
            router.replace(result.role === 'admin' ? '/admin' : '/');
            router.refresh()
        } else {
            setSeverity('error')
            setMessage(result.message)
        }
    }
    

    const handleSignup = async (event: any) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("email", (document.getElementById("email") as HTMLInputElement)?.value || "");
        formData.append("password", (document.getElementById("password") as HTMLInputElement)?.value || "");
    
        const result = await signup(formData);
    
        if (result.success) {
            setSeverity('success');
            setMessage(result.message);
        } else {
            setSeverity('error');
            setMessage(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen text-black bg-cover bg-center bg-no-repeat relative" 
            style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNZAJohUN4g-7jexCXwzNA42s0QmLUf2o8LA&s')" }}>
            <div className="absolute inset-0 bg-black bg-opacity-40"></div> 
            <div className="relative z-10 container grid gap-4 w-[400px] p-4 bg-white bg-opacity-30 backdrop-blur-lg rounded shadow-lg">
                <h1 className='text-2xl font-bold text-center'>Login</h1>
                <form onSubmit={handleLogin} className='flex flex-col gap-2'>
                    <label>Email</label>
                    <input className='bg-slate-200 border border-slate-600 rounded-md p-1'
                        id="email" 
                        name="email" 
                        type="email" 
                        autoComplete="email"
                        placeholder='someone@gmail.com'
                        required 
                    />
                    
                    <label>Password</label>
                    <div className="relative">
                        <input 
                            className="bg-slate-200 border border-slate-600 rounded-md p-1 w-full pr-10"
                            id="password" 
                            name="password" 
                            type={showPassword ? "text" : "password"} 
                            minLength={6}
                            autoComplete="current-password"
                            placeholder='StrongPassword123!'
                            required 
                        />
                        {/* Tombol show/hide password */}
                        <button
                            type="button"
                            className="absolute inset-y-0 right-2 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </button>
                    </div>

                    <button className='bg-black hover:bg-gray-400 text-white font-bold py-2 px-4 rounded' type="submit">Log in</button>
                </form>
                <OAuthButtons/>
                <div className='flex justify-center gap-2'>
                    <p>Don't have an account?</p>
                    <button className='underline text-slate-800' onClick={handleSignup}>
                        Sign up
                    </button>
                </div>
            </div>

            {/* Snackbar for alerts */}
            <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage(null)}>
                <Alert onClose={() => setMessage(null)} severity={severity || 'info'} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    )
}