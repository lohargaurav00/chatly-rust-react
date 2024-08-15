import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { User } from "next-auth";

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
            console.log("newUser", newUser);
            return newUser as User;
          }

          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          const user = await prisma.users.findFirst({
            where: { email },
          });
          console.log("user", user);

          if (!user) {
            throw new Error(`No user found with associated email: ${email}`);
          }

          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (!isPasswordMatch) {
            throw new Error(`Invalid password: ${password}`);
          }

          if (user && isPasswordMatch) {
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
  pages: {
    signIn: "/signup",
  },
};
