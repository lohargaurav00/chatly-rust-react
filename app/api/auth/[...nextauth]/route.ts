import NextAuth from "next-auth";

import { authConfig } from "@/configs";

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
