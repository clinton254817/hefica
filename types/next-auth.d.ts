import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
      avatar: string | null
    }
  }

  interface User {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
  }
}