import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { name, email, username, password } = credentials as {
          name: string;
          email: string;
          username: string;
          password: string;
        };

        if (!name || !email || !username || !password) {
          return null;
        }

        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPass = await bcrypt.hash(password, salt);

          console.log("Hashed password:", hashedPass);

          return null;
        } catch (error) {
          console.error("Error hashing password:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/signup",
  },
};
