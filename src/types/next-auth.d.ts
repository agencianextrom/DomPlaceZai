import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      avatar?: string | null
      phone?: string | null
      name?: string | null
      email?: string | null
    }
  }

  interface User {
    id: string
    role: string
    avatar?: string | null
    phone?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    avatar?: string | null
    phone?: string | null
  }
}
