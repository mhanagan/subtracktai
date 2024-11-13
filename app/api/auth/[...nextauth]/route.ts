import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

// Create a connection pool
const pool = createPool({
  connectionString: process.env.POSTGRES_PRISMA_URL
});

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          );

          const user = rows[0];

          if (!user || !user.password) {
            throw new Error('No user found with this email');
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordMatch) {
            throw new Error('Incorrect password');
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    resetPassword: '/auth/reset-password',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST }; 