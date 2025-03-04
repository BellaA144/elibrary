'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';

export async function login(formData: FormData) {
  console.log("Trying Login....");
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log("User Not Found");
    return { success: false, message: "Could not authenticate user" };
  }

  console.log("User Found");

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    console.log("Failed to get authenticated user");
    return { success: false, message: "Could not retrieve user data" };
  }

  console.log("User Authenticated");
  const userId = authData.user.id;
  console.log("User ID:", userId);

  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('userid', userId) 
    .single();

  if (roleError || !userData) {
    console.log("No user role found");
    return { success: false, message: "Failed to retrieve user role" };
  }

  const userRole = userData.role;

  await supabase.auth.updateUser({
    data: { role: userRole }
  });

  console.log("Found user role:", userRole);

  revalidatePath('/', 'layout');

  return { success: true, message: "Login successful", role: userRole };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log("Signup attempt with:", { email, password });

  if (!email || !password) {
    console.error("Missing email or password");
    return { success: false, message: "Email and password are required." };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("SignUp Error:", error.message);
      return { success: false, message: error.message };
    }

    console.log("SignUp Success:", data);

    revalidatePath('/login', 'layout');

    return { success: true, message: "Signup successful! Please check your email for verification." };
  } catch (err: any) {
    console.error("Unexpected Error:", err.message);
    return { success: false, message: "Unexpected error during signup." };
  }
}


export async function oAuthSignIn(provider: Provider) {
  console.log("🔍 Attempting OAuth sign-in with provider:", provider);
  
  if (!provider) {
    return { success: false, message: "Provider not found" };
  }

  const supabase = await createClient();
  const redirectUrl = getURL("/auth/callback")
  const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
          redirectTo: redirectUrl,
      }
  })

  console.log("OAuth Data:", data);
  console.log("OAuth Error:", error);

  if (error) {
    return { success: false, message: "Could not sign in" };
  }

  return { success: true, url: data.url };
}
