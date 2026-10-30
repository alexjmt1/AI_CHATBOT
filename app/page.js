import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Chat from "./Chat";
import { COOKIE_NAME, verifyToken } from "../lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const jar = await cookies();
  if (!verifyToken(jar.get(COOKIE_NAME)?.value)) redirect("/login");
  return <Chat />;
}
