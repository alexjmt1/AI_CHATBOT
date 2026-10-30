import { cookies } from "next/headers";
import { COOKIE_MAX_AGE, COOKIE_NAME, authConfigured, makeToken, safeEqual } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!authConfigured()) {
    return Response.json(
      { error: "Server login is not configured. Set APP_USERNAME and APP_PASSWORD." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const okUser = safeEqual(body?.username ?? "", process.env.APP_USERNAME);
  const okPass = safeEqual(body?.password ?? "", process.env.APP_PASSWORD);

  if (!(okUser && okPass)) {
    await new Promise((r) => setTimeout(r, 900)); // slow down guessing
    return Response.json({ error: "Wrong username or password." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return Response.json({ ok: true });
}
