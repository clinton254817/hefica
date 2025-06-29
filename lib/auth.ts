import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "./authOptions"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/") // Changed from "/" to "/auth" to match your sign-in page
  }
  return user
}

// Client-side auth utilities
export const authConfig = {
  signInUrl: "/auth", // Make sure this matches your actual sign-in page
  dashboardUrl: "/dashboard",
  
  // Password validation
  validatePassword: (password: string) => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },
  
  // Email validation
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}