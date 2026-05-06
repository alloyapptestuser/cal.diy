/**
 * Auto-login endpoint for the Alloy preview environment.
 *
 * Behind a strict `IS_ALLOY === "true"` guard, looks up the seeded demo user,
 * mints a NextAuth-compatible JWT, sets it as the session cookie, and
 * redirects to `/`. On any other deployment this returns 404 to keep the
 * surface area zero in production builds.
 */
import { defaultCookies } from "@calcom/lib/default-cookies";
import { WEBAPP_URL } from "@calcom/lib/constants";
import prisma from "@calcom/prisma";
import { encode } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const ALLOY_DEMO_EMAIL = "alloy@example.com";
const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

async function handler(req: NextRequest) {
  if (process.env.IS_ALLOY !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "NEXTAUTH_SECRET is not configured" }, { status: 500 });
  }

  const user = await prisma.user.findUnique({
    where: { email: ALLOY_DEMO_EMAIL },
    select: { id: true, email: true, username: true, name: true, role: true, locale: true },
  });

  if (!user) {
    return NextResponse.json(
      {
        message:
          "Alloy demo user not seeded yet. Run `ts-node .alloy/seed-alloy-user.ts` (or restart the web container).",
      },
      { status: 503 }
    );
  }

  // Minimal token. The jwt() callback's autoMergeIdentities path will hydrate
  // the rest (profileId, upId, org, etc.) on the next request based on email.
  const token = {
    sub: String(user.id),
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    locale: user.locale ?? "en",
  };

  const encoded = await encode({ token, secret, maxAge: THIRTY_DAYS_SECONDS });

  const useSecureCookies = WEBAPP_URL?.startsWith("https://") ?? false;
  const { sessionToken } = defaultCookies(useSecureCookies);

  // Redirect target — honor ?callbackUrl when supplied, otherwise go home.
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
  const target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
  const redirectUrl = new URL(target, req.nextUrl.origin);

  const response = NextResponse.redirect(redirectUrl, { status: 302 });
  response.cookies.set(sessionToken.name, encoded, {
    ...sessionToken.options,
    maxAge: THIRTY_DAYS_SECONDS,
  });
  return response;
}

export const GET = handler;
export const POST = handler;
