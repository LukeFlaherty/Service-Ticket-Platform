import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
