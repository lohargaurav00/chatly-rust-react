"/configs/auth.ts";

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DefaultSession, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

import prisma from "@/lib/prisma";
import { UserT } from "@/utils"

declare module "next-auth" {
  interface Session {
    user: UserT & DefaultSession["user"];
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        isSignUp: { label: "Sign Up", type: "hidden" },
      },
      async authorize(credentials) {
        const { name, email, username, password, isSignUp } = credentials as {
          name: string;
          email: string;
          username: string;
          password: string;
          isSignUp?: string;
        };

        try {
          if (isSignUp) {
            if (!name || !email || !username || !password) {
              throw new Error("All Fields are required");
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(password, salt);

            const newUser = await prisma.users.create({
              data: {
                name,
                email,
                user_name: username,
                password: hashedPass,
              },
            });

            await prisma.room_users.create({
              data: {
                room_id: 0,
                user_id: newUser.id,
              },
            });

            return newUser as User;
          }

          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          const user = await prisma.users.findFirst({
            where: { email },
          });

          if (!user) {
            throw new Error(`No user found with associated email: ${email}`);
          }

          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (!isPasswordMatch) {
            throw new Error(`Invalid password: ${password}`);
          }

          if (user && isPasswordMatch) {
            console.log(user);
            return user as User;
          }

          return null;
        } catch (error: any) {
          console.error("Error during authentication:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: UserT }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.user_name = user.user_name;
        token.image = user.image;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user && token) {
        session.user.id = token.sub as string;
        session.user.user_name = token.user_name as string;
      }

      return session;
    },
  },
  pages: {
    signIn: "/signup",
  },
};
